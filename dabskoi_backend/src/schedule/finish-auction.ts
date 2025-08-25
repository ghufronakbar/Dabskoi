import db from "../config/db";
import moment from "moment-timezone";
import { emitAucion, emitChatNew } from "../realtime/emitters";
import { midtransCheckout } from "../utils/midtrans";
import { formatRupiah } from "../helper/format-rupiah";
import { v4 as uuidv4 } from "uuid";

const TZ = "Asia/Jakarta";

export const finishAndSetWinner = async (id: string) => {
  // ambil lelang + bids (tertinggi di index 0)
  const auction = await db.koiAuction.findUnique({
    where: { id },
    include: {
      bids: {
        orderBy: { price: "desc" },
        include: { user: true },
      },
    },
  });

  console.log("finishAndSetWinner", id);
  console.log("auction", auction.name);
  console.log("auction.bids", auction.bids?.[0]);

  if (!auction) {
    console.log(`[auction] ${id} not found`);
    return;
  }
  if (auction.status === "SELESAI") {
    console.log(`[auction] ${auction.name} already finished`);
    return;
  }
  if (auction.status === "DIHAPUS") {
    console.log(`[auction] ${auction.name} deleted`);
    return;
  }

  // jika belum benar-benar berakhir secara waktu, abaikan (safeguard)
  const now = moment().tz(TZ);
  if (moment(auction.endAt).isSameOrAfter(now)) {
    console.log(`[auction] ${auction.name} not ended yet; skip`);
    return;
  }

  // jika tidak ada bid
  if (!auction.bids || auction.bids.length === 0) {
    await db.koiAuction.update({
      where: { id },
      data: { status: "SELESAI" },
    });
    console.log(`[auction] ${auction.name} finished with no bids`);
    return;
  }

  // pemenang = bid tertinggi (index 0)
  const winnerBid = auction.bids[0];
  const winnerId = winnerBid.userId;

  // losers (unique userIds excluding winner)
  const loserIds = Array.from(
    new Set(auction.bids.map((b) => b.userId))
  ).filter((uid) => uid !== winnerId);

  const generateId = uuidv4();
  const checkout = await midtransCheckout(generateId, winnerBid.price);
  const midtransDirectUrl = checkout.redirect_url;

  // lakukan operasi
  const winnerChat = await db.chat.create({
    data: {
      type: "AUCTION_RESPONSE_ACCEPT",
      content: `Selamat ${
        winnerBid.user?.name
      } anda berhasil memenangkan lelang ${
        auction.name
      } dengan harga ${formatRupiah(
        winnerBid.price
      )}, silahkan cek riwayat untuk melakukan pembayaran`,
      role: "ADMIN",
      userId: winnerId,
      reference: String(winnerBid.price),
      callToAction: midtransDirectUrl,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
      readByAdmin: true,
      readByUser: false,
    },
  });

  await db.paymentHistory.create({
    data: {
      id: generateId,
      reference: auction.id,
      type: "AUCTION",
      amount: winnerBid.price,
      status: "PENDING",
      midtransDirectUrl: midtransDirectUrl,
      userId: winnerId,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    },
  });

  // kirim chat untuk setiap user yang kalah (dibuat satu-per-satu supaya mudah diemit)
  const loserChats = await Promise.all(
    loserIds.map((userId) =>
      db.chat.create({
        data: {
          type: "AUCTION_RESPONSE_REJECT",
          content: `Maaf anda tidak memenangkan lelang ${auction.name}`,
          role: "ADMIN",
          userId,
          reference: auction.id,
          createdAt: now.toDate(),
          updatedAt: now.toDate(),
          readByAdmin: true,
          readByUser: false,
        },
      })
    )
  );

  // update status & winner
  const updatedAuction = await db.koiAuction.update({
    where: { id: auction.id },
    data: { status: "SELESAI", winnerId },
  });

  console.log(
    `[auction] finished: ${updatedAuction.name} | winner: ${winnerId}`
  );

  // ===== OPTIONAL: emit realtime ke user winner & losers =====
  try {
    const i = {
      sells: [],
      negos: [],
      auctions: [updatedAuction],
    };
    await emitChatNew(winnerId, winnerChat, i);
    await emitAucion({
      auction: updatedAuction,
      bid: winnerBid, // bid pemenang
      user: winnerBid?.user,
      type: "FINISHED",
      userIds: [...loserIds, winnerId],
    });

    await Promise.all(loserChats.map((c) => emitChatNew(c.userId, c, i)));
  } catch (e) {
    // aman jika realtime belum diset
  }
};
