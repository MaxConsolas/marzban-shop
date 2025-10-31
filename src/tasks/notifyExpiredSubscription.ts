import { Telegraf } from 'telegraf';

import { BotDependencies } from '../bot/dependencies.js';
import { BotContext } from '../bot/types.js';
import { Logger } from '../logger.js';

const ONE_DAY = 60 * 60 * 24;

export const notifyUsersAboutExpiredSubscription = async (
  deps: BotDependencies,
  bot: Telegraf<BotContext>,
  logger: Logger
) => {
  try {
    const marzbanUsers = await deps.marzbanService.getUsers();
    const now = Math.floor(Date.now() / 1000);
    const yesterday = now - ONE_DAY;

    const targets = marzbanUsers.filter((user) => {
      if (!user.expire) {
        return false;
      }
      return user.expire > yesterday && user.expire < now;
    });

    for (const marzbanUser of targets) {
      try {
        const vpnUser = await deps.vpnUsersRepository.findByVpnId(marzbanUser.username);
        if (!vpnUser) {
          continue;
        }
        const chatMember = await bot.telegram.getChatMember(vpnUser.telegramId, vpnUser.telegramId);
        const translate = deps.i18n.getTranslator(chatMember.user.language_code ?? undefined);
        const message = translate('message_notify_expired_sub', {
          name: chatMember.user.first_name ?? ''
        });
        await bot.telegram.sendMessage(vpnUser.telegramId, message);
      } catch (error) {
        logger.error({ error, username: marzbanUser.username }, 'Failed to send expired notification');
      }
    }
  } catch (error) {
    logger.error({ error }, 'Failed to process expired notifications');
  }
};
