import { MiddlewareFn } from 'telegraf';

import { BotContext } from '../types.js';
import { VpnUsersRepository } from '../../db/repositories/vpnUsersRepository.js';
import { Logger } from '../../logger.js';

export const createDbCheckMiddleware = (
  repository: VpnUsersRepository,
  log: Logger
): MiddlewareFn<BotContext> =>
  async (ctx, next) => {
    if (ctx.from) {
      try {
        await repository.ensureProfile(ctx.from.id);
      } catch (error) {
        log.error({ error, userId: ctx.from.id }, 'Failed to ensure VPN profile');
      }
    }
    return next();
  };
