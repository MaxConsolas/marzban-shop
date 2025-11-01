import { Markup } from 'telegraf';

import { TranslateFn } from '../../services/i18nService.js';
import { phrases } from '../phrases.js';

export const getPayKeyboard = (translate: TranslateFn, url: string) =>
  Markup.inlineKeyboard([[Markup.button.url(translate(phrases.payLabel), url)]]);
