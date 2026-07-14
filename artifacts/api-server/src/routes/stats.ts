import { Router, type IRouter } from "express";
import { dataStore } from "../lib/dataStore";
import { GetStatsSummaryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const totalUsers = dataStore.users.length;
  const totalEnrollments = dataStore.enrollments.length;
  const totalCompletions = dataStore.enrollments.reduce(
    (sum, enrollment) => sum + enrollment.completions,
    0,
  );
  const totalDonations = dataStore.donations.reduce(
    (sum, donation) => sum + donation.amount,
    0,
  );

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
