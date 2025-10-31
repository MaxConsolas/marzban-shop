import { Telegraf } from 'telegraf';

import { BotDependencies } from '../bot/dependencies.js';
import { BotContext } from '../bot/types.js';
import { Logger } from '../logger.js';

const HOURS_36 = 60 * 60 * 36;
const HOURS_12 = 60 * 60 * 12;

export const notifyUsersToRenewSubscription = async (
  deps: BotDependencies,
  bot: Telegraf<BotContext>,
  logger: Logger
) => {
  try {
    const marzbanUsers = await deps.marzbanService.getUsers();
    const now = Math.floor(Date.now() / 1000);
    const upcoming = marzbanUsers.filter((user) => {
      if (!user.expire) {
        return false;
      }
      return user.expire > now && user.expire < now + HOURS_36;
    });

    for (const marzbanUser of upcoming) {
      try {
        const vpnUser = await deps.vpnUsersRepository.findByVpnId(marzbanUser.username);
        if (!vpnUser) {
          continue;
        }
        const chatMember = await bot.telegram.getChatMember(vpnUser.telegramId, vpnUser.telegramId);
        const translate = deps.i18n.getTranslator(chatMember.user.language_code ?? undefined);
        const expirationLabel = marzbanUser.expire < now + HOURS_12 ? translate('today') : translate('tomorrow');
        const message = translate(
          'Hello, {name} ????\n\nThank you for using our service ??\n?\nYour VPN subscription expires {day}, at the end of the day.\n?\nTo renew it, just go to the "Join ???????" section and make a payment.',
          {
            name: chatMember.user.first_name ?? '',
            day: expirationLabel
          }
        );
        await bot.telegram.sendMessage(vpnUser.telegramId, message);
      } catch (error) {
        logger.error({ error, username: marzbanUser.username }, 'Failed to send renew notification');
      }
    }
  } catch (error) {
    logger.error({ error }, 'Failed to process renew notifications');
  }
};
