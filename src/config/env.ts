import 'dotenv/config';
import { z } from 'zod';

const booleanFromEnv = (value: string | undefined, defaultValue = false): boolean => {
  if (typeof value !== 'string') {
    return defaultValue;
  }
  return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
};

const envSchema = z.object({
  BOT_TOKEN: z.string().min(1, 'BOT_TOKEN is required'),
  SHOP_NAME: z.string().optional(),
  PROTOCOLS: z.string().default('vless'),
  TEST_PERIOD: z.string().optional(),
  PERIOD_LIMIT: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 72))
    .pipe(z.number().int().positive()),
  ABOUT: z.string().optional(),
  RULES_LINK: z.string().optional(),
  SUPPORT_LINK: z.string().optional(),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  DB_USER: z.string().min(1, 'DB_USER is required'),
  DB_PASS: z.string().min(1, 'DB_PASS is required'),
  DB_ADDRESS: z.string().min(1, 'DB_ADDRESS is required'),
  DB_PORT: z
    .string()
    .min(1, 'DB_PORT is required')
    .transform((val) => Number(val))
    .pipe(z.number().int().positive()),
  PANEL_HOST: z.string().min(1, 'PANEL_HOST is required'),
  PANEL_GLOBAL: z.string().min(1, 'PANEL_GLOBAL is required'),
  PANEL_USER: z.string().min(1, 'PANEL_USER is required'),
  PANEL_PASS: z.string().min(1, 'PANEL_PASS is required'),
  WEBHOOK_URL: z.string().min(1, 'WEBHOOK_URL is required'),
  WEBHOOK_PORT: z
    .string()
    .min(1, 'WEBHOOK_PORT is required')
    .transform((val) => Number(val))
    .pipe(z.number().int().positive()),
  YOOKASSA_TOKEN: z.string().optional(),
  YOOKASSA_SHOPID: z.string().optional(),
  EMAIL: z.string().optional(),
  CRYPTO_TOKEN: z.string().optional(),
  MERCHANT_UUID: z.string().optional(),
  RENEW_NOTIFICATION_TIME: z.string().optional(),
  TG_INFO_CHANEL: z.string().optional(),
  STARS_PAYMENT_ENABLED: z.string().optional(),
  EXPIRED_NOTIFICATION_TIME: z.string().optional()
});

const env = envSchema.parse(process.env);

export interface AppConfig {
  botToken: string;
  shopName: string;
  protocols: string[];
  testPeriodEnabled: boolean;
  testPeriodHours: number;
  aboutUrl?: string;
  rulesLink?: string;
  supportLink?: string;
  database: {
    name: string;
    user: string;
    password: string;
    host: string;
    port: number;
  };
  webhook: {
    url: string;
    port: number;
  };
  yookassa?: {
    shopId: string;
    secretKey: string;
    email?: string;
  };
  cryptomus?: {
    merchantUuid: string;
    apiKey: string;
  };
  panel: {
    host: string;
    globalUrl: string;
    user: string;
    password: string;
  };
  renewNotificationTime?: string;
  expiredNotificationTime?: string;
  infoChannel?: string;
  starsPaymentEnabled: boolean;
}

const yookassa = env.YOOKASSA_SHOPID && env.YOOKASSA_TOKEN
  ? {
      shopId: env.YOOKASSA_SHOPID,
      secretKey: env.YOOKASSA_TOKEN,
      email: env.EMAIL
    }
  : undefined;

const cryptomus = env.MERCHANT_UUID && env.CRYPTO_TOKEN
  ? {
      merchantUuid: env.MERCHANT_UUID,
      apiKey: env.CRYPTO_TOKEN
    }
  : undefined;

export const config: AppConfig = {
  botToken: env.BOT_TOKEN,
  shopName: env.SHOP_NAME ?? 'VPN Shop',
  protocols: env.PROTOCOLS.split(/\s+/).filter(Boolean).map((item) => item.toLowerCase()),
  testPeriodEnabled: booleanFromEnv(env.TEST_PERIOD, false),
  testPeriodHours: env.PERIOD_LIMIT,
  aboutUrl: env.ABOUT,
  rulesLink: env.RULES_LINK,
  supportLink: env.SUPPORT_LINK,
  database: {
    name: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASS,
    host: env.DB_ADDRESS,
    port: env.DB_PORT
  },
  webhook: {
    url: env.WEBHOOK_URL.replace(/\/$/, ''),
    port: env.WEBHOOK_PORT
  },
  yookassa,
  cryptomus,
  panel: {
    host: env.PANEL_HOST.replace(/\/$/, ''),
    globalUrl: env.PANEL_GLOBAL.replace(/\/$/, ''),
    user: env.PANEL_USER,
    password: env.PANEL_PASS
  },
  renewNotificationTime: env.RENEW_NOTIFICATION_TIME ?? undefined,
  expiredNotificationTime: env.EXPIRED_NOTIFICATION_TIME ?? undefined,
  infoChannel: env.TG_INFO_CHANEL ?? undefined,
  starsPaymentEnabled: booleanFromEnv(env.STARS_PAYMENT_ENABLED, false)
};
