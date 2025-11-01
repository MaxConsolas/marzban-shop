import { Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

import { TranslateFn } from '../services/i18nService.js';

export interface BotState {
  locale?: string;
  translator?: TranslateFn;
}

export type BotContext = Context<Update> & {
  state: BotState;
};
