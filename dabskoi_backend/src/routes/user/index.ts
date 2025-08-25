import express from "express";
import accountRouter from "./account";
import koiRouter from "./koi";
import { useAuth } from "../../middleware/use-auth";
import paymentRouter from "./payment";
import chatRouter from "./chat";

const userRouter = express.Router();

userRouter.use("/account", accountRouter);
userRouter.use("/koi", useAuth(["USER"]), koiRouter);
userRouter.use("/chat", useAuth(["USER"]), chatRouter);
userRouter.use("/payment", useAuth(["USER"]), paymentRouter);

export default userRouter;
