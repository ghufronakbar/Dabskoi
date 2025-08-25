import { BaseController } from "../BaseController";
import { Request, Response } from "express";
import db from "../../config/db";
import moment from "moment-timezone";
import { $Enums } from "@prisma/client";

export class AdminPaymentController extends BaseController {
  constructor() {
    super();
  }

  getAllPayment = async (req: Request, res: Response) => {
    try {
      const [payments, sells, negos, auctions] = await Promise.all([
        db.paymentHistory.findMany({
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: true,
          },
        }),
        db.koiSell.findMany(),
        db.koiNego.findMany(),
        db.koiAuction.findMany(),
      ]);

      const mappedData = payments.map((payment) => {
        let product: ProductInPayment | null = null;
        switch (payment.type) {
          case "AUCTION":
            const auction = auctions.find(
              (auction) => auction.id === payment.reference
            );
            if (auction) {
              product = {
                id: auction.id,
                images: auction.images,
                name: auction.name,
                type: "AUCTION",
              };
            }
            break;
          case "NEGO":
            const nego = negos.find((nego) => nego.id === payment.reference);
            if (nego) {
              product = {
                id: nego.id,
                images: nego.images,
                name: nego.name,
                type: "NEGO",
              };
            }
            break;
          case "SELL":
            const sell = sells.find((sell) => sell.id === payment.reference);
            if (sell) {
              product = {
                id: sell.id,
                images: sell.images,
                name: sell.name,
                type: "SELL",
              };
            }
            break;
        }
        return {
          ...payment,
          product,
        };
      });

      return this.sendSuccess(
        res,
        mappedData,
        "Berhasil mengambil semua pembayaran"
      );
    } catch (error) {
      return this.sendError(res, error);
    }
  };
}

interface ProductInPayment {
  id: string;
  images: string[];
  name: string;
  type: $Enums.PaymentType;
}
