import { Markup } from 'telegraf';

import { TranslateFn } from '../../services/i18nService.js';

interface MainMenuOptions {
  trialExpired: boolean;
  testPeriodEnabled: boolean;
}

export const getMainMenuKeyboard = (translate: TranslateFn, options: MainMenuOptions) => {
  const rows: string[][] = [];

  if (!options.trialExpired && options.testPeriodEnabled) {
    rows.push([translate('5 days free ??')]);
  }

  const joinRow = [translate('Join ???????')];
  rows.push(joinRow);

  const infoRow: string[] = [];
  if (options.trialExpired) {
    infoRow.push(translate('My subscription ??'));
  }
  infoRow.push(translate('Frequent questions ??'));
  rows.push(infoRow);

  rows.push([translate('Support ??')]);

  return Markup.keyboard(rows.map((row) => row.map((label) => Markup.button.text(label))))
    .resize()
    .persistent();
};
