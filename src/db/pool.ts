import mysql from 'mysql2/promise';

import { config } from '../config/env.js';
import { logger } from '../logger.js';

export const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: false
});

pool.on('connection', () => {
  logger.debug('MySQL connection established');
});

export type Pool = typeof pool;
