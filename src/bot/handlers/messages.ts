import { Telegraf } from 'telegraf';

import { BotContext } from '../types.js';
import { BotDependencies } from '../dependencies.js';
import {
  getBackKeyboard,
  getBuyMenuKeyboard,
  getMainMenuKeyboard,
  getSubscriptionKeyboard
} from '../keyboards/index.js';
import { showMainMenu } from '../helpers/showMainMenu.js';

const matchPhrase = (phrase: string, deps: BotDependencies) => (text: string, ctx: BotContext) => {
  const translate = ctx.state.translator ?? deps.i18n.getTranslator(ctx.from?.language_code);
  return text === translate(phrase);
};

export const registerMessages = (bot: Telegraf<BotContext>, deps: BotDependencies) => {
  bot.hears(matchPhrase('Join ???????', deps), async (ctx) => {
    const translate = ctx.state.translator ?? deps.i18n.getTranslator(ctx.from?.language_code);
    const goods = deps.goodsService.getAll();
    await ctx.reply(translate('Choose the appropriate tariff ??'), getBuyMenuKeyboard(translate, goods));
  });

  bot.hears(matchPhrase('My subscription ??', deps), async (ctx) => {
    if (!ctx.from) {
      return;
    }
    const translate = ctx.state.translator ?? deps.i18n.getTranslator(ctx.from.language_code);
    const user = await deps.vpnUsersRepository.findByTelegramId(ctx.from.id);
    if (!user) {
      await showMainMenu(ctx, deps);
      return;
    }
    try {
      const marzbanUser = await deps.marzbanService.getUser(user.vpnId);
      const url = deps.marzbanService.getSubscriptionUrlFragment(marzbanUser);
      await ctx.reply(translate('Subscription page ??'), getSubscriptionKeyboard(translate, url));
    } catch (error) {
      await ctx.reply(
        translate('Your profile is not active at the moment.\n?\nYou can choose "5 days free ??" or "Join ???????".'),
        getMainMenuKeyboard(translate, {
          trialExpired: false,
          testPeriodEnabled: deps.config.testPeriodEnabled
        })
      );
    }
  });

  bot.hears(matchPhrase('Frequent questions ??', deps), async (ctx) => {
    const translate = ctx.state.translator ?? deps.i18n.getTranslator(ctx.from?.language_code);
    if (!deps.config.aboutUrl) {
      await ctx.reply(translate('Information page is temporarily unavailable.'), getBackKeyboard(translate));
      return;
    }
    const keyboard = getBackKeyboard(translate);
    await ctx.reply(
      translate('Follow the <a href="{link}">link</a> ??', { link: deps.config.aboutUrl }),
      { parse_mode: 'HTML', ...keyboard }
    );
  });

  bot.hears(matchPhrase('Support ??', deps), async (ctx) => {
    const translate = ctx.state.translator ?? deps.i18n.getTranslator(ctx.from?.language_code);
    if (!deps.config.supportLink) {
      await ctx.reply(translate('Support contact is not configured yet.'), getBackKeyboard(translate));
      return;
    }
    const keyboard = getBackKeyboard(translate);
    await ctx.reply(
      translate('Follow the <a href="{link}">link</a> and ask us a question. We are always happy to help ??', {
        link: deps.config.supportLink
      }),
      { parse_mode: 'HTML', ...keyboard }
    );
  });

  bot.hears(matchPhrase('5 days free ??', deps), async (ctx) => {
    if (!ctx.from) {
      return;
    }
    const translate = ctx.state.translator ?? deps.i18n.getTranslator(ctx.from.language_code);
    const hasTest = await deps.vpnUsersRepository.hasTestSubscription(ctx.from.id);
    if (hasTest) {
      await ctx.reply(
        translate('Your subscription is available in the "My subscription ??" section.'),
        getMainMenuKeyboard(translate, {
          trialExpired: true,
          testPeriodEnabled: deps.config.testPeriodEnabled
        })
      );
      return;
    }

    const vpnUser = await deps.vpnUsersRepository.ensureProfile(ctx.from.id);
    await deps.marzbanService.generateTestSubscription(vpnUser.vpnId);
    await deps.vpnUsersRepository.markTestSubscriptionUsed(ctx.from.id);

    const keyboard = getMainMenuKeyboard(translate, {
      trialExpired: true,
      testPeriodEnabled: deps.config.testPeriodEnabled
    });
    const infoLink = deps.config.infoChannel ?? deps.config.supportLink ?? deps.config.rulesLink ?? '';
    await ctx.reply(
      translate(
        'Thank you for choice ??\n?\n<a href="{link}">Subscribe</a> so you don\'t miss any announcements ?\n?\nYour subscription is purchased and available in the "My subscription ??" section.',
        {
          link: infoLink
        }
      ),
      { parse_mode: 'HTML', ...keyboard }
    );
  });

  bot.hears(matchPhrase('? Back', deps), async (ctx) => {
    await showMainMenu(ctx, deps);
  });
};
