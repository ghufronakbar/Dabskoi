import { Request, Response } from "express";
import db from "../../config/db";
import { BaseController } from "../BaseController";
import moment from "moment-timezone";

export class AdminUserController extends BaseController {
  constructor() {
    super();
  }

  getAllUser = async (req: Request, res: Response) => {
    try {
      const users = await db.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      const now = moment().tz("Asia/Jakarta").toDate();

      const mappedUsers = users.map((user) => {
        const dayRegistered =
          moment(user.createdAt).tz("Asia/Jakarta").diff(now, "days") * -1;
        const diffLastLogin =
          moment(user.updatedAt).tz("Asia/Jakarta").diff(now, "days") * -1;
        return {
          ...user,
          createdAt: moment(user.createdAt).tz("Asia/Jakarta").toDate(),
          updatedAt: moment(user.updatedAt).tz("Asia/Jakarta").toDate(),
          dayRegistered,
          diffLastLogin,
        };
      });
      return this.sendSuccess(res, mappedUsers, "User berhasil diambil");
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  overview = async (req: Request, res: Response) => {
    try {
      const now = moment().tz("Asia/Jakarta").toDate();
      const startOfWeek = moment(now).startOf("week").toDate();
      const endOfWeek = moment(now).endOf("week").toDate();
      const startOfMonth = moment(now).startOf("month").toDate();
      const endOfMonth = moment(now).endOf("month").toDate();

      const users = await db.user.findMany();

      const totalUserRoleUser = users.filter(
        (user) => user.role === "USER"
      ).length;
      const totalUserRoleAdmin = users.filter(
        (user) => user.role === "ADMIN"
      ).length;

      const totalActiveUserThisWeek = users.filter((user) => {
        const userLastLogin = moment(user.updatedAt)
          .tz("Asia/Jakarta")
          .toDate();
        return (
          userLastLogin >= startOfWeek &&
          userLastLogin <= endOfWeek &&
          user.role === "USER"
        );
      }).length;

      const totalNewUserThisMonth = users.filter((user) => {
        const userCreatedAt = moment(user.createdAt)
          .tz("Asia/Jakarta")
          .toDate();
        return userCreatedAt >= startOfMonth && userCreatedAt <= endOfMonth;
      }).length;

      const response: OverviewResponse = {
        totalUserRoleUser,
        totalUserRoleAdmin,
        totalActiveUserThisWeek,
        totalNewUserThisMonth,
      };

      return this.sendSuccess(res, response, "Overview user berhasil diambil");
    } catch (error) {
      return this.sendError(res, error);
    }
  };
}

interface OverviewResponse {
  totalUserRoleUser: number;
  totalUserRoleAdmin: number;
  totalActiveUserThisWeek: number;
  totalNewUserThisMonth: number;
}
