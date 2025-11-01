import { Telegraf } from 'telegraf';

import { BotContext } from './types.js';
import { registerHandlers } from './handlers/index.js';
import { createDbCheckMiddleware } from './middlewares/dbCheck.js';
import { createLocaleMiddleware } from './middlewares/locale.js';
import { BotDependencies } from './dependencies.js';
import { I18nService } from '../services/i18nService.js';
import { VpnUsersRepository } from '../db/repositories/vpnUsersRepository.js';
import { Logger } from '../logger.js';

export interface BotSetupOptions {
  token: string;
  i18n: I18nService;
  vpnUsersRepository: VpnUsersRepository;
  logger: Logger;
}

export const createBot = async (
  options: BotSetupOptions,
  deps: Omit<BotDependencies, 'botUsername'>
): Promise<{ bot: Telegraf<BotContext>; dependencies: BotDependencies }> => {
  const bot = new Telegraf<BotContext>(options.token, {
    telegram: {
      webhookReply: false
    }
  });

  bot.use(createLocaleMiddleware(options.i18n));
  bot.use(createDbCheckMiddleware(options.vpnUsersRepository, options.logger));

  const botInfo = await bot.telegram.getMe();
  const fullDeps: BotDependencies = {
    ...deps,
    botUsername: botInfo.username ?? ''
  };

  registerHandlers(bot, fullDeps);

  return { bot, dependencies: fullDeps };
};
