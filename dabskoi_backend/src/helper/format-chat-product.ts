import { $Enums, Chat, KoiAuction, KoiNego, KoiSell } from "@prisma/client";

export const formatChatProduct = (
  chat: Chat,
  {
    sells,
    negos,
    auctions,
  }: {
    sells: KoiSell[];
    negos: KoiNego[];
    auctions: KoiAuction[];
  }
): ChatProduct | null => {
  const findDataAuction = auctions.find(
    (auction) => auction.id === chat.reference
  );
  const findDataNego = negos.find((nego) => nego.id === chat.reference);
  const findDataSell = sells.find((sell) => sell.id === chat.reference);
  switch (chat.type) {
    case "REFERENCE_SELL":
      if (findDataSell) {
        return {
          id: findDataSell.id,
          name: findDataSell.name,
          images: findDataSell.images,
          type: "SELL",
          gender: findDataSell.gender,
          length: findDataSell.length,
          weight: findDataSell.weight,
          price: findDataSell.price,
          description: findDataSell.description,
          certificate: findDataSell.certificate,
        };
      }
      break;
    case "REFERENCE_NEGO":
      if (findDataNego) {
        return {
          id: findDataNego.id,
          name: findDataNego.name,
          images: findDataNego.images,
          type: "NEGO",
          gender: findDataNego.gender,
          length: findDataNego.length,
          weight: findDataNego.weight,
          price: findDataNego.price,
          description: findDataNego.description,
          certificate: findDataNego.certificate,
        };
      }
      break;
    case "REFERENCE_AUCTION":
      if (findDataAuction) {
        return {
          id: findDataAuction.id,
          name: findDataAuction.name,
          images: findDataAuction.images,
          type: "AUCTION",
          gender: findDataAuction.gender,
          length: findDataAuction.length,
          weight: findDataAuction.weight,
          price: findDataAuction.price,
          description: findDataAuction.description,
          certificate: findDataAuction.certificate,
        };
      }
      break;

    case "NEGO_RESPONSE_ACCEPT":
      if (findDataNego) {
        return {
          id: findDataNego.id,
          name: findDataNego.name,
          images: findDataNego.images,
          type: "NEGO",
          gender: findDataNego.gender,
          length: findDataNego.length,
          weight: findDataNego.weight,
          price: findDataNego.price,
          description: findDataNego.description,
          certificate: findDataNego.certificate,
        };
      }
    case "NEGO_RESPONSE_REJECT":
      if (findDataNego) {
        return {
          id: findDataNego.id,
          name: findDataNego.name,
          images: findDataNego.images,
          type: "NEGO",
          gender: findDataNego.gender,
          length: findDataNego.length,
          weight: findDataNego.weight,
          price: findDataNego.price,
          description: findDataNego.description,
          certificate: findDataNego.certificate,
        };
      }
    case "NEGO_REQUEST":
      if (findDataNego) {
        return {
          id: findDataNego.id,
          name: findDataNego.name,
          images: findDataNego.images,
          type: "NEGO",
          gender: findDataNego.gender,
          length: findDataNego.length,
          weight: findDataNego.weight,
          price: findDataNego.price,
          description: findDataNego.description,
          certificate: findDataNego.certificate,
        };
      }
    case "AUCTION_RESPONSE_ACCEPT":
      if (findDataAuction) {
        return {
          id: findDataAuction.id,
          name: findDataAuction.name,
          images: findDataAuction.images,
          type: "AUCTION",
          gender: findDataAuction.gender,
          length: findDataAuction.length,
          weight: findDataAuction.weight,
          price: findDataAuction.price,
          description: findDataAuction.description,
          certificate: findDataAuction.certificate,
        };
      }

    case "AUCTION_RESPONSE_REJECT":
      if (findDataAuction) {
        return {
          id: findDataAuction.id,
          name: findDataAuction.name,
          images: findDataAuction.images,
          type: "AUCTION",
          gender: findDataAuction.gender,
          length: findDataAuction.length,
          weight: findDataAuction.weight,
          price: findDataAuction.price,
          description: findDataAuction.description,
          certificate: findDataAuction.certificate,
        };
      }

    default:
      return null;
  }
  return null;
};

export interface ChatProduct {
  id: string;
  name: string;
  images: string[];
  type: $Enums.PaymentType;
  gender: $Enums.Gender;
  length: number;
  weight: number;
  price: number;
  description: string;
  certificate: string | null;
}

export type ChatMessage = {
  id: string;
  type: $Enums.ChatType;
  chat: {
    product: ChatProduct | null;
    content: string;
    reference: string;
  };
  role: $Enums.Role;
  readByAdmin: boolean;
  readByUser: boolean;
  user: {
    id: string;
    name: string;
    picture: string;
  };
  createdAt: Date;
};
