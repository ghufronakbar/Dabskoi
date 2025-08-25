import express from "express";
import { AdminOverviewController } from "../../controllers/admin/AdminOverviewController";

const overviewController = new AdminOverviewController();
const overviewRouter = express.Router();

overviewRouter.get("/", overviewController.getOverview);
overviewRouter.get("/chart", overviewController.getChartData);

export default overviewRouter;
