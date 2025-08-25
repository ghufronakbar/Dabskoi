import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../constant/cloudinary";
import multer from "multer";

export class ImageController extends BaseController {
  constructor(private storage: CloudinaryStorage) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
    super();
  }

  uploadSingle = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        console.log("No file uploaded");
        return this.sendError(
          res,
          new Error("Tidak ada file yang diupload"),
          400
        );
      }
      const upload = req.file;
      return this.sendSuccess(res, upload, "File berhasil diupload");
    } catch (error) {
      this.sendError(res, error);
    }
  };

  upload = multer({ storage: this.storage });
}
