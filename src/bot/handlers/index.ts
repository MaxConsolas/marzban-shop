import { Telegraf } from 'telegraf';

import { BotContext } from '../types.js';
import { BotDependencies } from '../dependencies.js';
import { registerCommands } from './commands.js';
import { registerMessages } from './messages.js';
import { registerCallbacks } from './callbacks.js';
import { registerPayments } from './payments.js';

export const registerHandlers = (bot: Telegraf<BotContext>, deps: BotDependencies) => {
  registerCommands(bot, deps);
  registerMessages(bot, deps);
  registerCallbacks(bot, deps);
  registerPayments(bot, deps);
};
