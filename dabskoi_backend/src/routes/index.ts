import express from "express";
import userRouter from "./user";
import adminRouter from "./admin";
import imageRouter from "./image";

const router = express.Router();

router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/image", imageRouter);

export default router;
