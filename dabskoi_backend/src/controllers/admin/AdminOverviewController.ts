import { BaseController } from "../BaseController";
import { Request, Response } from "express";
import db from "../../config/db";
import moment from "moment-timezone";

export class AdminOverviewController extends BaseController {
  constructor() {
    super();
  }

  getOverview = async (req: Request, res: Response) => {
    try {
      const [activeKoiSell, activeKoiNego, activeKoiAuction, unreadChat] =
        await Promise.all([
          db.koiSell.count({
            where: {
              status: {
                not: "DIHAPUS",
              },
            },
          }),
          db.koiNego.count({
            where: {
              status: {
                not: "DIHAPUS",
              },
            },
          }),
          db.koiAuction.count({
            where: {
              status: {
                not: "DIHAPUS",
              },
            },
          }),
          db.chat.count({
            where: {
              readByAdmin: false,
            },
          }),
        ]);

      const response: OverviewResponse = {
        activeKoiSell,
        activeKoiNego,
        activeKoiAuction,
        unreadChat,
      };
      return this.sendSuccess(res, response, "Overview berhasil diambil");
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  getChartData = async (req: Request, res: Response) => {
    try {
      const now = moment().tz("Asia/Jakarta").toDate();

      const data = await db.paymentHistory.findMany({
        where: {
          status: "SUKSES",
        },
      });
      const mappedData: ChartDataResponse[] = [];

      for (const item of data) {
        const date = moment(item.createdAt).tz("Asia/Jakarta").toDate();
        const existingData = mappedData.find((d) =>
          moment(d.date).isSame(date, "day")
        );

        if (existingData) {
          existingData.countAll++;
          existingData.countSell += item.type === "SELL" ? 1 : 0;
          existingData.countNego += item.type === "NEGO" ? 1 : 0;
          existingData.countAuction += item.type === "AUCTION" ? 1 : 0;
          existingData.totalAmountAll += item.amount;
          existingData.totalAmountSell +=
            item.type === "SELL" ? item.amount : 0;
          existingData.totalAmountNego +=
            item.type === "NEGO" ? item.amount : 0;
          existingData.totalAmountAuction +=
            item.type === "AUCTION" ? item.amount : 0;
        } else {
          mappedData.push({
            date: moment(date).format("YYYY-MM-DD"),
            countAll: 1,
            countSell: item.type === "SELL" ? 1 : 0,
            countNego: item.type === "NEGO" ? 1 : 0,
            countAuction: item.type === "AUCTION" ? 1 : 0,
            totalAmountAll: item.amount,
            totalAmountSell: item.type === "SELL" ? item.amount : 0,
            totalAmountNego: item.type === "NEGO" ? item.amount : 0,
            totalAmountAuction: item.type === "AUCTION" ? item.amount : 0,
          });
        }
      }

      return this.sendSuccess(res, mappedData, "Data chart berhasil diambil");
    } catch (error) {
      return this.sendError(res, error);
    }
  };
}

interface OverviewResponse {
  activeKoiSell: number;
  activeKoiNego: number;
  activeKoiAuction: number;
  unreadChat: number;
}

interface ChartDataResponse {
  date: string;
  countAll: number;
  countSell: number;
  countNego: number;
  countAuction: number;
  totalAmountAll: number;
  totalAmountSell: number;
  totalAmountNego: number;
  totalAmountAuction: number;
}
