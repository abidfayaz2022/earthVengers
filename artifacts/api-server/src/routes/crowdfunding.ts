import { Router, type IRouter } from "express";
import { dataStore, nextId, type FundraiserRecord } from "../lib/dataStore";
import {
  GetFundraiserParams,
  DonateParams,
  DonateBody,
  ListFundraisersResponse,
  GetFundraiserResponse,
  DonateResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toFundraiserOut(f: FundraiserRecord) {
  return {
    id: f.id,
    title: f.title,
    description: f.description,
    goalAmount: f.goalAmount,
    raisedAmount: f.raisedAmount,
    donorCount: f.donorCount,
    imageUrl: f.imageUrl,
    deadline: f.deadline.toISOString(),
    createdAt: f.createdAt.toISOString(),
  };
}

router.get("/crowdfunding", async (_req, res): Promise<void> => {
  res.json(ListFundraisersResponse.parse(dataStore.fundraisers.map(toFundraiserOut)));
});

router.get("/crowdfunding/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetFundraiserParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const fundraiser = dataStore.fundraisers.find(
    (candidate) => candidate.id === params.data.id,
  );

  if (!fundraiser) {
    res.status(404).json({ error: "Fundraiser not found" });
    return;
  }

  res.json(GetFundraiserResponse.parse(toFundraiserOut(fundraiser)));
});

router.post("/crowdfunding/:id/donate", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DonateParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = DonateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const fundraiser = dataStore.fundraisers.find(
    (candidate) => candidate.id === params.data.id,
  );

  if (!fundraiser) {
    res.status(404).json({ error: "Fundraiser not found" });
    return;
  }

  const { amount, donorName, message } = parsed.data;

  const donation = {
    id: nextId(dataStore.donations),
    fundraiserId: fundraiser.id,
    amount,
    donorName,
    message: message ?? null,
    createdAt: new Date(),
  };
  dataStore.donations.push(donation);

  // Update fundraiser totals
  fundraiser.raisedAmount += amount;
  fundraiser.donorCount += 1;

  res.status(201).json(
    DonateResponse.parse({
      id: donation.id,
      fundraiserId: donation.fundraiserId,
      amount: donation.amount,
      donorName: donation.donorName,
      message: donation.message,
      createdAt: donation.createdAt.toISOString(),
    })
  );
});

export default router;
