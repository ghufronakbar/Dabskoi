import { Gender } from "@prisma/client";
import db from "../../config/db";

const CERTIFICATE =
  "https://res.cloudinary.com/dankuh3tf/image/upload/v1756127325/certificate-of-breeding-example-v1_xc8ejx.pdf";

export const seedKoiNego = async () => {
  console.log("🚀 Mulai proses seeding koi nego...");

  let checkKoiNego = await db.koiNego.findMany({});
  if (checkKoiNego.length > 0) {
    console.log("Koi nego sudah ada");
    return;
  }

  const koiData = [
    {
      name: "Kujaku Metallic",
      type: "Kujaku",
      gender: "F",
      length: 31,
      weight: 980,
      price: 2300000,
      description:
        "Kujaku metallic; matsuba netting rapih, beni merata, kilau metal kuat.",
      images: [
        "https://res.cloudinary.com/dankuh3tf/image/upload/v1756127716/IMG_0684_sutmkv.jpg",
      ],
      certificate: CERTIFICATE,
    },
    {
      name: "Ochiba Shigure Pattern",
      type: "Ochiba Shigure",
      gender: "M",
      length: 34,
      weight: 1150,
      price: 2400000,
      description:
        "Ochiba dengan pola 'daun jatuh' kontras; body proporsional dan tenang.",
      images: [
        "https://res.cloudinary.com/dankuh3tf/image/upload/v1756127666/images_yecfss.jpg",
      ],
      certificate: CERTIFICATE,
    },
    {
      name: "Karashi Growth",
      type: "Karashi",
      gender: "F",
      length: 38,
      weight: 1500,
      price: 3000000,
      description:
        "Karashi betina—growth potential bagus, warna kuning homogen, jinak.",
      images: [
        "https://res.cloudinary.com/dankuh3tf/image/upload/v1756127610/b3cf5332dec76953467d08bc5d1fc0a4_dfmcoh.jpg",
      ],
      certificate: CERTIFICATE,
    },
    {
      name: "Ginrin Soragoi",
      type: "Soragoi",
      gender: "M",
      length: 33,
      weight: 1100,
      price: 2200000,
      description:
        "Soragoi ginrin; sisik berkilau, warna abu-abu solid, cocok sebagai leader.",
      images: [
        "https://res.cloudinary.com/dankuh3tf/image/upload/v1756127766/images_c29bvj.jpg",
      ],
      certificate: CERTIFICATE,
    },
    {
      name: "Budo Goromo",
      type: "Goromo",
      gender: "F",
      length: 29,
      weight: 800,
      price: 2000000,
      description:
        "Budo Goromo; overlay ungu pada beni rapi, shiroji bersih, pattern seimbang.",
      images: [
        "https://res.cloudinary.com/dankuh3tf/image/upload/v1756127564/230c24cc-d225-4a0c-b78b-b33abbda50ff_zmykgm.jpg",
      ],
      certificate: CERTIFICATE,
    },
  ];

  checkKoiNego = await db.koiNego.createManyAndReturn({
    data: koiData.map((koi) => ({
      ...koi,
      gender: koi.gender as Gender,
    })),
  });

  console.log("===================DATA KOI NEGO===================");
  console.table(
    checkKoiNego.map((k) => ({
      id: k.id,
      name: k.name,
      type: k.type,
      gender: k.gender,
      price: k.price,
    }))
  );
  console.log("====================================================");

  console.log("Data Koi untuk nego berhasil dibuat");
};
