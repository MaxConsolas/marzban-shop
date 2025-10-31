import { Markup } from 'telegraf';

import { TranslateFn } from '../../services/i18nService.js';

export const getBackKeyboard = (translate: TranslateFn) =>
  Markup.keyboard([[Markup.button.text(translate('? Back'))]]).resize();
