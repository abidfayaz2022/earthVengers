import { Router, type IRouter } from "express";
import { db, enrollmentsTable, campaignsTable, usersTable, completionLogsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  EnrollInCampaignBody,
  CompleteEnrollmentParams,
  UnenrollFromCampaignParams,
  ListMyEnrollmentsResponse,
  EnrollInCampaignResponse,
  CompleteEnrollmentResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: any, res: any): number | null {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return req.session.userId as number;
}

router.get("/enrollments", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const rows = await db
    .select()
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.userId, userId));

  // Fetch campaign details for each enrollment
  const result = await Promise.all(
    rows.map(async (e) => {
      const [campaign] = await db
        .select()
        .from(campaignsTable)
        .where(eq(campaignsTable.id, e.campaignId));

      return {
        id: e.id,
        userId: e.userId,
        campaignId: e.campaignId,
        campaign: campaign
          ? {
              id: campaign.id,
              title: campaign.title,
              description: campaign.description,
              category: campaign.category,
              difficulty: campaign.difficulty,
              pointsReward: campaign.pointsReward,
              frequency: campaign.frequency,
              imageUrl: campaign.imageUrl,
              enrolledCount: campaign.enrolledCount,
              createdAt: campaign.createdAt.toISOString(),
            }
          : undefined,
        completions: e.completions,
        lastCompletedAt: e.lastCompletedAt ? e.lastCompletedAt.toISOString() : null,
        createdAt: e.createdAt.toISOString(),
      };
    })
  );

  res.json(ListMyEnrollmentsResponse.parse(result));
});

router.post("/enrollments", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const parsed = EnrollInCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { campaignId } = parsed.data;

  // Check campaign exists
  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.id, campaignId));

  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  // Check already enrolled
  const existing = await db
    .select()
    .from(enrollmentsTable)
    .where(and(eq(enrollmentsTable.userId, userId), eq(enrollmentsTable.campaignId, campaignId)));

  if (existing.length > 0) {
    res.status(400).json({ error: "Already enrolled in this campaign" });
    return;
  }

  const [enrollment] = await db
    .insert(enrollmentsTable)
    .values({ userId, campaignId })
    .returning();

  // Increment enrolledCount
  await db
    .update(campaignsTable)
    .set({ enrolledCount: campaign.enrolledCount + 1 })
    .where(eq(campaignsTable.id, campaignId));

  res.status(201).json(
    EnrollInCampaignResponse.parse({
      id: enrollment.id,
      userId: enrollment.userId,
      campaignId: enrollment.campaignId,
      campaign: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        category: campaign.category,
        difficulty: campaign.difficulty,
        pointsReward: campaign.pointsReward,
        frequency: campaign.frequency,
        imageUrl: campaign.imageUrl,
        enrolledCount: campaign.enrolledCount + 1,
        createdAt: campaign.createdAt.toISOString(),
      },
      completions: enrollment.completions,
      lastCompletedAt: null,
      createdAt: enrollment.createdAt.toISOString(),
    })
  );
});

router.post("/enrollments/:id/complete", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = CompleteEnrollmentParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [enrollment] = await db
    .select()
    .from(enrollmentsTable)
    .where(and(eq(enrollmentsTable.id, params.data.id), eq(enrollmentsTable.userId, userId)));

  if (!enrollment) {
    res.status(404).json({ error: "Enrollment not found" });
    return;
  }

  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.id, enrollment.campaignId));

  const now = new Date();
  const [updated] = await db
    .update(enrollmentsTable)
    .set({
      completions: enrollment.completions + 1,
      lastCompletedAt: now,
    })
    .where(eq(enrollmentsTable.id, enrollment.id))
    .returning();

  // Award points to user
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (user && campaign) {
    await db
      .update(usersTable)
      .set({ points: user.points + campaign.pointsReward })
      .where(eq(usersTable.id, userId));

    // Log this completion so category leaderboards (daily/weekly/monthly/awareness)
    // can be computed independently of lifetime overall points.
    await db.insert(completionLogsTable).values({
      userId,
      campaignId: campaign.id,
      category: campaign.frequency,
      pointsEarned: campaign.pointsReward,
    });
  }

  res.json(
    CompleteEnrollmentResponse.parse({
      id: updated.id,
      userId: updated.userId,
      campaignId: updated.campaignId,
      campaign: campaign
        ? {
            id: campaign.id,
            title: campaign.title,
            description: campaign.description,
            category: campaign.category,
            difficulty: campaign.difficulty,
            pointsReward: campaign.pointsReward,
            frequency: campaign.frequency,
            imageUrl: campaign.imageUrl,
            enrolledCount: campaign.enrolledCount,
            createdAt: campaign.createdAt.toISOString(),
          }
        : undefined,
      completions: updated.completions,
      lastCompletedAt: updated.lastCompletedAt ? updated.lastCompletedAt.toISOString() : null,
      createdAt: updated.createdAt.toISOString(),
    })
  );
});

router.delete("/enrollments/:id", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UnenrollFromCampaignParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [enrollment] = await db
    .select()
    .from(enrollmentsTable)
    .where(and(eq(enrollmentsTable.id, params.data.id), eq(enrollmentsTable.userId, userId)));

  if (!enrollment) {
    res.status(404).json({ error: "Enrollment not found" });
    return;
  }

  await db.delete(enrollmentsTable).where(eq(enrollmentsTable.id, enrollment.id));

  // Decrement enrolledCount
  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.id, enrollment.campaignId));

  if (campaign && campaign.enrolledCount > 0) {
    await db
      .update(campaignsTable)
      .set({ enrolledCount: campaign.enrolledCount - 1 })
      .where(eq(campaignsTable.id, campaign.id));
  }

  res.json({ ok: true });
});

export default router;
