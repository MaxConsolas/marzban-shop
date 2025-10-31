import { Telegraf } from 'telegraf';

import { BotContext } from '../types.js';
import { BotDependencies } from '../dependencies.js';
import { getMainMenuKeyboard } from '../keyboards/index.js';

export const registerPayments = (bot: Telegraf<BotContext>, deps: BotDependencies) => {
  bot.on('pre_checkout_query', async (ctx) => {
    const payload = ctx.preCheckoutQuery.invoice_payload;
    const good = deps.goodsService.getByCallback(payload);
    if (!good) {
      await ctx.answerPreCheckoutQuery(false, deps.i18n.translate('Error: Invalid product type.\nPlease contact the support team.', ctx.from?.language_code));
      return;
    }
    await ctx.answerPreCheckoutQuery(true);
  });

  bot.on('successful_payment', async (ctx) => {
    if (!ctx.from) {
      return;
    }
    const payment = ctx.message?.successful_payment;
    if (!payment) {
      return;
    }
    const good = deps.goodsService.getByCallback(payment.invoice_payload);
    if (!good) {
      return;
    }
    const user = await deps.vpnUsersRepository.findByTelegramId(ctx.from.id);
    if (!user) {
      return;
    }
    await deps.marzbanService.generateSubscription(user.vpnId, good.months);
    const translate = ctx.state.translator ?? deps.i18n.getTranslator(ctx.from.language_code);
    const infoLink = deps.config.infoChannel ?? deps.config.supportLink ?? deps.config.rulesLink ?? '';
    await ctx.reply(
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
  });
};
