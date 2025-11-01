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
import { phrases } from '../phrases.js';

const resolveTranslator = (ctx: BotContext, deps: BotDependencies) =>
  ctx.state.translator ?? deps.i18n.getTranslator(ctx.from?.language_code);

type LocalizedHandler = (ctx: BotContext, translate: ReturnType<typeof resolveTranslator>) => Promise<void>;

const createHandlers = (deps: BotDependencies): Array<{ phrase: string; handle: LocalizedHandler }> => [
  {
    phrase: phrases.joinButton,
    handle: async (ctx, translate) => {
      const goods = deps.goodsService.getAll();
      await ctx.reply(translate(phrases.chooseTariff), getBuyMenuKeyboard(translate, goods));
    }
  },
  {
    phrase: phrases.subscriptionButton,
    handle: async (ctx, translate) => {
      if (!ctx.from) {
        return;
      }
      const user = await deps.vpnUsersRepository.findByTelegramId(ctx.from.id);
      if (!user) {
        await showMainMenu(ctx, deps);
        return;
      }
      try {
        const marzbanUser = await deps.marzbanService.getUser(user.vpnId);
        const url = deps.marzbanService.getSubscriptionUrlFragment(marzbanUser);
        await ctx.reply(translate(phrases.subscriptionPage), getSubscriptionKeyboard(translate, url));
      } catch (error) {
        await ctx.reply(
          translate(phrases.profileInactive),
          getMainMenuKeyboard(translate, {
            trialExpired: false,
            testPeriodEnabled: deps.config.testPeriodEnabled
          })
        );
      }
    }
  },
  {
    phrase: phrases.faqButton,
    handle: async (ctx, translate) => {
      if (!deps.config.aboutUrl) {
        await ctx.reply(translate(phrases.infoUnavailable), getBackKeyboard(translate));
        return;
      }
      const keyboard = getBackKeyboard(translate);
      await ctx.reply(
        translate(phrases.followLink, { link: deps.config.aboutUrl }),
        { parse_mode: 'HTML', ...keyboard }
      );
    }
  },
  {
    phrase: phrases.supportButton,
    handle: async (ctx, translate) => {
      if (!deps.config.supportLink) {
        await ctx.reply(translate(phrases.supportNotConfigured), getBackKeyboard(translate));
        return;
      }
      const keyboard = getBackKeyboard(translate);
      await ctx.reply(
        translate(phrases.supportMessage, { link: deps.config.supportLink }),
        { parse_mode: 'HTML', ...keyboard }
      );
    }
  },
  {
    phrase: phrases.freeButton,
    handle: async (ctx, translate) => {
      if (!ctx.from) {
        return;
      }
      const hasTest = await deps.vpnUsersRepository.hasTestSubscription(ctx.from.id);
      if (hasTest) {
        await ctx.reply(
          translate(phrases.subscriptionAvailable),
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
        translate(phrases.thankYou, { link: infoLink }),
        { parse_mode: 'HTML', ...keyboard }
      );
    }
  }
];

export const registerMessages = (bot: Telegraf<BotContext>, deps: BotDependencies) => {
  const handlers = createHandlers(deps);

  bot.on('text', async (ctx, next) => {
    if (!ctx.message?.text) {
      return next();
    }
    const translate = resolveTranslator(ctx, deps);
    const text = ctx.message.text;

    for (const handler of handlers) {
      if (text === translate(handler.phrase)) {
        await handler.handle(ctx, translate);
        return;
      }
    }

    if (text === translate(phrases.backButton)) {
      await showMainMenu(ctx, deps);
      return;
    }

    return next();
  });
};
