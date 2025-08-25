import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import db from "../../config/db";
import moment from "moment-timezone";
import { $Enums, Bid, KoiAuction, User } from "@prisma/client";
import { CreateAuctionSchemaType } from "../../validators/AuctionValidator";
import { CreateSellSchemaType } from "../../validators/SellValidator";
import { CreateNegoSchemaType } from "../../validators/NegoValidator";
import { refreshAuctionCron } from "../../schedule/auction-schedule";

export class AdminKoiController extends BaseController {
  constructor() {
    super();
  }

  // GET DATA

  sells = async (req: Request, res: Response) => {
    try {
      const kois = await db.koiSell.findMany({
        where: {
          status: {
            not: "DIHAPUS",
          },
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
          status: {
            not: "DIHAPUS",
          },
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
          status: {
            not: "DIHAPUS",
          },
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
          },
        },
      });

      const koisWithStatus = kois.map((koi) => this.checkStatusAuction(koi));
      return this.sendSuccess(
        res,
        koisWithStatus,
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
        return this.notFound(res);
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
        return this.notFound(res);
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
        return this.notFound(res);
      }
      koi = this.checkStatusAuction(koi);
      return this.sendSuccess(res, koi, "Data koi auction berhasil diambil");
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
  createSell = async (req: Request, res: Response) => {
    try {
      const data = req.body as CreateSellSchemaType;
      const now = moment().tz("Asia/Jakarta");
      const koi = await db.koiSell.create({
        data: {
          name: data.name,
          type: data.type,
          gender: data.gender,
          length: data.length,
          weight: data.weight,
          price: data.price,
          description: data.description,
          images: data.images,
          certificate: data.certificate,
          createdAt: now.toDate(),
          updatedAt: now.toDate(),
          status: "AKTIF",
        },
      });
      return this.sendSuccess(res, koi, "Berhasil membuat penjualan koi");
    } catch (error) {
      this.sendError(res, error);
    }
  };

  createNego = async (req: Request, res: Response) => {
    try {
      const data = req.body as CreateNegoSchemaType;
      const now = moment().tz("Asia/Jakarta");
      const koi = await db.koiNego.create({
        data: {
          name: data.name,
          type: data.type,
          gender: data.gender,
          length: data.length,
          weight: data.weight,
          price: data.price,
          description: data.description,
          images: data.images,
          certificate: data.certificate,
          createdAt: now.toDate(),
          updatedAt: now.toDate(),
          status: "AKTIF",
        },
      });
      return this.sendSuccess(res, koi, "Berhasil membuat nego koi");
    } catch (error) {
      this.sendError(res, error);
    }
  };

  createAuction = async (req: Request, res: Response) => {
    try {
      const data = req.body as CreateAuctionSchemaType;
      const now = moment().tz("Asia/Jakarta");
      const koi = await db.koiAuction.create({
        data: {
          name: data.name,
          type: data.type,
          gender: data.gender,
          length: data.length,
          weight: data.weight,
          price: data.price,
          description: data.description,
          images: data.images,
          certificate: data.certificate,
          createdAt: now.toDate(),
          updatedAt: now.toDate(),
          status: "AKTIF",
          startAt: data.startAt,
          endAt: data.endAt,
        },
      });
      await refreshAuctionCron();

      return this.sendSuccess(res, koi, "Berhasil membuat lelang koi");
    } catch (error) {
      this.sendError(res, error);
    }
  };

  private validateStatusDelete(
    status: $Enums.Status,
    isAuction: boolean
  ): string | true {
    switch (status) {
      case "DIHAPUS":
        return "Data penjualan koi sudah dihapus";
      case "SELESAI":
        return "Data penjualan koi sudah selesai";
      case "AKTIF":
        if (isAuction) {
          return "Data lelang koi masih aktif";
        }
        return true;
      case "BELUM_DIMULAI":
        return "Data penjualan koi belum dimulai";
      default:
        return true;
    }
  }

  deleteSell = async (req: Request, res: Response) => {
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
          new Error("Data penjualan koi tidak ditemukan"),
          404
        );
      }
      const validate = this.validateStatusDelete(koi.status, false);
      if (validate !== true) {
        return this.sendError(res, new Error(validate), 400);
      }
      await db.koiSell.update({
        where: {
          id,
        },
        data: {
          status: "DIHAPUS",
        },
      });
      return this.sendSuccess(
        res,
        koi,
        "Berhasil menghapus data penjualan koi"
      );
    } catch (error) {
      this.sendError(res, error);
    }
  };

  deleteNego = async (req: Request, res: Response) => {
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
          new Error("Data nego koi tidak ditemukan"),
          404
        );
      }
      const validate = this.validateStatusDelete(koi.status, false);
      if (validate !== true) {
        return this.notFound(res);
      }
      await db.koiNego.update({
        where: {
          id,
        },
        data: {
          status: "DIHAPUS",
        },
      });
      return this.sendSuccess(res, koi, "Berhasil menghapus data nego koi");
    } catch (error) {
      this.sendError(res, error);
    }
  };

  deleteAuction = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const koi = await db.koiAuction.findUnique({
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
        return this.notFound(res);
      }
      const validate = this.validateStatusDelete(
        this.checkStatusAuction(koi).status,
        true
      );
      if (validate !== true) {
        return this.sendError(res, new Error(validate), 400);
      }
      await db.koiAuction.update({
        where: {
          id,
        },
        data: {
          status: "DIHAPUS",
        },
      });
      await refreshAuctionCron();
      return this.sendSuccess(res, koi, "Berhasil menghapus data lelang koi");
    } catch (error) {
      this.sendError(res, error);
    }
  };
}
