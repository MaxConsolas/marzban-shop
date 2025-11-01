export interface VPNUserRow {
  id: number;
  tg_id: number;
  vpn_id: string;
  test: number | boolean;
}

export interface YookassaPaymentRow {
  id: number;
  tg_id: number;
  lang: string;
  payment_id: string;
  chat_id: number;
  callback: string;
}

export interface CryptomusPaymentRow {
  id: number;
  tg_id: number;
  lang: string;
  payment_uuid: string;
  order_id: string;
  chat_id: number;
  callback: string;
}
