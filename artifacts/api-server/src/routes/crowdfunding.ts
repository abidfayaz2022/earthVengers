import { Router, type IRouter } from "express";
import { db, fundraisersTable, donationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetFundraiserParams,
  DonateParams,
  DonateBody,
  ListFundraisersResponse,
  GetFundraiserResponse,
  DonateResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toFundraiserOut(f: any) {
  return {
    id: f.id,
    title: f.title,
    description: f.description,
    goalAmount: parseFloat(f.goalAmount),
    raisedAmount: parseFloat(f.raisedAmount),
    donorCount: f.donorCount,
    imageUrl: f.imageUrl,
    deadline: f.deadline.toISOString(),
    createdAt: f.createdAt.toISOString(),
  };
}

router.get("/crowdfunding", async (_req, res): Promise<void> => {
  const fundraisers = await db.select().from(fundraisersTable);
  res.json(ListFundraisersResponse.parse(fundraisers.map(toFundraiserOut)));
});

router.get("/crowdfunding/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetFundraiserParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [fundraiser] = await db
    .select()
    .from(fundraisersTable)
    .where(eq(fundraisersTable.id, params.data.id));

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

  const [fundraiser] = await db
    .select()
    .from(fundraisersTable)
    .where(eq(fundraisersTable.id, params.data.id));

  if (!fundraiser) {
    res.status(404).json({ error: "Fundraiser not found" });
    return;
  }

  const { amount, donorName, message } = parsed.data;

  const [donation] = await db
    .insert(donationsTable)
    .values({
      fundraiserId: fundraiser.id,
      amount: String(amount),
      donorName,
      message,
    })
    .returning();

  // Update fundraiser totals
  const newRaised = parseFloat(fundraiser.raisedAmount) + amount;
  await db
    .update(fundraisersTable)
    .set({
      raisedAmount: String(newRaised),
      donorCount: fundraiser.donorCount + 1,
    })
    .where(eq(fundraisersTable.id, fundraiser.id));

  res.status(201).json(
    DonateResponse.parse({
      id: donation.id,
      fundraiserId: donation.fundraiserId,
      amount: parseFloat(String(donation.amount)),
      donorName: donation.donorName,
      message: donation.message,
      createdAt: donation.createdAt.toISOString(),
    })
  );
});

export default router;
