import express from "express";
import { AdminUserController } from "../../controllers/admin/AdminUserController";

const userController = new AdminUserController();
const userRouter = express.Router();

userRouter.get("/", userController.getAllUser);
userRouter.get("/overview", userController.overview);

export default userRouter;
