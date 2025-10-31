import { BotContext } from '../types.js';
import { BotDependencies } from '../dependencies.js';
import { getMainMenuKeyboard } from '../keyboards/index.js';

export const showMainMenu = async (ctx: BotContext, deps: BotDependencies) => {
  if (!ctx.from) {
    return;
  }
  const translate = ctx.state.translator ?? deps.i18n.getTranslator(ctx.from.language_code);
  const hadTest = await deps.vpnUsersRepository.hasTestSubscription(ctx.from.id);
  const message = translate('Hello, {name} ????\n\nSelect an action ??', {
    name: ctx.from.first_name ?? ''
  });
  await ctx.reply(message, getMainMenuKeyboard(translate, {
    trialExpired: hadTest,
    testPeriodEnabled: deps.config.testPeriodEnabled
  }));
};
