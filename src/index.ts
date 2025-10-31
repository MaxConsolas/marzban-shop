import { config } from './config/env.js';
import { logger } from './logger.js';
import { GoodsService } from './services/goodsService.js';
import { I18nService } from './services/i18nService.js';
import { MarzbanService } from './services/marzbanService.js';
import { YookassaService, CryptomusService } from './services/payments/index.js';
import { VpnUsersRepository } from './db/repositories/vpnUsersRepository.js';
import { YookassaPaymentsRepository } from './db/repositories/yookassaPaymentsRepository.js';
import { CryptoPaymentsRepository } from './db/repositories/cryptoPaymentsRepository.js';
import { createBot } from './bot/index.js';
import { buildServer } from './server.js';
import { registerTasks } from './tasks/index.js';

const bootstrap = async () => {
  const goodsService = new GoodsService();
  const i18nService = new I18nService();
  const marzbanService = new MarzbanService(config, logger);
  await marzbanService.refreshToken();

  const vpnUsersRepository = new VpnUsersRepository();
  const yookassaPaymentsRepository = new YookassaPaymentsRepository();
  const cryptoPaymentsRepository = new CryptoPaymentsRepository();

  const yookassaService = new YookassaService(config, yookassaPaymentsRepository);
  const cryptomusService = new CryptomusService(config, cryptoPaymentsRepository);

  const { bot, dependencies } = await createBot(
    {
      token: config.botToken,
      i18n: i18nService,
      vpnUsersRepository,
      logger
    },
    {
      config,
      logger,
      goodsService,
      i18n: i18nService,
      marzbanService,
      yookassaService,
      cryptomusService,
      vpnUsersRepository,
      yookassaPaymentsRepository,
      cryptoPaymentsRepository
    }
  );

  await bot.telegram.setWebhook(`${config.webhook.url}/webhook`);

  const app = buildServer(bot, dependencies);

  app.listen(config.webhook.port, '0.0.0.0', () => {
    logger.info({ port: config.webhook.port }, 'Webhook server is running');
  });

  registerTasks(dependencies, bot, logger);

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down bot');
    try {
      await bot.telegram.deleteWebhook();
    } catch (error) {
      logger.error({ error }, 'Failed to delete webhook');
    }
    process.exit(0);
  };

  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('SIGINT', () => void shutdown('SIGINT'));
};

bootstrap().catch((error) => {
  logger.error({ error }, 'Fatal error on bootstrap');
  process.exit(1);
});
