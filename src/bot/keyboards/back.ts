import { Markup } from 'telegraf';

import { TranslateFn } from '../../services/i18nService.js';
import { phrases } from '../phrases.js';

export const getBackKeyboard = (translate: TranslateFn) =>
  Markup.keyboard([[Markup.button.text(translate(phrases.backButton))]]).resize();
