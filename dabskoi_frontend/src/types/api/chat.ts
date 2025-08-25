import { EnumChatType, EnumGender, EnumPaymentType, EnumRole } from "../enum";

export interface GetAllRoomChatResponse {
  id: string;
  name: string;
  picture: string | null;
  chat: {
    content: string;
    createdAt: Date | null;
    unread: number;
    type: EnumChatType;
  };
}

export interface GetChatResponse {
  user: {
    id: string;
    name: string;
    picture: string | null;
  };
  messages: {
    id: string;
    type: EnumChatType;
    chat: {
      product: {
        id: string;
        name: string;
        images: string[];
        type: EnumPaymentType;
        gender: EnumGender;
        length: number;
        weight: number;
        price: number;
        description: string;
        certificate: string | null;
      } | null;
      content: string;
      reference: string | null;
    };
    role: EnumRole;
    readByAdmin: boolean;
    readByUser: boolean;
    user: {
      id: string;
      name: string;
      picture: string | null;
    } | null;
    createdAt: Date;
  }[];
}

export interface PostChatRequest {
  userId: string;
  content: string;
  type: "IMAGE" | "TEXT";
}

export interface PostReplyNegoRequest {
  messageId: string;
  isAccept: boolean;
}
