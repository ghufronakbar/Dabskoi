import { EnumGender, EnumRole, EnumStatus } from "../enum";

export interface GetKoiSellResponse {
  id: string;
  name: string;
  type: string;
  gender: EnumGender;
  length: number;
  weight: number;

  price: number;
  description: string;
  images: string[];
  certificate: string | null;

  status: EnumStatus;

  createdAt: Date;
  updatedAt: Date;

  winnerId: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetKoiNegoResponse extends GetKoiSellResponse {}

export interface GetKoiAuctionResponse extends GetKoiSellResponse {
  user: {
    id: string;
    email: string;
    password: string;
    name: string;
    picture: string | null;
    address: string | null;
    phone: string | null;
    role: EnumRole;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  bids: {
    id: string;
    price: number;
    koiAuctionId: string;
    koiAuction: GetKoiAuctionResponse;
    userId: string;
    user: {
      id: string;
      email: string;
      password: string;
      name: string;
      picture: string | null;
      address: string | null;
      phone: string | null;
      role: EnumRole;
      createdAt: Date;
      updatedAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
  }[];
  startAt: Date;
  endAt: Date;
}

export interface PostKoiSellRequest {
  name: string;
  type: string;
  gender: EnumGender;
  length: number;
  weight: number;
  price: number;
  description: string;
  images: string[];
  certificate: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PostKoiNegoRequest extends PostKoiSellRequest {}

export interface PostKoiAuctionRequest extends PostKoiSellRequest {
  startAt: Date;
  endAt: Date;
}
