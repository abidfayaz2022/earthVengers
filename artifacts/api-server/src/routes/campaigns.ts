import { Router, type IRouter } from "express";
import { dataStore } from "../lib/dataStore";
import {
  ListCampaignsQueryParams,
  GetCampaignParams,
  ListCampaignsResponse,
  GetCampaignResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/campaigns", async (req, res): Promise<void> => {
  const params = ListCampaignsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let campaigns = [...dataStore.campaigns];

  if (params.data.category) {
    campaigns = campaigns.filter(
      (c) => c.category.toLowerCase() === params.data.category!.toLowerCase()
    );
  }

  const result = campaigns.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    difficulty: c.difficulty,
    pointsReward: c.pointsReward,
    frequency: c.frequency,
    imageUrl: c.imageUrl,
    enrolledCount: c.enrolledCount,
    createdAt: c.createdAt.toISOString(),
  }));

  res.json(ListCampaignsResponse.parse(result));
});

router.get("/campaigns/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetCampaignParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const campaign = dataStore.campaigns.find(
    (candidate) => candidate.id === params.data.id,
  );

  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  res.json(
    GetCampaignResponse.parse({
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
    })
  );
});

export default router;
