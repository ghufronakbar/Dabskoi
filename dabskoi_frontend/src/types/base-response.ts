export interface BaseResponse<T = undefined> {
  metaData: {
    code: number;
    message: string;
  };
  data: T;
  responseMessage: string;
}
