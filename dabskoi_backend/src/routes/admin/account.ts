import express from "express";
import { AdminAccountController } from "../../controllers/admin/AdminAccountController";
import { useValidate } from "../../middleware/use-validate";
import { UserLoginSchema } from "../../validators/UserValidator";
import { useAuth } from "../../middleware/use-auth";

const accountController = new AdminAccountController();
const accountRouter = express.Router();

accountRouter.post(
  "/login",
  useValidate({ body: UserLoginSchema }),
  accountController.login
);

accountRouter.get("/profile", useAuth(["ADMIN"]), accountController.profile);

export default accountRouter;
