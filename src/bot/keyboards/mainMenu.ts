import { Markup } from 'telegraf';

import { TranslateFn } from '../../services/i18nService.js';
import { phrases } from '../phrases.js';

interface MainMenuOptions {
  trialExpired: boolean;
  testPeriodEnabled: boolean;
}

export const getMainMenuKeyboard = (translate: TranslateFn, options: MainMenuOptions) => {
  const rows: string[][] = [];

  if (!options.trialExpired && options.testPeriodEnabled) {
    rows.push([translate(phrases.freeButton)]);
  }

  rows.push([translate(phrases.joinButton)]);

  const infoRow: string[] = [];
  if (options.trialExpired) {
    infoRow.push(translate(phrases.subscriptionButton));
  }
  infoRow.push(translate(phrases.faqButton));
  rows.push(infoRow);

  rows.push([translate(phrases.supportButton)]);

  return Markup.keyboard(rows.map((row) => row.map((label) => Markup.button.text(label))))
    .resize()
    .persistent();
};
