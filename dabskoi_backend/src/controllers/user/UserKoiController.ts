import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import db from "../../config/db";
import moment from "moment-timezone";
import { Bid, KoiAuction, User } from "@prisma/client";
import { BidSchemaType } from "../../validators/AuctionValidator";
import { emitAucion } from "../../realtime/emitters";

export class UserKoiController extends BaseController {
  constructor() {
    super();
  }

  // GET DATA

  sells = async (req: Request, res: Response) => {
    try {
      const kois = await db.koiSell.findMany({
        where: {
          status: "AKTIF",
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return this.sendSuccess(res, kois, "Data koi sell berhasil diambil");
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  negos = async (req: Request, res: Response) => {
    try {
      const kois = await db.koiNego.findMany({
        where: {
          status: "AKTIF",
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return this.sendSuccess(res, kois, "Data koi nego berhasil diambil");
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  auctions = async (req: Request, res: Response) => {
    try {
      const kois = await db.koiAuction.findMany({
        where: {
          status: "AKTIF",
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          winner: true,
          bids: {
            include: {
              user: true,
            },
            orderBy: {
              price: "desc",
            },
          },
        },
      });

      const koisWithStatus = kois.map((koi) => this.checkStatusAuction(koi));
      const mappedKois = koisWithStatus.map((koi) => {
        const highestBid = koi.bids?.[0]?.price ?? koi.price;
        return {
          ...koi,
          highestBid,
        };
      });
      return this.sendSuccess(
        res,
        mappedKois,
        "Data koi auction berhasil diambil"
      );
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  detailSell = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const koi = await db.koiSell.findUnique({
        where: {
          id,
        },
      });
      if (!koi) {
        return this.sendError(
          res,
          new Error("Data koi sell tidak ditemukan"),
          404
        );
      }

      return this.sendSuccess(res, koi, "Data koi sell berhasil diambil");
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  detailNego = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const koi = await db.koiNego.findUnique({
        where: {
          id,
        },
      });
      if (!koi) {
        return this.sendError(
          res,
          new Error("Data koi nego tidak ditemukan"),
          404
        );
      }
      return this.sendSuccess(res, koi, "Data koi nego berhasil diambil");
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  detailAuction = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      let koi = await db.koiAuction.findUnique({
        where: {
          id,
        },
        include: {
          bids: {
            include: {
              user: true,
            },
          },
          winner: true,
        },
      });
      if (!koi) {
        return this.sendError(
          res,
          new Error("Data koi auction tidak ditemukan"),
          404
        );
      }
      koi = this.checkStatusAuction(koi);
      const highestBid = koi.bids?.[0]?.price ?? koi.price;
      const returnData = {
        ...koi,
        highestBid,
      };
      return this.sendSuccess(
        res,
        returnData,
        "Data koi auction berhasil diambil"
      );
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  private checkStatusAuction(
    koi: KoiAuction & { bids: (Bid & { user: User })[]; winner: User }
  ): KoiAuction & {
    bids: (Bid & { user: User })[];
    winner: User;
    lastBid: number;
  } {
    const bids = koi.bids.sort((a, b) => b.price - a.price);
    koi.bids = bids;
    const now = moment().tz("Asia/Jakarta");
    const startAt = moment(koi.startAt).tz("Asia/Jakarta");
    const endAt = moment(koi.endAt).tz("Asia/Jakarta");
    if (now.isBefore(startAt))
      return {
        ...koi,
        startAt: startAt.toDate(),
        endAt: endAt.toDate(),
        status: "BELUM_DIMULAI",
        lastBid: koi.price,
      };
    if (now.isAfter(startAt) && now.isBefore(endAt))
      return {
        ...koi,
        startAt: startAt.toDate(),
        endAt: endAt.toDate(),
        status: "AKTIF",
        lastBid: bids?.[0]?.price ?? koi.price,
      };
    return {
      ...koi,
      startAt: startAt.toDate(),
      endAt: endAt.toDate(),
      status: "SELESAI",
      lastBid: bids?.[0]?.price ?? koi.price,
    };
  }

  // PLACE DATA
  placeBid = async (req: Request, res: Response) => {
    try {
      const data = req.body as BidSchemaType;
      const userId = req.user.id;
      const koi = await db.koiAuction.findUnique({
        where: {
          id: data.koiAuctionId,
        },
        include: {
          bids: {
            include: {
              user: true,
            },
          },
          winner: true,
        },
      });
      if (!koi) {
        return this.sendError(
          res,
          new Error("Koi auction tidak ditemukan"),
          404
        );
      }
      const mappedKoi = this.checkStatusAuction(koi);
      if (mappedKoi.winner?.id) {
        return this.sendError(res, new Error("Lelang sudah selesai"), 400);
      }
      if (mappedKoi.status === "BELUM_DIMULAI") {
        return this.sendError(res, new Error("Lelang belum dimulai"), 400);
      }
      if (mappedKoi.status === "SELESAI") {
        return this.sendError(res, new Error("Lelang sudah selesai"), 400);
      }

      const lastBid = mappedKoi?.lastBid ?? mappedKoi?.price;
      if (lastBid >= data.price) {
        return this.sendError(
          res,
          new Error(`Penawaran harus lebih dari ${lastBid}`),
          400
        );
      }

      const now = moment().tz("Asia/Jakarta");

      const bid = await db.bid.create({
        data: {
          price: data.price,
          koiAuctionId: data.koiAuctionId,
          userId,
          createdAt: now.toDate(),
          updatedAt: now.toDate(),
        },
        include: {
          user: true,
          koiAuction: true,
        },
      });

      await emitAucion({
        auction: bid.koiAuction,
        bid, // bid yang baru dibuat
        user: bid.user, // user yang melakukan bid
        type: "NEW_BID",
        userIds: koi.bids.map((b) => b.userId),
      });

      return this.sendSuccess(res, mappedKoi, "Berhasil memasang lelang");
    } catch (error) {
      return this.sendError(res, error);
    }
  };
}
