import { Router, type IRouter } from "express";
import { dataStore } from "../lib/dataStore";
import { ListGoalsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/goals", async (_req, res): Promise<void> => {
  const goals = dataStore.goals;
  res.json(
    ListGoalsResponse.parse(
      goals.map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        targetValue: g.targetValue,
        currentValue: g.currentValue,
        unit: g.unit,
        color: g.color,
        icon: g.icon,
      }))
    )
  );
});

export default router;
