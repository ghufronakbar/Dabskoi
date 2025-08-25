import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import {
  UserLoginSchemaType,
  UserRegisterSchemaType,
  UserUpdateSchemaType,
} from "../../validators/UserValidator";
import db from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../constant/auth";
import { User } from "@prisma/client";
import moment from "moment-timezone";

export class UserAccountController extends BaseController {
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
      if (!user || user.role === "ADMIN") {
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

  register = async (req: Request, res: Response) => {
    try {
      const data = req.body as UserRegisterSchemaType;
      const user = await db.user.findUnique({
        where: {
          email: data.email,
        },
      });
      if (user) {
        return this.sendError(res, new Error("Email sudah terdaftar"), 400);
      }
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const newUser = await db.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          phone: data.phone,
          address: data.address,
          role: "USER",
        },
      });
      const accessToken = jwt.sign(
        { id: newUser.id, role: newUser.role },
        JWT_SECRET
      );
      return this.sendSuccess(
        res,
        this.returnData(newUser, accessToken),
        "Registrasi berhasil"
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

  update = async (req: Request, res: Response) => {
    try {
      const data = req.body as UserUpdateSchemaType;
      const [user, checkEmail] = await db.$transaction([
        db.user.findUnique({
          where: {
            id: req.user.id,
          },
        }),
        db.user.findUnique({
          where: {
            email: data.email,
          },
        }),
      ]);
      if (!user) {
        return this.sendError(res, new Error("Pengguna tidak ditemukan"), 400);
      }
      if (checkEmail && checkEmail.id !== user.id) {
        return this.sendError(res, new Error("Email sudah terdaftar"), 400);
      }
      const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET
      );
      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: { ...data },
      });
      return this.sendSuccess(
        res,
        this.returnData(updatedUser, accessToken),
        "Update berhasil"
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
