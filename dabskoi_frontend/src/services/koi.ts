import { api } from "@/lib/api";
import { BaseResponse } from "@/types/base-response";
import {
  GetKoiSellResponse,
  GetKoiNegoResponse,
  GetKoiAuctionResponse,
  PostKoiSellRequest,
  PostKoiNegoRequest,
  PostKoiAuctionRequest,
} from "@/types/api/koi";

export const serviceKoi = {
  getSells: async (): Promise<GetKoiSellResponse> => {
    const response = await api.get<BaseResponse<GetKoiSellResponse>>(
      "/admin/koi/sells"
    );
    return response.data.data;
  },
  getNegos: async (): Promise<GetKoiNegoResponse> => {
    const response = await api.get<BaseResponse<GetKoiNegoResponse>>(
      "/admin/koi/negos"
    );
    return response.data.data;
  },
  getAuctions: async (): Promise<GetKoiAuctionResponse> => {
    const response = await api.get<BaseResponse<GetKoiAuctionResponse>>(
      "/admin/koi/auctions"
    );
    return response.data.data;
  },
  getSellById: async (id: string): Promise<GetKoiSellResponse> => {
    const response = await api.get<BaseResponse<GetKoiSellResponse>>(
      `/admin/koi/sells/${id}`
    );
    return response.data.data;
  },
  getNegoById: async (id: string): Promise<GetKoiNegoResponse> => {
    const response = await api.get<BaseResponse<GetKoiNegoResponse>>(
      `/admin/koi/negos/${id}`
    );
    return response.data.data;
  },
  getAuctionById: async (id: string): Promise<GetKoiAuctionResponse> => {
    const response = await api.get<BaseResponse<GetKoiAuctionResponse>>(
      `/admin/koi/auctions/${id}`
    );
    return response.data.data;
  },
  createSell: async (data: PostKoiSellRequest): Promise<BaseResponse> => {
    const response = await api.post<BaseResponse>("/admin/koi/sells", data);
    return response.data;
  },
  createNego: async (data: PostKoiNegoRequest): Promise<BaseResponse> => {
    const response = await api.post<BaseResponse>("/admin/koi/negos", data);
    return response.data;
  },
  createAuction: async (data: PostKoiAuctionRequest): Promise<BaseResponse> => {
    const response = await api.post<BaseResponse>("/admin/koi/auctions", data);
    return response.data;
  },
  deleteSell: async (id: string): Promise<BaseResponse> => {
    const response = await api.delete<BaseResponse>(`/admin/koi/sells/${id}`);
    return response.data;
  },
  deleteNego: async (id: string): Promise<BaseResponse> => {
    const response = await api.delete<BaseResponse>(`/admin/koi/negos/${id}`);
    return response.data;
  },
  deleteAuction: async (id: string): Promise<BaseResponse> => {
    const response = await api.delete<BaseResponse>(
      `/admin/koi/auctions/${id}`
    );
    return response.data;
  },
};
