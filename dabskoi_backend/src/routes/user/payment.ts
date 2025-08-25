import express from "express";
import { UserPaymentController } from "../../controllers/user/UserPaymentController";
import { useValidate } from "../../middleware/use-validate";
import { UserCheckoutSellKoiSchema } from "../../validators/CheckoutValidator";

const paymentRouter = express.Router();
const paymentController = new UserPaymentController();

paymentRouter.get("/", paymentController.getAllHistory);
paymentRouter.get("/:id", paymentController.getDetailHistory);
paymentRouter.post(
  "/checkout",
  useValidate({
    body: UserCheckoutSellKoiSchema,
  }),
  paymentController.checkout
);
paymentRouter.post("/cancel/:id", paymentController.cancelPayment);

export default paymentRouter;
