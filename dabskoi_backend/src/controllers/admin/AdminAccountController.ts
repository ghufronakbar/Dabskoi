import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import { UserLoginSchemaType } from "../../validators/UserValidator";
import db from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../constant/auth";
import { User } from "@prisma/client";
import moment from "moment-timezone";

export class AdminAccountController extends BaseController {
  constructor() {
    super();
  }

  login = async (req: Request, res: Response) => {
    try {
      const data = req.body as UserLoginSchemaType;
      const user = await db.user.findUnique({
        where: {
          email: data.email,
        },
      });
      if (!user || user.role === "USER") {
        return this.sendError(res, new Error("Pengguna tidak ditemukan"), 400);
      }
      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) {
        return this.sendError(res, new Error("Password salah"), 400);
      }
      const now = moment().tz("Asia/Jakarta").toDate();
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          updatedAt: now,
        },
      });
      const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET
      );
      return this.sendSuccess(
        res,
        this.returnData(user, accessToken),
        "Login berhasil"
      );
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  profile = async (req: Request, res: Response) => {
    try {
      const user = await db.user.findUnique({
        where: { id: req.user.id },
      });
      const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET
      );
      return this.sendSuccess(
        res,
        this.returnData(user, accessToken),
        "Profile berhasil diambil"
      );
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  private returnData(user: User, accessToken: string) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      picture: user.picture,
      accessToken,
    };
  }
}
