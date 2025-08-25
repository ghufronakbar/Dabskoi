import express from "express";
import { AdminPaymentController } from "../../controllers/admin/AdminPaymentController";

const paymentController = new AdminPaymentController();
const paymentRouter = express.Router();

paymentRouter.get("/", paymentController.getAllPayment);

export default paymentRouter;