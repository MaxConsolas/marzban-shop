import express from 'express';
import type { Telegraf } from 'telegraf';

import { BotContext } from './bot/types.js';
import { BotDependencies } from './bot/dependencies.js';
import { createPaymentRouter } from './routes/paymentRoutes.js';

export const buildServer = (bot: Telegraf<BotContext>, deps: BotDependencies) => {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/webhook', bot.webhookCallback('/webhook'));

  app.use(createPaymentRouter(deps, bot));

  return app;
};
