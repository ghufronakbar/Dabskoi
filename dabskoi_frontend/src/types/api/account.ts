export interface PostLoginRequest {
  email: string;
  password: string;
}

export interface PostLoginResponse {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  picture: string | null;
  accessToken: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetProfileResponse extends PostLoginResponse {}
