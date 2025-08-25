export interface GetOverviewResponse {
  activeKoiSell: number;
  activeKoiNego: number;
  activeKoiAuction: number;
  unreadChat: number;
}

export interface GetChartResponse {
  date: string;
  countAll: number;
  countSell: number;
  countNego: number;
  countAuction: number;
  totalAmountAll: number;
  totalAmountSell: number;
  totalAmountNego: number;
  totalAmountAuction: number;
}
