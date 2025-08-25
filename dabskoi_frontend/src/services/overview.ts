import { GetChartResponse, GetOverviewResponse } from "@/types/api/overview";
import { api } from "@/lib/api";
import { BaseResponse } from "@/types/base-response";

export const serviceOverview = {
  getOverview: async (): Promise<GetOverviewResponse> => {
    const response = await api.get<BaseResponse<GetOverviewResponse>>(
      "/admin/overview"
    );
    return response.data.data;
  },

  getChart: async (): Promise<GetChartResponse[]> => {
    const response = await api.get<BaseResponse<GetChartResponse[]>>(
      "/admin/overview/chart"
    );
    return response.data.data;
  },
};
