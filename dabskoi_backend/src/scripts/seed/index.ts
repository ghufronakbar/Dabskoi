import db from "../../config/db";
import { seedAdmin } from "./admin";
import { seedUser } from "./user";
import { seedKoiSell } from "./koi-sell";
import { seedKoiNego } from "./koi-nego";
import { seedKoiAuction } from "./koi-auction";

async function main() {
  console.log("🚀 Mulai proses seeding...");

  await seedAdmin();
  await seedUser();
  await seedKoiSell();
  await seedKoiNego();
  await seedKoiAuction();

  console.log("✅ Proses seeding selesai.");
}

main()
  .catch((e) => {
    console.error("❌ Gagal seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
