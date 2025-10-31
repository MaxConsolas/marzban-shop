import { Markup } from 'telegraf';

import { TranslateFn } from '../../services/i18nService.js';

export const getXtrPayKeyboard = (translate: TranslateFn) =>
  Markup.inlineKeyboard([[Markup.button.pay(translate('Pay'))]]);
