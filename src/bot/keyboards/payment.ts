import { Markup } from 'telegraf';

import { Good } from '../../services/goodsService.js';
import { TranslateFn } from '../../services/i18nService.js';

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
        options.translate('?????? (???, ??????) - ?'),
        `pay_kassa_${options.good.callback}`
      )
    ]);
  }

  if (options.cryptomusEnabled) {
    rows.push([
      Markup.button.callback('???????????? - $', `pay_crypto_${options.good.callback}`)
    ]);
  }

  if (options.starsEnabled) {
    rows.push([
      Markup.button.callback('Telegram ??', `pay_stars_${options.good.callback}`)
    ]);
  }

  if (rows.length === 0) {
    rows.push([Markup.button.callback('Oh no...', 'none')]);
  }

  return Markup.inlineKeyboard(rows);
};
