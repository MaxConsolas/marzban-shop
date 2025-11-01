import { MarzbanService } from '../services/marzbanService.js';
import { Logger } from '../logger.js';

export const updateToken = async (marzban: MarzbanService, logger: Logger) => {
  try {
    await marzban.refreshToken();
    logger.debug('Marzban token updated by scheduler');
  } catch (error) {
    logger.error({ error }, 'Failed to refresh Marzban token');
  }
};
