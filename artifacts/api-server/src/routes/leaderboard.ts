import { Router, type IRouter } from "express";
import { dataStore } from "../lib/dataStore";
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

function completionCount(userId: number): number {
  return dataStore.enrollments
    .filter((enrollment) => enrollment.userId === userId)
    .reduce((sum, enrollment) => sum + enrollment.completions, 0);
}

function buildOverallLeaderboard(limit = 50) {
  return [...dataStore.users]
    .sort((left, right) => right.points - left.points)
    .slice(0, limit)
    .map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      points: user.points,
      completions: completionCount(user.id),
      level: getLevel(user.points),
      badge: getBadge(user.points),
      title: null as string | null,
      isStoneCollector: false,
    }));
}

function buildCategoryLeaderboard(category: Category, limit = 50) {
  const totals = new Map<number, { points: number; completions: number }>();
  for (const log of dataStore.completionLogs) {
    if (log.category !== category) continue;
    const total = totals.get(log.userId) ?? { points: 0, completions: 0 };
    total.points += log.pointsEarned;
    total.completions += 1;
    totals.set(log.userId, total);
  }

  return [...totals.entries()]
    .sort((left, right) => right[1].points - left[1].points)
    .slice(0, limit)
    .map(([userId, total], index) => {
      const user = dataStore.users.find((candidate) => candidate.id === userId);
      const rank = index + 1;
      return {
        rank,
        userId,
        name: user?.name ?? "Unknown",
        avatarUrl: user?.avatarUrl ?? null,
        points: total.points,
        completions: total.completions,
        level: getLevel(user?.points ?? 0),
        badge: getBadge(user?.points ?? 0),
        title: RANK_TITLES[rank] ?? null,
        isStoneCollector: false,
      };
    });
}

function findStoneCollector(): number | null {
  const leaders = CATEGORIES.map(
    (category) => buildCategoryLeaderboard(category, 1)[0]?.userId ?? null,
  );
  if (leaders.some((id) => id === null)) return null;
  return leaders.every((id) => id === leaders[0]) ? leaders[0] : null;
}

router.get("/leaderboard", async (req, res): Promise<void> => {
  const params = GetLeaderboardQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const category = params.data.category as Category | undefined;
  const board = category
    ? buildCategoryLeaderboard(category, params.data.limit ?? 50)
    : buildOverallLeaderboard(params.data.limit ?? 50);

  if (category) {
    const collectorId = findStoneCollector();
    for (const entry of board) {
      if (entry.userId === collectorId) entry.isStoneCollector = true;
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
    const entry = buildCategoryLeaderboard(category, dataStore.users.length).find(
      (candidate) => candidate.userId === req.session.userId,
    );
    res.json(
      GetMyRankResponse.parse(
        entry ?? {
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
        },
      ),
    );
    return;
  }

  const board = buildOverallLeaderboard(dataStore.users.length);
  const entry = board.find(
    (candidate) => candidate.userId === req.session.userId,
  );
  if (!entry) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(GetMyRankResponse.parse(entry));
});

router.get("/leaderboard/champions", async (_req, res): Promise<void> => {
  const collectorId = findStoneCollector();
  const collector = dataStore.users.find((user) => user.id === collectorId);
  const result: Record<string, unknown> = {
    stoneCollector: collector
      ? {
          userId: collector.id,
          name: collector.name,
          avatarUrl: collector.avatarUrl,
        }
      : null,
  };

  for (const category of CATEGORIES) {
    result[category] = buildCategoryLeaderboard(category, 5).map((entry) => ({
      category,
      rank: entry.rank,
      userId: entry.userId,
      name: entry.name,
      avatarUrl: entry.avatarUrl,
      title: entry.title ?? "Avenger",
      points: entry.points,
    }));
  }

  res.json(GetChampionsResponse.parse(result));
});

export default router;
