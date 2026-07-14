import { Router, type IRouter } from "express";
import { db, usersTable, enrollmentsTable, completionLogsTable } from "@workspace/db";
import { eq, desc, sql, inArray } from "drizzle-orm";
import {
  GetLeaderboardQueryParams,
  GetLeaderboardResponse,
  GetMyRankQueryParams,
  GetMyRankResponse,
  GetChampionsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

export const CATEGORIES = ["daily", "weekly", "monthly", "awareness"] as const;
export type Category = (typeof CATEGORIES)[number];

// Rank 1-5 Marvel-themed titles, awarded per category leaderboard.
const RANK_TITLES: Record<number, string> = {
  1: "Sorcerer Supreme",
  2: "Thor, God of Thunder",
  3: "Super Soldier",
  4: "Gamma Ranger",
  5: "Friendly Neighborhood Spidey",
};

function getLevel(points: number): string {
  if (points >= 5000) return "Champion";
  if (points >= 2000) return "Guardian";
  if (points >= 500) return "Sapling";
  if (points >= 100) return "Sprout";
  return "Seedling";
}

function getBadge(points: number): string | null {
  if (points >= 5000) return "Planet Defender";
  if (points >= 2000) return "Climate Guardian";
  if (points >= 500) return "Eco Warrior";
  if (points >= 100) return "Green Sprout";
  return null;
}

async function buildOverallLeaderboard(limit = 50) {
  const users = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.points))
    .limit(limit);

  return Promise.all(
    users.map(async (u, idx) => {
      const [{ count }] = await db
        .select({ count: sql<number>`sum(${enrollmentsTable.completions})` })
        .from(enrollmentsTable)
        .where(eq(enrollmentsTable.userId, u.id));

      const completions = Number(count) || 0;

      return {
        rank: idx + 1,
        userId: u.id,
        name: u.name,
        avatarUrl: u.avatarUrl,
        points: u.points,
        completions,
        level: getLevel(u.points),
        badge: getBadge(u.points),
        title: null as string | null,
        isStoneCollector: false,
      };
    })
  );
}

// Category leaderboards rank users by points earned from missions in that
// category only (summed from completion_logs), not lifetime overall points.
async function buildCategoryLeaderboard(category: Category, limit = 50) {
  const rows = await db
    .select({
      userId: completionLogsTable.userId,
      points: sql<number>`sum(${completionLogsTable.pointsEarned})`.as("points"),
      completions: sql<number>`count(*)`.as("completions"),
    })
    .from(completionLogsTable)
    .where(eq(completionLogsTable.category, category))
    .groupBy(completionLogsTable.userId)
    .orderBy(desc(sql`sum(${completionLogsTable.pointsEarned})`))
    .limit(limit);

  if (rows.length === 0) return [];

  const userIds = rows.map((r) => r.userId);
  const users = await db.select().from(usersTable).where(inArray(usersTable.id, userIds));
  const userMap = new Map(users.map((u) => [u.id, u]));

  return rows.map((r, idx) => {
    const u = userMap.get(r.userId);
    const rank = idx + 1;
    return {
      rank,
      userId: r.userId,
      name: u?.name ?? "Unknown",
      avatarUrl: u?.avatarUrl ?? null,
      points: Number(r.points) || 0,
      completions: Number(r.completions) || 0,
      level: getLevel(u?.points ?? 0),
      badge: getBadge(u?.points ?? 0),
      title: RANK_TITLES[rank] ?? null,
      isStoneCollector: false,
    };
  });
}

// A user who holds rank #1 in every category leaderboard simultaneously
// collects all four "Infinity Stones" and earns the ultimate title.
async function findStoneCollector(): Promise<number | null> {
  const topPerCategory = await Promise.all(
    CATEGORIES.map(async (cat) => {
      const board = await buildCategoryLeaderboard(cat, 1);
      return board[0]?.userId ?? null;
    })
  );

  if (topPerCategory.some((id) => id === null)) return null;
  const first = topPerCategory[0];
  return topPerCategory.every((id) => id === first) ? first! : null;
}

router.get("/leaderboard", async (req, res): Promise<void> => {
  const params = GetLeaderboardQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const limit = params.data.limit ?? 50;
  const category = params.data.category as Category | undefined;

  const board = category
    ? await buildCategoryLeaderboard(category, limit)
    : await buildOverallLeaderboard(limit);

  if (category) {
    const stoneCollectorId = await findStoneCollector();
    if (stoneCollectorId !== null) {
      for (const entry of board) {
        if (entry.userId === stoneCollectorId) entry.isStoneCollector = true;
      }
    }
  }

  res.json(GetLeaderboardResponse.parse(board));
});

router.get("/leaderboard/me", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const params = GetMyRankQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const category = params.data.category as Category | undefined;

  if (category) {
    const board = await buildCategoryLeaderboard(category, 100000);
    const entry = board.find((e) => e.userId === req.session.userId);
    if (!entry) {
      res.json(
        GetMyRankResponse.parse({
          rank: 0,
          userId: req.session.userId,
          name: "",
          avatarUrl: null,
          points: 0,
          completions: 0,
          level: getLevel(0),
          badge: null,
          title: null,
          isStoneCollector: false,
        })
      );
      return;
    }
    res.json(GetMyRankResponse.parse(entry));
    return;
  }

  const allUsers = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.points));

  const rank = allUsers.findIndex((u) => u.id === req.session.userId) + 1;
  const user = allUsers.find((u) => u.id === req.session.userId);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [{ count }] = await db
    .select({ count: sql<number>`sum(${enrollmentsTable.completions})` })
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.userId, user.id));

  const completions = Number(count) || 0;

  res.json(
    GetMyRankResponse.parse({
      rank,
      userId: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      points: user.points,
      completions,
      level: getLevel(user.points),
      badge: getBadge(user.points),
      title: null,
      isStoneCollector: false,
    })
  );
});

router.get("/leaderboard/champions", async (_req, res): Promise<void> => {
  const boards = await Promise.all(CATEGORIES.map((cat) => buildCategoryLeaderboard(cat, 5)));

  const stoneCollectorId = await findStoneCollector();
  let stoneCollector = null;
  if (stoneCollectorId !== null) {
    const [u] = await db.select().from(usersTable).where(eq(usersTable.id, stoneCollectorId));
    if (u) stoneCollector = { userId: u.id, name: u.name, avatarUrl: u.avatarUrl };
  }

  const result: Record<string, unknown> = { stoneCollector };
  CATEGORIES.forEach((cat, i) => {
    result[cat] = boards[i].map((e) => ({
      category: cat,
      rank: e.rank,
      userId: e.userId,
      name: e.name,
      avatarUrl: e.avatarUrl,
      title: e.title ?? RANK_TITLES[e.rank] ?? "Avenger",
      points: e.points,
    }));
  });

  res.json(GetChampionsResponse.parse(result));
});

export default router;
