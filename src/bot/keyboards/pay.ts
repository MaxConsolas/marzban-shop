import { Markup } from 'telegraf';

import { TranslateFn } from '../../services/i18nService.js';

export const getPayKeyboard = (translate: TranslateFn, url: string) =>
  Markup.inlineKeyboard([[Markup.button.url(translate('Pay'), url)]]);
