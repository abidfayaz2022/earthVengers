import { Router, type IRouter } from "express";
import { db, usersTable, enrollmentsTable, donationsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { GetStatsSummaryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const [{ totalUsers }] = await db
    .select({ totalUsers: sql<number>`count(*)` })
    .from(usersTable);

  const [{ totalEnrollments }] = await db
    .select({ totalEnrollments: sql<number>`count(*)` })
    .from(enrollmentsTable);

  const [{ totalCompletions }] = await db
    .select({ totalCompletions: sql<number>`coalesce(sum(${enrollmentsTable.completions}), 0)` })
    .from(enrollmentsTable);

  const [{ totalDonations }] = await db
    .select({ totalDonations: sql<number>`coalesce(sum(amount), 0)` })
    .from(donationsTable);

  const completions = Number(totalCompletions) || 0;
  const trees = Math.floor(completions * 0.4); // estimate
  const co2 = completions * 12.5; // kg CO2 saved per completion estimate

  res.json(
    GetStatsSummaryResponse.parse({
      totalUsers: Number(totalUsers) || 0,
      totalEnrollments: Number(totalEnrollments) || 0,
      totalCompletions: completions,
      totalDonations: Number(totalDonations) || 0,
      totalCO2Saved: co2,
      treesPlanted: trees,
    })
  );
});

export default router;
