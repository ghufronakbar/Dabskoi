import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import db from "../../config/db";
import moment from "moment-timezone";
import {
  UserMakeNegoRequestSchemaType,
  UserReferProductSchemaType,
  UserSendMessageSchemaType,
} from "../../validators/ChatValidator";
import { formatChatProduct } from "../../helper/format-chat-product";
import { emitChatNew, emitUnreadToAdmins } from "../../realtime/emitters";
import { formatRupiah } from "../../helper/format-rupiah";

export class UserChatController extends BaseController {
  constructor() {
    super();
  }

  getChatByUser = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const user = await db.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
          picture: true,
          chats: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });
      if (!user) {
        return this.notFound(res);
      }
      const [_, sells, negos, auctions] = await Promise.all([
        db.chat.updateMany({
          where: {
            userId: userId,
            readByUser: false,
            type: {
              notIn: ["NEGO_RESPONSE_ACCEPT"],
            },
          },
          data: {
            readByUser: true,
          },
        }),
        db.koiSell.findMany({
          where: {
            id: {
              in: user.chats
                ?.filter((chat) => chat.reference)
                .map((chat) => chat.reference),
            },
          },
        }),
        db.koiNego.findMany({
          where: {
            id: {
              in: user.chats
                ?.filter((chat) => chat.reference)
                .map((chat) => chat.reference),
            },
          },
        }),
        db.koiAuction.findMany({
          where: {
            id: {
              in: user.chats
                ?.filter((chat) => chat.reference)
                .map((chat) => chat.reference),
            },
          },
        }),
      ]);

      const returnData = {
        user: {
          id: user.id,
          name: user.name,
          picture: user.picture,
        },
        messages: user.chats.map((chat) => ({
          id: chat.id,
          type: chat.type,
          chat: {
            product: formatChatProduct(chat, {
              auctions,
              negos,
              sells,
            }),
            content: chat.content,
            reference: chat.reference,
          },
          role: chat.role,
          readByUser: chat.readByUser,
          readByAdmin: chat.readByAdmin,
          user:
            chat.role === "USER"
              ? {
                  id: user.id,
                  name: user.name,
                  picture: user.picture,
                }
              : null,
          createdAt: moment(chat.createdAt).tz("Asia/Jakarta").toDate(),
        })),
      };
      returnData.messages = returnData.messages
        .sort((a, b) => moment(b.createdAt).unix() - moment(a.createdAt).unix())
        .reverse();
      return this.sendSuccess(res, returnData, "Data pesan berhasil diambil");
    } catch (error) {
      this.sendError(res, error);
    }
  };

  sendMessage = async (req: Request, res: Response) => {
    try {
      const data = req.body as UserSendMessageSchemaType;

      const now = moment().tz("Asia/Jakarta");
      const chat = await db.chat.create({
        data: {
          userId: req.user.id,
          content: data.content,
          type: data.type,
          reference: null,
          role: "USER",
          createdAt: now.toDate(),
          updatedAt: now.toDate(),
          readByAdmin: false,
          readByUser: true,
        },
      });
      const [sells, negos, auctions] = await Promise.all([
        db.koiSell.findMany({
          where: {
            id: {
              in: chat.reference ? [chat.reference] : [],
            },
          },
        }),
        db.koiNego.findMany({
          where: {
            id: {
              in: chat.reference ? [chat.reference] : [],
            },
          },
        }),
        db.koiAuction.findMany({
          where: {
            id: {
              in: chat.reference ? [chat.reference] : [],
            },
          },
        }),
      ]);

      await Promise.all([
        emitChatNew(req.user.id, chat, { sells, negos, auctions }),
        emitUnreadToAdmins(req.user.id, { sells, negos, auctions }),
      ]);

      return this.sendSuccess(res, chat, "Pesan berhasil dikirim");
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  makeNegoRequest = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const data = req.body as UserMakeNegoRequestSchemaType;
      const nego = await db.koiNego.findUnique({
        where: {
          id: data.productId,
        },
      });
      if (!nego) {
        return this.notFound(res);
      }
      if (nego.status === "SELESAI" || nego.winnerId) {
        return this.sendError(
          res,
          new Error("Negosiasi ini telah selesai atau sudah terjual"),
          400
        );
      }
      const now = moment().tz("Asia/Jakarta");
      const chat = await db.chat.create({
        data: {
          userId,
          type: "NEGO_REQUEST",
          content: `Saya ingin nego koi ini dengan harga ${formatRupiah(
            data.price
          )}`,
          callToAction: String(data.price),
          reference: nego.id,
          role: "USER",
          createdAt: now.toDate(),
          updatedAt: now.toDate(),
          readByAdmin: false,
          readByUser: true,
        },
      });

      const [sells, negos, auctions] = await Promise.all([
        db.koiSell.findMany({
          where: {
            id: {
              in: chat.reference ? [chat.reference] : [],
            },
          },
        }),
        db.koiNego.findMany({
          where: {
            id: {
              in: chat.reference ? [chat.reference] : [],
            },
          },
        }),
        db.koiAuction.findMany({
          where: {
            id: {
              in: chat.reference ? [chat.reference] : [],
            },
          },
        }),
      ]);

      await Promise.all([
        emitChatNew(userId, chat, { sells, negos, auctions }),
        emitUnreadToAdmins(userId, { sells, negos, auctions }),
      ]);

      return this.sendSuccess(res, chat, "Berhasil membuat permintaan nego");
    } catch (error) {
      this.sendError(res, error);
    }
  };

  referProduct = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const data = req.body as UserReferProductSchemaType;
      let productId = "";
      let productName = "";
      switch (data.type) {
        case "SELL":
          const sell = await db.koiSell.findUnique({
            where: {
              id: data.productId,
            },
          });
          if (!sell) {
            return this.notFound(res);
          }
          productId = sell.id;
          productName = sell.name;
          break;
        case "NEGO":
          const nego = await db.koiNego.findUnique({
            where: {
              id: data.productId,
            },
          });
          if (!nego) {
            return this.notFound(res);
          }
          productId = nego.id;
          productName = nego.name;
          break;
        case "AUCTION":
          const auction = await db.koiAuction.findUnique({
            where: {
              id: data.productId,
            },
          });
          if (!auction) {
            return this.notFound(res);
          }
          productId = auction.id;
          productName = auction.name;
          break;
      }

      const now = moment().tz("Asia/Jakarta");
      const chat = await db.chat.create({
        data: {
          userId,
          type:
            data.type === "SELL"
              ? "REFERENCE_SELL"
              : data.type === "NEGO"
              ? "REFERENCE_NEGO"
              : "REFERENCE_AUCTION",
          content: `Saya ingin bertanya mengenai ${productName}`,
          reference: productId,
          role: "USER",
          createdAt: now.toDate(),
          updatedAt: now.toDate(),
        },
      });

      const [sells, negos, auctions] = await Promise.all([
        db.koiSell.findMany({
          where: {
            id: {
              in: chat.reference ? [chat.reference] : [],
            },
          },
        }),
        db.koiNego.findMany({
          where: {
            id: {
              in: chat.reference ? [chat.reference] : [],
            },
          },
        }),
        db.koiAuction.findMany({
          where: {
            id: {
              in: chat.reference ? [chat.reference] : [],
            },
          },
        }),
      ]);

      await Promise.all([
        emitChatNew(userId, chat, { sells, negos, auctions }),
        emitUnreadToAdmins(userId, { sells, negos, auctions }),
      ]);

      return this.sendSuccess(res, chat, "Berhasil merujuk produk");
    } catch (error) {
      this.sendError(res, error);
    }
  };
}
