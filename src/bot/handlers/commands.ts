import { Telegraf } from 'telegraf';

import { BotContext } from '../types.js';
import { BotDependencies } from '../dependencies.js';
import { showMainMenu } from '../helpers/showMainMenu.js';

export const registerCommands = (bot: Telegraf<BotContext>, deps: BotDependencies) => {
  bot.start(async (ctx) => {
    if (!ctx.from) {
      return;
    }
    await showMainMenu(ctx, deps);
  });
};
