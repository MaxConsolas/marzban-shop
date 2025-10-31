import { readFileSync, statSync, existsSync } from 'fs';
import { resolve } from 'path';

import { logger } from '../logger.js';

export interface GoodPrice {
  en: number;
  ru: number;
  stars?: number;
}

export interface Good {
  title: string;
  price: GoodPrice;
  callback: string;
  months: number;
}

interface GoodsCache {
  items: Good[];
  mtimeMs: number;
}

export class GoodsService {
  private goodsPath = resolve(process.cwd(), 'goods.json');
  private fallbackPath = resolve(process.cwd(), 'goods.example.json');
  private cache: GoodsCache | null = null;

  private readGoodsFile(filePath: string): Good[] {
    const raw = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw) as Good[];
    return data;
  }

  private getActivePath(): string {
    if (existsSync(this.goodsPath)) {
      return this.goodsPath;
    }
    if (existsSync(this.fallbackPath)) {
      logger.warn('goods.json not found, using goods.example.json as fallback');
      return this.fallbackPath;
    }
    throw new Error('Goods file not found. Provide goods.json or goods.example.json.');
  }

  private loadGoods(): Good[] {
    const path = this.getActivePath();
    const stats = statSync(path);

    if (this.cache && this.cache.mtimeMs === stats.mtimeMs) {
      return this.cache.items;
    }

    const goods = this.readGoodsFile(path);
    this.cache = {
      items: goods,
      mtimeMs: stats.mtimeMs
    };
    return goods;
  }

  getAll(): Good[] {
    return this.loadGoods();
  }

  getByCallback(callback: string): Good | null {
    return this.loadGoods().find((good) => good.callback === callback) ?? null;
  }

  getCallbacks(): string[] {
    return this.loadGoods().map((good) => good.callback);
  }
}
