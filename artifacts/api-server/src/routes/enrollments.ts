import { Router, type IRouter } from "express";
import {
  dataStore,
  nextId,
  type CampaignRecord,
  type EnrollmentRecord,
} from "../lib/dataStore";
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

function campaignOut(campaign: CampaignRecord) {
  return {
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
  };
}

function enrollmentOut(enrollment: EnrollmentRecord, campaign?: CampaignRecord) {
  return {
    id: enrollment.id,
    userId: enrollment.userId,
    campaignId: enrollment.campaignId,
    campaign: campaign ? campaignOut(campaign) : undefined,
    completions: enrollment.completions,
    lastCompletedAt: enrollment.lastCompletedAt?.toISOString() ?? null,
    createdAt: enrollment.createdAt.toISOString(),
  };
}

router.get("/enrollments", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const result = dataStore.enrollments
    .filter((enrollment) => enrollment.userId === userId)
    .map((enrollment) =>
      enrollmentOut(
        enrollment,
        dataStore.campaigns.find(
          (campaign) => campaign.id === enrollment.campaignId,
        ),
      ),
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

  const campaign = dataStore.campaigns.find(
    (candidate) => candidate.id === parsed.data.campaignId,
  );
  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  const alreadyEnrolled = dataStore.enrollments.some(
    (enrollment) =>
      enrollment.userId === userId && enrollment.campaignId === campaign.id,
  );
  if (alreadyEnrolled) {
    res.status(400).json({ error: "Already enrolled in this campaign" });
    return;
  }

  const enrollment: EnrollmentRecord = {
    id: nextId(dataStore.enrollments),
    userId,
    campaignId: campaign.id,
    completions: 0,
    lastCompletedAt: null,
    createdAt: new Date(),
  };
  dataStore.enrollments.push(enrollment);
  campaign.enrolledCount += 1;

  res
    .status(201)
    .json(EnrollInCampaignResponse.parse(enrollmentOut(enrollment, campaign)));
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

  const enrollment = dataStore.enrollments.find(
    (candidate) => candidate.id === params.data.id && candidate.userId === userId,
  );
  if (!enrollment) {
    res.status(404).json({ error: "Enrollment not found" });
    return;
  }

  const campaign = dataStore.campaigns.find(
    (candidate) => candidate.id === enrollment.campaignId,
  );
  enrollment.completions += 1;
  enrollment.lastCompletedAt = new Date();

  const user = dataStore.users.find((candidate) => candidate.id === userId);
  if (user && campaign) {
    user.points += campaign.pointsReward;
    dataStore.completionLogs.push({
      id: nextId(dataStore.completionLogs),
      userId,
      campaignId: campaign.id,
      category: campaign.frequency,
      pointsEarned: campaign.pointsReward,
      completedAt: enrollment.lastCompletedAt,
    });
  }

  res.json(
    CompleteEnrollmentResponse.parse(enrollmentOut(enrollment, campaign)),
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

  const enrollmentIndex = dataStore.enrollments.findIndex(
    (candidate) => candidate.id === params.data.id && candidate.userId === userId,
  );
  if (enrollmentIndex === -1) {
    res.status(404).json({ error: "Enrollment not found" });
    return;
  }

  const [enrollment] = dataStore.enrollments.splice(enrollmentIndex, 1);
  const campaign = dataStore.campaigns.find(
    (candidate) => candidate.id === enrollment.campaignId,
  );
  if (campaign && campaign.enrolledCount > 0) campaign.enrolledCount -= 1;

  res.json({ ok: true });
});

export default router;
