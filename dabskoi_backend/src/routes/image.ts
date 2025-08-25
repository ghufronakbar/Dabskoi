import express from "express";
import { ImageController } from "../controllers/ImageController";
import { CloudinaryStorage, Options } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { APP_NAME } from "../constant";

export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: APP_NAME,
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "pdf", "svg"],
  } as Options["params"],
});

const imageRoute = express.Router();
const imageController = new ImageController(storage);

imageRoute.post(
  "/",
  imageController.upload.single("image"),
  imageController.uploadSingle
);

export default imageRoute;
