import { api } from "@/lib/api";
import { BaseResponse } from "@/types/base-response";
import {
  GetAllRoomChatResponse,
  GetChatResponse,
  PostChatRequest,
  PostReplyNegoRequest,
} from "@/types/api/chat";

export const serviceChat = {
  getChats: async (): Promise<GetAllRoomChatResponse> => {
    const response = await api.get<BaseResponse<GetAllRoomChatResponse>>(
      "/admin/chat"
    );
    return response.data.data;
  },
  getChatByUser: async (id: string): Promise<GetChatResponse> => {
    const response = await api.get<BaseResponse<GetChatResponse>>(
      `/admin/chat/${id}`
    );
    return response.data.data;
  },
  sendMessage: async (data: PostChatRequest): Promise<BaseResponse> => {
    const response = await api.post<BaseResponse>("/admin/chat", data);
    return response.data;
  },
  replyNegoRequest: async (
    data: PostReplyNegoRequest
  ): Promise<BaseResponse> => {
    const response = await api.post<BaseResponse>("/admin/chat/nego", data);
    return response.data;
  },
};
