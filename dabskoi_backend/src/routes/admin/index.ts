import express from "express";
import accountRouter from "./account";
import koiRouter from "./koi";
import { useAuth } from "../../middleware/use-auth";
import chatRouter from "./chat";
import overviewRouter from "./overview";
import userRouter from "./user";
import paymentRouter from "./payment";

const adminRouter = express.Router();

adminRouter.use("/account", accountRouter);
adminRouter.use("/koi", useAuth(["ADMIN"]), koiRouter);
adminRouter.use("/chat", useAuth(["ADMIN"]), chatRouter);
adminRouter.use("/overview", useAuth(["ADMIN"]), overviewRouter);
adminRouter.use("/user", useAuth(["ADMIN"]), userRouter);
adminRouter.use("/payment", useAuth(["ADMIN"]), paymentRouter);

export default adminRouter;
