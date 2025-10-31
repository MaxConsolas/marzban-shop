import { Request, Router } from 'express';
import ipaddr from 'ipaddr.js';

import { BotDependencies } from '../bot/dependencies.js';
import { BotContext } from '../bot/types.js';
import { Telegraf } from 'telegraf';
import { verifyCryptomusWebhook } from '../utils/cryptomus.js';
import { getMainMenuKeyboard } from '../bot/keyboards/index.js';

const CRYPTOMUS_ALLOWED_IPS = ['91.227.144.54'];

const YOOKASSA_IPS = [
  '185.71.76.0/27',
  '185.71.77.0/27',
  '77.75.153.0/25',
  '77.75.156.11',
  '77.75.156.35',
  '77.75.154.128/25',
  '2a02:5180::/32'
];

const extractClientIp = (req: Request): string | undefined => {
  const headers = req.headers as Record<string, string | undefined>;
  const forwarded = headers['x-forwarded-for']?.split(',')[0]?.trim();
  return (
    headers['cf-connecting-ip'] ||
    headers['x-real-ip'] ||
    forwarded ||
    req.socket.remoteAddress ||
    undefined
  );
};

const isIpAllowed = (ip: string | undefined, whitelist: string[]): boolean => {
  if (!ip) {
    return false;
  }
  try {
    const parsedIp = ipaddr.parse(ip);
    return whitelist.some((entry) => {
      if (entry.includes('/')) {
        const [range, prefix] = ipaddr.parseCIDR(entry);
        return parsedIp.match(range, prefix);
      }
      return ip === entry;
    });
  } catch (error) {
    return false;
  }
};

export const createPaymentRouter = (deps: BotDependencies, bot: Telegraf<BotContext>) => {
  const router = Router();

  router.post('/cryptomus_payment', async (req, res) => {
    const clientIp = extractClientIp(req);
    if (!isIpAllowed(clientIp, CRYPTOMUS_ALLOWED_IPS)) {
      return res.sendStatus(403);
    }

    const payload = req.body as Record<string, unknown>;
    if (!deps.config.cryptomus?.apiKey || !verifyCryptomusWebhook(payload, deps.config.cryptomus.apiKey)) {
      return res.sendStatus(403);
    }

    const orderId = typeof payload['order_id'] === 'string' ? payload['order_id'] : undefined;
    if (!orderId) {
      return res.sendStatus(200);
    }

    const payment = await deps.cryptoPaymentsRepository.findByOrderId(orderId);
    if (!payment) {
      return res.sendStatus(200);
    }

    const status = payload['status'];
    if (status === 'paid' || status === 'paid_over') {
      const good = deps.goodsService.getByCallback(payment.callback);
      const user = await deps.vpnUsersRepository.findByTelegramId(payment.telegramId);
      if (good && user) {
        await deps.marzbanService.generateSubscription(user.vpnId, good.months);
        const translate = deps.i18n.getTranslator(payment.language);
        const infoLink = deps.config.infoChannel ?? deps.config.supportLink ?? deps.config.rulesLink ?? '';
        await bot.telegram.sendMessage(
          payment.chatId,
          translate(
            'Thank you for choice ??\n?\n<a href="{link}">Subscribe</a> so you don\'t miss any announcements ?\n?\nYour subscription is purchased and available in the "My subscription ??" section.',
            {
              link: infoLink
            }
          ),
          {
            parse_mode: 'HTML',
            ...getMainMenuKeyboard(translate, {
              trialExpired: true,
              testPeriodEnabled: deps.config.testPeriodEnabled
            })
          }
        );
      }
      await deps.cryptoPaymentsRepository.deleteByPaymentUuid(payment.paymentUuid);
    }

    if (status === 'cancel') {
      await deps.cryptoPaymentsRepository.deleteByPaymentUuid(payment.paymentUuid);
    }

    return res.sendStatus(200);
  });

  router.post('/yookassa_payment', async (req, res) => {
    const clientIp = extractClientIp(req);
    if (!isIpAllowed(clientIp, YOOKASSA_IPS)) {
      return res.sendStatus(403);
    }

    const body = req.body as { object?: Record<string, unknown> };
    const data = body.object;
    if (!data || typeof data['id'] !== 'string') {
      return res.sendStatus(200);
    }
    const paymentId = data['id'] as string;
    const payment = await deps.yookassaPaymentsRepository.findByPaymentId(paymentId);
    if (!payment) {
      return res.sendStatus(200);
    }

    const status = data['status'];
    if (status === 'succeeded') {
      const good = deps.goodsService.getByCallback(payment.callback);
      const user = await deps.vpnUsersRepository.findByTelegramId(payment.telegramId);
      if (good && user) {
        await deps.marzbanService.generateSubscription(user.vpnId, good.months);
        const translate = deps.i18n.getTranslator(payment.language);
        const infoLink = deps.config.infoChannel ?? deps.config.supportLink ?? deps.config.rulesLink ?? '';
        await bot.telegram.sendMessage(
          payment.chatId,
          translate(
            'Thank you for choice ??\n?\n<a href="{link}">Subscribe</a> so you don\'t miss any announcements ?\n?\nYour subscription is purchased and available in the "My subscription ??" section.',
            {
              link: infoLink
            }
          ),
          {
            parse_mode: 'HTML',
            ...getMainMenuKeyboard(translate, {
              trialExpired: true,
              testPeriodEnabled: deps.config.testPeriodEnabled
            })
          }
        );
      }
      await deps.yookassaPaymentsRepository.deleteByPaymentId(payment.paymentId);
    }

    if (status === 'canceled') {
      await deps.yookassaPaymentsRepository.deleteByPaymentId(payment.paymentId);
    }

    return res.sendStatus(200);
  });

  return router;
};
