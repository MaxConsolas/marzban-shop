import { PoolConnection } from 'mysql2/promise';

import { pool } from '../pool.js';
import { VPNUserRow } from '../types.js';
import { md5 } from '../../utils/hash.js';

export interface VPNUser {
  id: number;
  telegramId: number;
  vpnId: string;
  test: boolean;
}

const mapRow = (row: VPNUserRow): VPNUser => ({
  id: row.id,
  telegramId: row.tg_id,
  vpnId: row.vpn_id,
  test: Boolean(row.test)
});

export class VpnUsersRepository {
  private async fetchConnection(): Promise<PoolConnection> {
    return pool.getConnection();
  }

  async ensureProfile(telegramId: number): Promise<VPNUser> {
    const connection = await this.fetchConnection();
    try {
      const [rows] = await connection.query<VPNUserRow[]>(
        'SELECT * FROM vpnusers WHERE tg_id = ? LIMIT 1',
        [telegramId]
      );

      if (rows.length > 0) {
        return mapRow(rows[0]);
      }

      const vpnId = md5(String(telegramId));
      const [result] = await connection.query<{ insertId: number }>(
        'INSERT INTO vpnusers (tg_id, vpn_id, test) VALUES (?, ?, ?)',
        [telegramId, vpnId, false]
      );

      return {
        id: result.insertId,
        telegramId,
        vpnId,
        test: false
      };
    } finally {
      connection.release();
    }
  }

  async findByTelegramId(telegramId: number): Promise<VPNUser | null> {
    const connection = await this.fetchConnection();
    try {
      const [rows] = await connection.query<VPNUserRow[]>(
        'SELECT * FROM vpnusers WHERE tg_id = ? LIMIT 1',
        [telegramId]
      );
      if (rows.length === 0) {
        return null;
      }
      return mapRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  async findByVpnId(vpnId: string): Promise<VPNUser | null> {
    const connection = await this.fetchConnection();
    try {
      const [rows] = await connection.query<VPNUserRow[]>(
        'SELECT * FROM vpnusers WHERE vpn_id = ? LIMIT 1',
        [vpnId]
      );
      if (rows.length === 0) {
        return null;
      }
      return mapRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  async hasTestSubscription(telegramId: number): Promise<boolean> {
    const user = await this.findByTelegramId(telegramId);
    return user?.test ?? false;
  }

  async markTestSubscriptionUsed(telegramId: number): Promise<void> {
    const connection = await this.fetchConnection();
    try {
      await connection.query('UPDATE vpnusers SET test = ? WHERE tg_id = ?', [true, telegramId]);
    } finally {
      connection.release();
    }
  }
}
