export type EnumGender = "M" | "F";
export type EnumStatus = "AKTIF" | "SELESAI" | "BELUM_DIMULAI" | "DIHAPUS";
export type EnumChatType =
  | "TEXT"
  | "IMAGE"
  | "REFERENCE_SELL"
  | "REFERENCE_NEGO"
  | "REFERENCE_AUCTION"
  | "NEGO_RESPONSE_ACCEPT"
  | "NEGO_RESPONSE_REJECT"
  | "NEGO_REQUEST"
  | "AUCTION_RESPONSE_ACCEPT"
  | "AUCTION_RESPONSE_REJECT";

export type EnumPaymentStatus = "PENDING" | "SUKSES" | "BATAL" | "KADALUARSA";
export type EnumPaymentType = "NEGO" | "AUCTION" | "SELL";
export type EnumRole = "USER" | "ADMIN";
