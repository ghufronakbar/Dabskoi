import express from "express";
import { UserAccountController } from "../../controllers/user/UserAccountController";
import { useValidate } from "../../middleware/use-validate";
import {
  UserLoginSchema,
  UserRegisterSchema,
  UserUpdateSchema,
} from "../../validators/UserValidator";
import { useAuth } from "../../middleware/use-auth";

const accountController = new UserAccountController();
const accountRouter = express.Router();

accountRouter.post(
  "/login",
  useValidate({ body: UserLoginSchema }),
  accountController.login
);

accountRouter.post(
  "/register",
  useValidate({ body: UserRegisterSchema }),
  accountController.register
);

accountRouter.put(
  "/update",
  useAuth(["USER"]),
  useValidate({ body: UserUpdateSchema }),
  accountController.update
);

accountRouter.get("/profile", useAuth(["USER"]), accountController.profile);

export default accountRouter;
