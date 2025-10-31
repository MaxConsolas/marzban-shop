import { Markup } from 'telegraf';

import { Good } from '../../services/goodsService.js';
import { TranslateFn } from '../../services/i18nService.js';
import { phrases } from '../phrases.js';

interface PaymentKeyboardOptions {
  good: Good;
  translate: TranslateFn;
  yookassaEnabled: boolean;
  cryptomusEnabled: boolean;
  starsEnabled: boolean;
}

export const getPaymentKeyboard = (options: PaymentKeyboardOptions) => {
  const rows: ReturnType<typeof Markup.button.callback>[][] = [];

  if (options.yookassaEnabled) {
    rows.push([
      Markup.button.callback(
        options.translate(phrases.yookassaButton),
        `pay_kassa_${options.good.callback}`
      )
    ]);
  }

  if (options.cryptomusEnabled) {
    rows.push([
      Markup.button.callback(phrases.cryptoButton, `pay_crypto_${options.good.callback}`)
    ]);
  }

  if (options.starsEnabled) {
    rows.push([
      Markup.button.callback(phrases.telegramStarsButton, `pay_stars_${options.good.callback}`)
    ]);
  }

  if (rows.length === 0) {
    rows.push([Markup.button.callback('Oh no...', 'none')]);
  }

  return Markup.inlineKeyboard(rows);
};
