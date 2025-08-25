import { Gender } from "@prisma/client";
import db from "../../config/db";

const CERTIFICATE =
  "https://res.cloudinary.com/dankuh3tf/image/upload/v1756127325/certificate-of-breeding-example-v1_xc8ejx.pdf";

export const seedKoiSell = async () => {
  console.log("🚀 Mulai proses seeding koi sell...");

  let checkKoiSell = await db.koiSell.findMany({});

  if (checkKoiSell.length > 0) {
    console.log("Koi sell sudah ada");
    return;
  }

  const koiData = [
    {
      name: "Kohaku Premium",
      type: "Kohaku",
      gender: "M",
      length: 28,
      weight: 650,
      price: 1500000,
      description:
        "Kohaku dengan pola merah-putih yang seimbang, kualitas show grade.",
      images: [
        "https://res.cloudinary.com/dankuh3tf/image/upload/v1756127226/x0609b004_brapz2.jpg",
      ],
      certificate: CERTIFICATE,
    },
    {
      name: "Showa Sanshoku",
      type: "Showa",
      gender: "F",
      length: 35,
      weight: 1200,
      price: 2500000,
      description:
        "Showa Sanshoku betina dengan warna kontras hitam, merah, dan putih.",
      images: [
        "https://res.cloudinary.com/dankuh3tf/image/upload/v1756127148/ShowaSanshokuKoi_cover_gtwvfu.jpg",
        "https://res.cloudinary.com/dankuh3tf/image/upload/v1756127196/koi-showa-sanshoku_ah6lwd.jpg",
      ],
      certificate: CERTIFICATE,
    },
    {
      name: "Sanke Nisai",
      type: "Sanke",
      gender: "M",
      length: 30,
      weight: 900,
      price: 2000000,
      description: "Taisho Sanke usia 2 tahun dengan spot hitam kecil elegan.",
      images: [
        "https://res.cloudinary.com/dankuh3tf/image/upload/v1756127074/images_zsxffh.jpg",
        "https://res.cloudinary.com/dankuh3tf/image/upload/v1756127100/Nagoshi_Nisai_Sanke_124_wkgesn.webp",
      ],
      certificate: CERTIFICATE,
    },
    {
      name: "Koi Shiro Utsuri",
      type: "Shiro Utsuri",
      gender: "F",
      length: 32,
      weight: 1100,
      price: 2200000,
      description:
        "Shiro Utsuri betina, dominan putih dengan pola sumi hitam pekat.",
      images: [
        "https://res.cloudinary.com/dankuh3tf/image/upload/v1756127004/ShiroUtsuriKoi_cover_bsauhe.jpg",
      ],
      certificate: CERTIFICATE,
    },
    {
      name: "Tancho Kohaku",
      type: "Kohaku",
      gender: "M",
      length: 27,
      weight: 700,
      price: 1800000,
      description: "Tancho Kohaku dengan bulatan merah sempurna di kepala.",
      images: [
        "https://res.cloudinary.com/dankuh3tf/image/upload/v1756126862/Ikan-Koi-Tancho-Kohaku_uv6bdf.webp",
        "https://res.cloudinary.com/dankuh3tf/image/upload/v1756126918/791e0cfa-9459-4eb2-9de9-81bf1e6b4861_qcrcfk.jpg",
      ],
      certificate: CERTIFICATE,
    },
  ];

  checkKoiSell = await db.koiSell.createManyAndReturn({
    data: koiData.map((koi) => ({
      ...koi,
      gender: koi.gender as Gender,
    })),
  });

  console.log("===================DATA KOI SELL===================");
  console.table(checkKoiSell);
  console.log("====================================================");

  console.log("Data Koi untuk penjualan berhasil dibuat");
};
