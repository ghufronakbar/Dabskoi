import { EnumRole } from "../enum";

export interface GetUserResponse {
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
  dayRegistered: number;
  diffLastLogin: number;
}

export interface GetUserOverviewResponse {
  totalUserRoleUser: number;
  totalUserRoleAdmin: number;
  totalActiveUserThisWeek: number;
  totalNewUserThisMonth: number;
}
