import { Markup } from 'telegraf';

import { Good } from '../../services/goodsService.js';
import { TranslateFn } from '../../services/i18nService.js';
import { emoji } from '../phrases.js';

export const getBuyMenuKeyboard = (translate: TranslateFn, goods: Good[]) => {
  const buttons = goods.map((good) => [
    Markup.button.callback(
      translate(`{title} - {price_ru}${emoji.ruble}`, {
        title: good.title,
        price_ru: good.price.ru
      }),
      good.callback
    )
  ]);
  return Markup.inlineKeyboard(buttons);
};
