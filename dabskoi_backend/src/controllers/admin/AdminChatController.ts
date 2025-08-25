import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import db from "../../config/db";
import moment from "moment-timezone";
import {
  AdminReplyNegoRequestSchemaType,
  AdminSendMessageSchemaType,
} from "../../validators/ChatValidator";
import { v4 as uuidv4 } from "uuid";
import { formatChatProduct } from "../../helper/format-chat-product";
import { formatRupiah } from "../../helper/format-rupiah";
import { emitChatNew } from "../../realtime/emitters";
import { midtransCheckout } from "../../utils/midtrans";

export class AdminChatController extends BaseController {
  constructor() {
    super();
  }

  getChats = async (req: Request, res: Response) => {
    try {
      const users = await db.user.findMany({
        where: {
          role: "USER",
        },
        select: {
          id: true,
          name: true,
          picture: true,
          chats: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          _count: {
            select: {
              chats: {
                where: {
                  readByAdmin: false,
                },
              },
            },
          },
        },
      });
      const chats = users.map((user) => {
        const lastChat = user?.chats?.[0]?.content || "Tidak ada pesan";
        const lastTime = user?.chats?.[0]?.createdAt
          ? moment(user.chats[0].createdAt).tz("Asia/Jakarta").toDate()
          : null;
        const lastType = user?.chats?.[0]?.type || "TEXT";
        const unread = user?._count?.chats || 0;
        return {
          id: user.id,
          name: user.name,
          picture: user.picture,
          chat: {
            content: lastChat,
            createdAt: lastTime,
            unread: unread,
            type: lastType,
          },
        };
      });
      return this.sendSuccess(res, chats, "Data pesan berhasil diambil");
    } catch (error) {
      this.sendError(res, error);
    }
  };

  getChatByUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await db.user.findUnique({
        where: {
          id,
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
            userId: id,
            readByAdmin: false,
            type: {
              not: "NEGO_REQUEST",
            },
          },
          data: {
            readByAdmin: true,
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
      returnData.messages = returnData.messages.sort(
        (a, b) => moment(b.createdAt).unix() - moment(a.createdAt).unix()
      );
      return this.sendSuccess(res, returnData, "Data pesan berhasil diambil");
    } catch (error) {
      this.sendError(res, error);
    }
  };

  sendMessage = async (req: Request, res: Response) => {
    try {
      const data = req.body as AdminSendMessageSchemaType;
      const user = await db.user.findUnique({
        where: {
          id: data.userId,
        },
      });
      if (!user) {
        return this.notFound(res);
      }
      const now = moment().tz("Asia/Jakarta");
      const chat = await db.chat.create({
        data: {
          userId: data.userId,
          content: data.content,
          type: data.type,
          reference: null,
          role: "ADMIN",
          createdAt: now.toDate(),
          updatedAt: now.toDate(),
          readByAdmin: true,
          readByUser: false,
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
        emitChatNew(data.userId, chat, { sells, negos, auctions }),
      ]);

      return this.sendSuccess(res, chat, "Pesan berhasil dikirim");
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  replyNegoRequest = async (req: Request, res: Response) => {
    try {
      const data = req.body as AdminReplyNegoRequestSchemaType;
      const chat = await db.chat.findUnique({
        where: {
          id: data.messageId,
        },
      });
      if (!chat) {
        return this.notFound(res);
      }
      if (chat.type !== "NEGO_REQUEST") {
        return this.badRequest(res, "Pesan tidak valid");
      }
      if (chat.role !== "USER") {
        return this.badRequest(res, "Pesan tidak valid");
      }
      if (!chat.reference) {
        return this.badRequest(res, "Pesan tidak valid");
      }
      const nego = await db.koiNego.findUnique({
        where: {
          id: chat.reference,
        },
      });
      if (!nego) {
        return this.notFound(res);
      }

      if (nego.winnerId && data.isAccept === true) {
        return this.badRequest(res, "Nego sudah diambil");
      }
      const now = moment().tz("Asia/Jakarta");
      let midtransDirectUrl = "";

      const id = uuidv4();

      if (data.isAccept) {
        const midtransCheck = await midtransCheckout(
          id,
          Number(chat.callToAction || 0)
        );
        midtransDirectUrl = midtransCheck.redirect_url;
      }

      await db.chat.update({
        where: {
          id: data.messageId,
        },
        data: {
          readByAdmin: true,
        },
      });

      const user = await db.user.update({
        where: {
          id: chat.userId,
        },
        data: {
          chats: {
            create: {
              type: data.isAccept
                ? "NEGO_RESPONSE_ACCEPT"
                : "NEGO_RESPONSE_REJECT",
              content: data.isAccept
                ? `Nego ${nego.name} sebesar Rp ${formatRupiah(
                    Number(chat.callToAction || 0)
                  )} berhasil diterima, silahkan cek riwayat untuk melakukan pembayaran`
                : `Nego ${nego.name} sebesar Rp ${formatRupiah(
                    Number(chat.callToAction || 0)
                  )} ditolak`,
              reference: id,
              role: "ADMIN",
              createdAt: now.toDate(),
              updatedAt: now.toDate(),
              callToAction: data.isAccept ? midtransDirectUrl : null,
              readByAdmin: true,
              readByUser: false,
            },
          },
          paymentHistory: data.isAccept
            ? {
                create: {
                  id,
                  type: "NEGO",
                  amount: Number(chat.callToAction || 0),
                  reference: nego.id,
                  status: "PENDING",
                  createdAt: now.toDate(),
                  updatedAt: now.toDate(),
                  midtransDirectUrl: data.isAccept ? midtransDirectUrl : null,
                },
              }
            : undefined,
        },
        include: {
          chats: {
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (data.isAccept) {
        await db.koiNego.update({
          where: {
            id: nego.id,
          },
          data: {
            status: "SELESAI",
            winnerId: chat.userId,
          },
        });
      }

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
        emitChatNew(chat.userId, user?.chats?.[0], { sells, negos, auctions }),
      ]);

      return this.sendSuccess(
        res,
        chat,
        `Berhasil ${data.isAccept ? "menerima" : "menolak"} nego koi`
      );
    } catch (error) {
      this.sendError(res, error);
    }
  };
}
