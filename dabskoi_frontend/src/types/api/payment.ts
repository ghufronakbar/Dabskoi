import { EnumRole } from "../enum";

export interface GetPaymentResponse {
  id: string;
  userId: string;
  type: string;
  reference: string;
  amount: number;
  status: string;
  midtransDirectUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
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
  product: { id: string; images: string[]; name: string; type: string } | null;
}
