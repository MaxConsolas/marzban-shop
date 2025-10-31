import { Markup } from 'telegraf';

import { TranslateFn } from '../../services/i18nService.js';
import { phrases } from '../phrases.js';

export const getSubscriptionKeyboard = (translate: TranslateFn, url: string) =>
  Markup.inlineKeyboard([[Markup.button.webApp(translate(phrases.followButton), url)]]);
