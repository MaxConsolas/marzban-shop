import { AppConfig } from '../config/env.js';
import { GoodsService } from '../services/goodsService.js';
import { I18nService } from '../services/i18nService.js';
import { MarzbanService } from '../services/marzbanService.js';
import { CryptomusService, YookassaService } from '../services/payments/index.js';
import { VpnUsersRepository } from '../db/repositories/vpnUsersRepository.js';
import { YookassaPaymentsRepository } from '../db/repositories/yookassaPaymentsRepository.js';
import { CryptoPaymentsRepository } from '../db/repositories/cryptoPaymentsRepository.js';
import { Logger } from '../logger.js';

export interface BotDependencies {
  config: AppConfig;
  logger: Logger;
  goodsService: GoodsService;
  i18n: I18nService;
  marzbanService: MarzbanService;
  yookassaService: YookassaService;
  cryptomusService: CryptomusService;
  vpnUsersRepository: VpnUsersRepository;
  yookassaPaymentsRepository: YookassaPaymentsRepository;
  cryptoPaymentsRepository: CryptoPaymentsRepository;
  botUsername: string;
}
