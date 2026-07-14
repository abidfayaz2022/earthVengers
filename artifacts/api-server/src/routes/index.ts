import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import campaignsRouter from "./campaigns";
import enrollmentsRouter from "./enrollments";
import crowdfundingRouter from "./crowdfunding";
import leaderboardRouter from "./leaderboard";
import goalsRouter from "./goals";
import statsRouter from "./stats";
import storageRouter from "./storage";
import missionPhotosRouter from "./mission-photos";
import adminRouter from "./admin";
import donorsRouter from "./donors";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(campaignsRouter);
router.use(enrollmentsRouter);
router.use(crowdfundingRouter);
router.use(leaderboardRouter);
router.use(goalsRouter);
router.use(statsRouter);
router.use(storageRouter);
router.use(missionPhotosRouter);
router.use(adminRouter);
router.use(donorsRouter);

export default router;
