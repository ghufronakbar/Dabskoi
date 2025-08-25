import db from "../../config/db";
import bcrypt from "bcryptjs";

export const seedUser = async () => {
  console.log("🚀 Mulai proses seeding user...");

  const PASSWORD = await bcrypt.hash("12345678", 10);
  const USER_EMAIL = "berliandya@gmail.com";

  const checkUser = await db.user.findUnique({
    where: {
      email: USER_EMAIL,
    },
  });

  console.table({
    email: USER_EMAIL,
    password: "12345678",
    name: "Berliandya",
    role: "USER",
  });

  if (checkUser) {
    console.log("User sudah ada");
    return;
  }

  await db.user.create({
    data: {
      email: USER_EMAIL,
      password: PASSWORD,
      name: "Berliandya",
      role: "USER",
      address:
        "Jl. Siliwangi, Jombor Lor, Sendangadi, Kec. Mlati, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55285",
      phone: "081234567890",
    },
  });

  console.log("Admin berhasil dibuat");
};
