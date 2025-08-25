import { UserCheckoutSellKoiSchemaType } from "../../validators/CheckoutValidator";
import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import db from "../../config/db";
import moment from "moment-timezone";
import { v4 as uuidv4 } from "uuid";
import { midtransCheck, midtransCheckout } from "../../utils/midtrans";

export class UserPaymentController extends BaseController {
  constructor() {
    super();
  }

  getAllHistory = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const [payments, sells, negos, auctions] = await Promise.all([
        db.paymentHistory.findMany({
          where: {
            userId,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        db.koiSell.findMany({
          where: {
            winnerId: userId,
          },
        }),
        db.koiNego.findMany({
          where: {
            winnerId: userId,
          },
        }),
        db.koiAuction.findMany({
          where: {
            winnerId: userId,
          },
        }),
      ]);

      const now = moment().tz("Asia/Jakarta");

      const mappedHistory = payments.map(async (payment) => {
        const sell = sells.find((sell) => sell.id === payment.reference);
        const nego = negos.find((nego) => nego.id === payment.reference);
        const auction = auctions.find(
          (auction) => auction.id === payment.reference
        );
        const createdAt = moment(payment.createdAt).tz("Asia/Jakarta");
        const updatedAt = moment(payment.updatedAt).tz("Asia/Jakarta");
        const expiredAt = moment(payment.createdAt).add(30, "minutes");
        if (now.isAfter(expiredAt) && payment.status === "PENDING") {
          payment.status = "KADALUARSA";
          await db.paymentHistory.update({
            where: {
              id: payment.id,
            },
            data: {
              status: "KADALUARSA",
            },
          });
        }
        switch (payment.type) {
          case "SELL":
            if (sell) {
              return {
                ...payment,
                product: {
                  id: sell.id,
                  name: sell.name,
                  images: sell.images,
                  type: "SELL",
                },
                createdAt: createdAt.toDate(),
                updatedAt: updatedAt.toDate(),
                expiredAt: expiredAt.toDate(),
              };
            }
          case "NEGO":
            if (nego) {
              return {
                ...payment,
                product: {
                  id: nego.id,
                  name: nego.name,
                  images: nego.images,
                  type: "NEGO",
                },
                createdAt: createdAt.toDate(),
                updatedAt: updatedAt.toDate(),
                expiredAt: expiredAt.toDate(),
              };
            }
          case "AUCTION":
            if (auction) {
              return {
                ...payment,
                product: {
                  id: auction.id,
                  name: auction.name,
                  images: auction.images,
                  type: "AUCTION",
                },
                createdAt: createdAt.toDate(),
                updatedAt: updatedAt.toDate(),
                expiredAt: expiredAt.toDate(),
              };
            }
          default:
            return {
              ...payment,
              product: null,
              createdAt: createdAt.toDate(),
              updatedAt: updatedAt.toDate(),
              expiredAt: expiredAt.toDate(),
            };
        }
      });

      const result = await Promise.all(mappedHistory);

      return this.sendSuccess(
        res,
        result,
        "Berhasil mengambil semua pembayaran"
      );
    } catch (error) {
      this.sendError(res, error);
    }
  };

  getDetailHistory = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const payment = await db.paymentHistory.findUnique({
        where: {
          id,
        },
      });
      if (!payment) {
        return this.notFound(res);
      }
      let product = null;
      switch (payment.type) {
        case "SELL":
          const sell = await db.koiSell.findUnique({
            where: {
              id: payment.reference,
            },
          });
          if (sell) {
            product = {
              id: sell.id,
              name: sell.name,
              images: sell.images,
              type: "SELL",
              price: sell.price,
            };
          }
          break;
        case "NEGO":
          const nego = await db.koiNego.findUnique({
            where: {
              id: payment.reference,
            },
          });
          if (nego) {
            product = {
              id: nego.id,
              name: nego.name,
              images: nego.images,
              type: "NEGO",
              price: nego.price,
            };
          }
          break;
        case "AUCTION":
          const auction = await db.koiAuction.findUnique({
            where: {
              id: payment.reference,
            },
          });
          if (auction) {
            product = {
              id: auction.id,
              name: auction.name,
              images: auction.images,
              type: "AUCTION",
              price: auction.price,
            };
          }
          break;
      }
      if (!payment.midtransDirectUrl) {
        const checkout = await midtransCheckout(
          payment.reference,
          payment.amount
        );
        payment.midtransDirectUrl = checkout.redirect_url;
        await db.paymentHistory.update({
          where: {
            id: payment.id,
          },
          data: {
            midtransDirectUrl: checkout.redirect_url,
          },
        });
      }
      const now = moment().tz("Asia/Jakarta");
      const createdAt = moment(payment.createdAt).tz("Asia/Jakarta");
      const updatedAt = moment(payment.updatedAt).tz("Asia/Jakarta");
      const expiredAt = moment(payment.createdAt).add(30, "minutes");
      if (payment.status === "PENDING" && now.isAfter(expiredAt)) {
        payment.status = "KADALUARSA";
        await db.paymentHistory.update({
          where: {
            id: payment.id,
          },
          data: {
            status: "KADALUARSA",
          },
        });
        payment.status = "KADALUARSA";
      }
      if (payment.status === "PENDING") {
        console.log("HIT_PENDING");
        const check = await midtransCheck(payment.id);
        console.log("check", check);
        if (check.transaction_status === "settlement") {
          payment.status = "SUKSES";
          await db.paymentHistory.update({
            where: { id: payment.id },
            data: {
              status: "SUKSES",
            },
          });
        } else if (
          check.transaction_status === "cancel" ||
          check.transaction_status === "deny" ||
          check.transaction_status === "failure" ||
          check.transaction_status === "refund"
        ) {
          payment.status = "BATAL";
          await db.paymentHistory.update({
            where: { id: payment.id },
            data: {
              status: "BATAL",
            },
          });
        } else if (check.transaction_status === "expire") {
          payment.status = "KADALUARSA";
          await db.paymentHistory.update({
            where: { id: payment.id },
            data: {
              status: "KADALUARSA",
            },
          });
        }
      }
      const returnData = {
        ...payment,
        createdAt: createdAt.toDate(),
        updatedAt: updatedAt.toDate(),
        expiredAt: expiredAt.toDate(),
        product,
      };
      return this.sendSuccess(
        res,
        returnData,
        "Berhasil mengambil detail pembayaran"
      );
    } catch (error) {
      this.sendError(res, error);
    }
  };

  checkout = async (req: Request, res: Response) => {
    try {
      const data = req.body as UserCheckoutSellKoiSchemaType;
      const userId = req.user.id;
      const koiSell = await db.koiSell.findUnique({
        where: {
          id: data.koiSellId,
        },
        include: {
          winner: true,
        },
      });
      if (!koiSell) {
        return this.notFound(res);
      }
      if (koiSell.winnerId || koiSell.status === "SELESAI") {
        return this.badRequest(res, "Koi sudah dijual atau sudah selesai");
      }
      if (koiSell.status === "DIHAPUS") {
        return this.badRequest(res, "Koi sudah dihapus");
      }
      const now = moment().tz("Asia/Jakarta");
      const id = uuidv4();
      const checkout = await midtransCheckout(id, koiSell.price);
      const midtransDirectUrl = checkout.redirect_url;
      const user = await db.user.update({
        where: {
          id: userId,
        },
        data: {
          paymentHistory: {
            create: {
              id,
              type: "SELL",
              amount: koiSell.price,
              reference: koiSell.id,
              status: "PENDING",
              createdAt: now.toDate(),
              updatedAt: now.toDate(),
              midtransDirectUrl: midtransDirectUrl,
            },
          },
        },
        select: {
          paymentHistory: {
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      await db.koiSell.update({
        where: {
          id: koiSell.id,
        },
        data: {
          status: "SELESAI",
          winnerId: userId,
        },
      });

      return this.sendSuccess(
        res,
        user.paymentHistory[0],
        "Berhasil melakukan checkout koi, harap lanjutkan pembayaran"
      );
    } catch (error) {
      this.sendError(res, error);
    }
  };

  cancelPayment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const payment = await db.paymentHistory.findUnique({
        where: {
          id,
        },
      });
      if (!payment) {
        return this.notFound(res);
      }
      const now = moment().tz("Asia/Jakarta");
      const expiredAt = moment(payment.createdAt).add(30, "minutes");
      if (now.isAfter(expiredAt)) {
        await db.paymentHistory.update({
          where: {
            id,
          },
          data: {
            status: "KADALUARSA",
          },
        });
        return this.badRequest(
          res,
          "Pembayaran sudah kadaluarsa, silahkan lakukan pembayaran kembali"
        );
      }
      if (payment.status === "SUKSES") {
        return this.badRequest(res, "Pembayaran sudah selesai");
      }
      if (payment.status === "KADALUARSA") {
        return this.badRequest(res, "Pembayaran sudah kadaluarsa");
      }
      if (payment.status === "BATAL") {
        return this.badRequest(res, "Pembayaran sudah dibatalkan");
      }
      await db.paymentHistory.update({
        where: {
          id,
        },
        data: {
          status: "BATAL",
        },
      });
      return this.sendSuccess(res, payment, "Berhasil membatalkan pembayaran");
    } catch (error) {
      this.sendError(res, error);
    }
  };
}
