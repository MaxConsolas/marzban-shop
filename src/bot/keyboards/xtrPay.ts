import { InlineKeyboardMarkup } from 'telegraf/types';
import { Markup } from 'telegraf';

import { TranslateFn } from '../../services/i18nService.js';
import { phrases } from '../phrases.js';

export const getXtrPayKeyboard = (translate: TranslateFn): InlineKeyboardMarkup =>
  Markup.inlineKeyboard([[Markup.button.pay(translate(phrases.payLabel))]]).reply_markup;
