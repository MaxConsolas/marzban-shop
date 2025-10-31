import { PoolConnection } from 'mysql2/promise';

import { pool } from '../pool.js';
import { YookassaPaymentRow } from '../types.js';

export interface YookassaPayment {
  id: number;
  telegramId: number;
  language: string;
  paymentId: string;
  chatId: number;
  callback: string;
}

const mapRow = (row: YookassaPaymentRow): YookassaPayment => ({
  id: row.id,
  telegramId: row.tg_id,
  language: row.lang,
  paymentId: row.payment_id,
  chatId: row.chat_id,
  callback: row.callback
});

export class YookassaPaymentsRepository {
  private async fetchConnection(): Promise<PoolConnection> {
    return pool.getConnection();
  }

  async create(payment: Omit<YookassaPayment, 'id'>): Promise<void> {
    const connection = await this.fetchConnection();
    try {
      await connection.query(
        'INSERT INTO yookassa_payments (tg_id, lang, payment_id, chat_id, callback) VALUES (?, ?, ?, ?, ?)',
        [payment.telegramId, payment.language, payment.paymentId, payment.chatId, payment.callback]
      );
    } finally {
      connection.release();
    }
  }

  async findByPaymentId(paymentId: string): Promise<YookassaPayment | null> {
    const connection = await this.fetchConnection();
    try {
      const [rows] = await connection.query<YookassaPaymentRow[]>(
        'SELECT * FROM yookassa_payments WHERE payment_id = ? LIMIT 1',
        [paymentId]
      );
      if (rows.length === 0) {
        return null;
      }
      return mapRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  async deleteByPaymentId(paymentId: string): Promise<void> {
    const connection = await this.fetchConnection();
    try {
      await connection.query('DELETE FROM yookassa_payments WHERE payment_id = ?', [paymentId]);
    } finally {
      connection.release();
    }
  }
}
