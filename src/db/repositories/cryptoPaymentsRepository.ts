import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import { pool } from '../pool.js';
import { CryptomusPaymentRow } from '../types.js';

export interface CryptomusPayment {
  id: number;
  telegramId: number;
  language: string;
  paymentUuid: string;
  orderId: string;
  chatId: number;
  callback: string;
}

type CryptomusPaymentRowResult = CryptomusPaymentRow & RowDataPacket;

const mapRow = (row: CryptomusPaymentRow): CryptomusPayment => ({
  id: row.id,
  telegramId: row.tg_id,
  language: row.lang,
  paymentUuid: row.payment_uuid,
  orderId: row.order_id,
  chatId: row.chat_id,
  callback: row.callback
});

export class CryptoPaymentsRepository {
  private async fetchConnection(): Promise<PoolConnection> {
    return pool.getConnection();
  }

  async create(payment: Omit<CryptomusPayment, 'id' | 'paymentUuid'> & { paymentUuid: string }): Promise<void> {
    const connection = await this.fetchConnection();
    try {
      await connection.execute<ResultSetHeader>(
        'INSERT INTO crypto_payments (tg_id, lang, payment_uuid, order_id, chat_id, callback) VALUES (?, ?, ?, ?, ?, ?)',
        [payment.telegramId, payment.language, payment.paymentUuid, payment.orderId, payment.chatId, payment.callback]
      );
    } finally {
      connection.release();
    }
  }

  async findByOrderId(orderId: string): Promise<CryptomusPayment | null> {
    const connection = await this.fetchConnection();
    try {
      const [rows] = await connection.execute<CryptomusPaymentRowResult[]>(
        'SELECT * FROM crypto_payments WHERE order_id = ? LIMIT 1',
        [orderId]
      );
      if (rows.length === 0) {
        return null;
      }
      return mapRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  async deleteByPaymentUuid(paymentUuid: string): Promise<void> {
    const connection = await this.fetchConnection();
    try {
      await connection.execute<ResultSetHeader>(
        'DELETE FROM crypto_payments WHERE payment_uuid = ?',
        [paymentUuid]
      );
    } finally {
      connection.release();
    }
  }
}
