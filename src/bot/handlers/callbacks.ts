import { Telegraf } from 'telegraf';

import { BotContext } from '../types.js';
import { BotDependencies } from '../dependencies.js';
import {
  getPayKeyboard,
  getPaymentKeyboard,
  getXtrPayKeyboard
} from '../keyboards/index.js';
import { phrases } from '../phrases.js';

const getChatId = (ctx: BotContext): number | undefined => ctx.chat?.id ?? ctx.from?.id;

export const registerCallbacks = (bot: Telegraf<BotContext>, deps: BotDependencies) => {
  bot.action(/^pay_kassa_(.+)$/i, async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCbQuery();
      return;
    }
    const callback = ctx.match[1];
    const good = deps.goodsService.getByCallback(callback);
    if (!good) {
      await ctx.answerCbQuery();
      return;
    }
    if (!deps.yookassaService.isEnabled) {
      await ctx.answerCbQuery('Payment method unavailable');
      return;
    }

    const translate = ctx.state.translator ?? deps.i18n.getTranslator(ctx.from.language_code);
    const link = await deps.yookassaService.createPayment({
      telegramId: ctx.from.id,
      callback: good.callback,
      chatId: getChatId(ctx) ?? ctx.from.id,
      language: ctx.from.language_code ?? 'en',
      good,
      botUsername: deps.botUsername
    });

    await ctx.deleteMessage().catch(() => undefined);
    await ctx.reply(
      translate(phrases.toBePaidRuble, { amount: Math.round(link.amount) }),
      getPayKeyboard(translate, link.url)
    );
    await ctx.answerCbQuery();
  });

  bot.action(/^pay_crypto_(.+)$/i, async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCbQuery();
      return;
    }
    const callback = ctx.match[1];
    const good = deps.goodsService.getByCallback(callback);
    if (!good) {
      await ctx.answerCbQuery();
      return;
    }
    if (!deps.cryptomusService.isEnabled) {
      await ctx.answerCbQuery('Payment method unavailable');
      return;
    }

    const translate = ctx.state.translator ?? deps.i18n.getTranslator(ctx.from.language_code);
    const link = await deps.cryptomusService.createPayment({
      telegramId: ctx.from.id,
      callback: good.callback,
      chatId: getChatId(ctx) ?? ctx.from.id,
      language: ctx.from.language_code ?? 'en',
      good
    });

    await ctx.deleteMessage().catch(() => undefined);
    await ctx.reply(
      translate(phrases.toBePaidDollar, { amount: link.amount }),
      getPayKeyboard(translate, link.url)
    );
    await ctx.answerCbQuery();
  });

  bot.action(/^pay_stars_(.+)$/i, async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCbQuery();
      return;
    }
    if (!deps.config.starsPaymentEnabled) {
      await ctx.answerCbQuery('Payment method unavailable');
      return;
    }
    const callback = ctx.match[1];
    const good = deps.goodsService.getByCallback(callback);
    if (!good || !good.price.stars) {
      await ctx.answerCbQuery();
      return;
    }
    const translate = ctx.state.translator ?? deps.i18n.getTranslator(ctx.from.language_code);
    await ctx.deleteMessage().catch(() => undefined);
    await ctx.replyWithInvoice(
      {
        title: translate(phrases.subscriptionForMonths, { amount: good.months }),
        description: translate(phrases.toBePaidStars, { amount: good.price.stars }),
        payload: good.callback,
        provider_token: '',
        currency: 'XTR',
        prices: [{ label: 'XTR', amount: good.price.stars }]
      },
      {
        reply_markup: getXtrPayKeyboard(translate)
      }
    );
    await ctx.answerCbQuery();
  });

  bot.action(/^.+$/, async (ctx) => {
    const data = ctx.match?.[0] ?? ('data' in ctx.callbackQuery ? ctx.callbackQuery.data ?? '' : '');
    if (!data || data.startsWith('pay_')) {
      await ctx.answerCbQuery();
      return;
    }
    const good = deps.goodsService.getByCallback(data);
    if (!good) {
      await ctx.answerCbQuery();
      return;
    }
    const translate = ctx.state.translator ?? deps.i18n.getTranslator(ctx.from?.language_code);
    await ctx.deleteMessage().catch(() => undefined);
    await ctx.reply(
      translate(phrases.selectPaymentMethod),
      getPaymentKeyboard({
        translate,
        good,
        yookassaEnabled: deps.yookassaService.isEnabled,
        cryptomusEnabled: deps.cryptomusService.isEnabled,
        starsEnabled: deps.config.starsPaymentEnabled
      })
    );
    await ctx.answerCbQuery();
  });
};
