import db from "../../config/db";
import bcrypt from "bcryptjs";

export const seedAdmin = async () => {
  console.log("🚀 Mulai proses seeding admin...");

  const PASSWORD = await bcrypt.hash("12345678", 10);
  const ADMIN_EMAIL = "admin@dabskoi.com";

  const checkAdmin = await db.user.findUnique({
    where: {
      email: ADMIN_EMAIL,
    },
  });

  console.table({
    email: ADMIN_EMAIL,
    password: "12345678",
    name: "Admin Dabskoi",
    role: "ADMIN",
  });

  if (checkAdmin) {
    console.log("Admin sudah ada");
    return;
  }

  await db.user.create({
    data: {
      email: ADMIN_EMAIL,
      password: PASSWORD,
      name: "Admin Dabskoi",
      role: "ADMIN",
      address:
        "Jl. Siliwangi, Jombor Lor, Sendangadi, Kec. Mlati, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55285",
      phone: "081234567890",
    },
  });

  console.log("Admin berhasil dibuat");
};
