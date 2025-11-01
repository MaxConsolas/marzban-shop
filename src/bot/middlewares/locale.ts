import { MiddlewareFn } from 'telegraf';

import { I18nService } from '../../services/i18nService.js';
import { BotContext } from '../types.js';

export const createLocaleMiddleware = (i18n: I18nService): MiddlewareFn<BotContext> =>
  async (ctx, next) => {
    const localeFromUser = ctx.from?.language_code;
    const locale = localeFromUser ?? (ctx.chat?.type === 'channel' ? 'en' : undefined);
    const translator = i18n.getTranslator(locale);
    ctx.state.locale = locale ?? 'en';
    ctx.state.translator = translator;
    return next();
  };
