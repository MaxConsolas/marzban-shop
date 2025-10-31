import cron from 'node-cron';
import type { Telegraf } from 'telegraf';

import { BotDependencies } from '../bot/dependencies.js';
import { BotContext } from '../bot/types.js';
import { Logger } from '../logger.js';
import { updateToken } from './updateToken.js';
import { notifyUsersToRenewSubscription } from './notifyRenewSubscription.js';
import { notifyUsersAboutExpiredSubscription } from './notifyExpiredSubscription.js';

const parseTime = (time: string): { minute: string; hour: string } | null => {
  const match = time.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    return null;
  }
  return { hour: match[1], minute: match[2] };
};

export const registerTasks = (
  deps: BotDependencies,
  bot: Telegraf<BotContext>,
  logger: Logger
) => {
  cron.schedule('*/5 * * * *', () => updateToken(deps.marzbanService, logger));

  if (deps.config.renewNotificationTime) {
    const time = parseTime(deps.config.renewNotificationTime);
    if (time) {
      cron.schedule(`${time.minute} ${time.hour} * * *`, () =>
        notifyUsersToRenewSubscription(deps, bot, logger)
      );
    } else {
      logger.warn({ time: deps.config.renewNotificationTime }, 'Invalid renew notification time format');
    }
  }

  if (deps.config.expiredNotificationTime) {
    const time = parseTime(deps.config.expiredNotificationTime);
    if (time) {
      cron.schedule(`${time.minute} ${time.hour} * * *`, () =>
        notifyUsersAboutExpiredSubscription(deps, bot, logger)
      );
    } else {
      logger.warn({ time: deps.config.expiredNotificationTime }, 'Invalid expired notification time format');
    }
  }
};
