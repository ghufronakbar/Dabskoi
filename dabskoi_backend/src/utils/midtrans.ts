import axios, { AxiosError } from "axios";
import {
  MIDTRANS_SERVER_KEY,
  MIDTRANS_URL_API,
  MIDTRANS_URL_API2,
} from "../constant/midtrans";

export const midtransCheckout = async (
  order_id: string,
  gross_amount: number
) => {
  try {
    const encodedServerKey = Buffer.from(MIDTRANS_SERVER_KEY + ":").toString(
      "base64"
    );

    console.log("MIDTRANS_URL_API", MIDTRANS_URL_API);
    console.log("MIDTRANS_SERVER_KEY", MIDTRANS_SERVER_KEY);
    console.log("encodedServerKey", encodedServerKey);
    console.log("order_id", order_id);
    console.log("gross_amount", gross_amount);

    const { data } = await axios.post<ResponseMidtransCheckout>(
      MIDTRANS_URL_API + "/snap/v1/transactions",
      {
        transaction_details: {
          order_id,
          gross_amount,
        },
      },
      {
        headers: {
          Authorization: `Basic ${encodedServerKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log("Midtrans Error:", error.response?.data || error?.message);
      throw new Error("MIDTRANS_ERROR");
    } else {
      console.log("Midtrans Error:", error);
      throw new Error("MIDTRANS_ERROR");
    }
  }
};

export const midtransCheck = async (order_id: string) => {
  try {
    const encodedServerKey = Buffer.from(MIDTRANS_SERVER_KEY + ":").toString(
      "base64"
    );

    const { data } = await axios.get<ResponseMidtransCheck>(
      MIDTRANS_URL_API2 + "/v2/" + order_id + "/status",
      {
        headers: {
          Authorization: `Basic ${encodedServerKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    console.log("Midtrans Error:", error);
    return null;
  }
};

interface ResponseMidtransCheckout {
  token: string;
  redirect_url: string;
}

interface ResponseMidtransCheck {
  status_code: string;
  transaction_status: TransactionStatus;
}

type TransactionStatus =
  | "pending" // Sudah checkout, menunggu user transfer ke VA
  | "settlement" // Dana sudah diterima, transaksi sukses
  | "cancel" // Transaksi dibatalkan manual atau sistem
  | "expire" // Waktu transfer habis, VA sudah expired, user tidak membayar
  | "deny" // Ditolak oleh sistem, biasanya karena salah input atau fraud
  | "refund" // Dana dikembalikan (full/parsial), transaksi direfund
  | "failure"; // Error sistem, sangat jarang tapi bisa muncul
