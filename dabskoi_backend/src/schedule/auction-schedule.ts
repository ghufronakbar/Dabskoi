import cron, { ScheduledTask } from "node-cron";
import moment from "moment-timezone";
import db from "../config/db";
import { KoiAuction } from "@prisma/client";
import { finishAndSetWinner } from "./finish-auction"; // <- pindahkan fungsi finish kamu ke file ini atau sesuaikan path

const TZ = "Asia/Jakarta";

/**
 * Map job yang lagi aktif. Key = auctionId
 */
const CLOSE_JOBS: Map<string, ScheduledTask> = new Map();

/**
 * Guard sederhana untuk mencegah eksekusi ganda
 * (misal karena refresh dan job fire di saat bersamaan)
 */
const RUNNING: Set<string> = new Set();

/**
 * Utility: buat cron expression untuk sekali jalan sesuai endAt (TZ Asia/Jakarta).
 * Format 6 field (dengan detik) agar presisi: "s m H D M *"
 * Job akan `stop()` sendiri setelah eksekusi pertama.
 */
function cronExprFromDate(date: Date): string {
  const m = moment(date).tz(TZ);
  const s = m.seconds();
  const min = m.minutes();
  const h = m.hours();
  const dom = m.date();
  const mon = m.month() + 1; // 0-based -> 1-12
  return `${s} ${min} ${h} ${dom} ${mon} *`;
}

/**
 * Batalkan (stop) job close untuk auction tertentu (jika ada)
 */
export function cancelAuctionClose(auctionId: string): void {
  const task = CLOSE_JOBS.get(auctionId);
  if (task) {
    task.stop();
    CLOSE_JOBS.delete(auctionId);
    // console.log(`[cron] canceled close job for ${auctionId}`);
  }
}

/**
 * Jadwalkan/ulang job close untuk 1 auction.
 * - Hanya menjadwalkan jika status AKTIF & endAt > now(TZ)
 * - Jika endAt <= now, eksekusi finishAndSetWinner segera
 * - Job akan berhenti sendiri setelah eksekusi
 */
export function scheduleAuctionCloseForOne(
  a: Pick<KoiAuction, "id" | "endAt" | "status" | "name">
): void {
  // selalu clear job lama untuk auction ini
  cancelAuctionClose(a.id);

  if (a.status !== "AKTIF") {
    // tidak perlu job
    return;
  }

  const now = moment().tz(TZ);
  const endAt = moment(a.endAt).tz(TZ);
  if (!endAt.isValid()) return;

  if (endAt.isSameOrBefore(now)) {
    // sudah lewat → eksekusi segera (tanpa menjadwalkan)
    void safeFinish(a.id);
    return;
  }

  const expr = cronExprFromDate(endAt.toDate());
  const task = cron.schedule(
    expr,
    async () => {
      try {
        await safeFinish(a.id);
      } finally {
        // stop & hapus job agar hanya sekali jalan
        cancelAuctionClose(a.id);
      }
    },
    { timezone: TZ }
  );

  CLOSE_JOBS.set(a.id, task);
  // console.log(`[cron] scheduled close for ${a.name} @ ${endAt.format()}`);
}

/**
 * Wrapper finish agar aman dari double-run
 */
async function safeFinish(auctionId: string): Promise<void> {
  if (RUNNING.has(auctionId)) return;
  RUNNING.add(auctionId);
  try {
    await finishAndSetWinner(auctionId);
  } catch (e) {
    console.error(`[auction] finish failed ${auctionId}`, e);
  } finally {
    RUNNING.delete(auctionId);
  }
}

/**
 * Refresh semua job close (dipanggil saat startup ATAU setelah admin mengubah auction).
 * - Tidak melakukan polling
 * - Tidak mengurus startDue (kamu bilang sudah ditangani resource lain)
 * - Hanya menjadwalkan untuk auction status AKTIF
 * - Jika ada AKTIF yang endAt sudah lewat, langsung diselesaikan
 */
export async function refreshAuctionCron(): Promise<void> {
  // Bersihkan semua job agar state fresh
  for (const [id, task] of CLOSE_JOBS) {
    task.stop();
    CLOSE_JOBS.delete(id);
  }

  const now = moment().tz(TZ);

  const actives = await db.koiAuction.findMany({
    where: {
      status: "AKTIF",
      endAt: {
        gte: now.toDate(),
      },
    },
    select: { id: true, name: true, endAt: true, status: true },
  });

  const tableCron: {
    id: string;
    name: string;
    endAt: Date;
    jakartaTime: string;
  }[] = [];

  for (const a of actives) {
    tableCron.push({
      id: a.id,
      name: a.name,
      endAt: a.endAt,
      jakartaTime: moment(a.endAt).tz(TZ).format("DD-MM-YYYY HH:mm:ss"),
    });
    scheduleAuctionCloseForOne(a);
  }

  console.log(
    `[cron] refreshed close jobs for ${actives.length} active auctions (TZ=${TZ})`
  );
  console.table(tableCron);
}

interface TableCron {
  id: string;
  name: string;
  endAt: Date;
  status: "AKTIF" | "SELESAI" | "DIHAPUS";
}
