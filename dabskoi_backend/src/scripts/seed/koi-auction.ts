import { Gender } from "@prisma/client";
import db from "../../config/db";

const CERTIFICATE =
  "https://res.cloudinary.com/dankuh3tf/image/upload/v1756127325/certificate-of-breeding-example-v1_xc8ejx.pdf";

export const seedKoiAuction = async () => {
  console.log("🚀 Mulai proses seeding koi auction...");

  const exists = await db.koiAuction.count();
  if (exists > 0) {
    console.log("Koi auction sudah ada");
    return;
  }

  const now = Date.now();
  // Jadwal: LIVE 48 jam, mulai 2 jam lagi (48 jam), besok (48 jam), lusa (24 jam), minggu depan (24 jam)
  const schedules = [
    {
      startAt: new Date(now - 1 * 60 * 60 * 1000),
      endAt: new Date(now + 47 * 60 * 60 * 1000),
    }, // live
    {
      startAt: new Date(now + 2 * 60 * 60 * 1000),
      endAt: new Date(now + 50 * 60 * 60 * 1000),
    }, // soon
    {
      startAt: new Date(now + 24 * 60 * 60 * 1000),
      endAt: new Date(now + 24 * 60 * 60 * 1000 + 48 * 60 * 60 * 1000),
    }, // besok
    {
      startAt: new Date(now + 48 * 60 * 60 * 1000),
      endAt: new Date(now + 48 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000),
    }, // lusa
    {
      startAt: new Date(now + 7 * 24 * 60 * 60 * 1000),
      endAt: new Date(now + 8 * 24 * 60 * 60 * 1000),
    }, // minggu depan
  ];

  const koiData = [
    {
      name: "Goshiki Nisai",
      type: "Goshiki",
      gender: "F" as const,
      length: 31,
      weight: 980,
      price: 2300000, // starting price / harga awal
      description:
        "Goshiki nisai; skala gelap kontras, beni solid dan retikulasi rapih.",
      images: [
        "https://res.cloudinary.com/dankuh3tf/image/upload/v1756128172/231224-035_01-scaled_m5wfgi.jpg",
      ],
      certificate: CERTIFICATE,
    },
    {
      name: "Asagi Standard",
      type: "Asagi",
      gender: "M" as const,
      length: 33,
      weight: 1050,
      price: 2100000,
      description: "Asagi jaring biru bersih, hi merata pada sirip & perut.",
      images: [
        "https://res.cloudinary.com/dankuh3tf/image/upload/v1756128120/Koi-asagi_gdg6g2.jpg",
      ],
      certificate: CERTIFICATE,
    },
    {
      name: "Shusui Doitsu",
      type: "Shusui",
      gender: "F" as const,
      length: 29,
      weight: 820,
      price: 1900000,
      description: "Shusui doitsu; barisan sisik dorsal rapi, hi cerah.",
      images: [
        "https://res.cloudinary.com/dankuh3tf/image/upload/v1756128072/images_krmilr.jpg",
      ],
      certificate: CERTIFICATE,
    },
    {
      name: "Chagoi Friendly",
      type: "Chagoi",
      gender: "M" as const,
      length: 36,
      weight: 1400,
      price: 2800000,
      description:
        "Chagoi jinak (growth potential bagus), warna coklat homogen.",
      images: [
        "https://res.cloudinary.com/dankuh3tf/image/upload/v1756127766/images_c29bvj.jpg",
      ],
      certificate: CERTIFICATE,
    },
    {
      name: "Hi Bekko",
      type: "Bekko",
      gender: "F" as const,
      length: 27,
      weight: 730,
      price: 1600000,
      description: "Hi Bekko dengan sumi spot rapi di atas dasar merah.",
      images: [
        "https://res.cloudinary.com/dankuh3tf/image/upload/v1756127849/HiUtsuriKoi_cover_cp8lae.jpg",
      ],
      certificate: CERTIFICATE,
    },
  ];

  const created = await db.koiAuction.createManyAndReturn({
    data: koiData.map((koi, i) => ({
      ...koi,
      gender: koi.gender as Gender,
      startAt: schedules[i].startAt,
      endAt: schedules[i].endAt,
    })),
  });

  console.log("=================== DATA KOI AUCTION ===================");
  console.table(
    created.map((k) => ({
      id: k.id,
      name: k.name,
      type: k.type,
      gender: k.gender,
      price: k.price,
      startAt: k.startAt,
      endAt: k.endAt,
    }))
  );
  console.log("========================================================");

  console.log("Data koi untuk auction berhasil dibuat");
};
