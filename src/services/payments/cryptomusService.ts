import axios from 'axios';

import { AppConfig } from '../../config/env.js';
import { Good } from '../goodsService.js';
import { CryptoPaymentsRepository } from '../../db/repositories/cryptoPaymentsRepository.js';
import { md5 } from '../../utils/hash.js';
import { computeCryptomusSignature } from '../../utils/cryptomus.js';
import { PaymentLink } from './types.js';

interface CreateCryptomusPaymentParams {
  telegramId: number;
  callback: string;
  chatId: number;
  language: string;
  good: Good;
}

export class CryptomusService {
  constructor(private readonly config: AppConfig, private readonly repository: CryptoPaymentsRepository) {}

  get isEnabled(): boolean {
    return Boolean(this.config.cryptomus);
  }

  async createPayment(params: CreateCryptomusPaymentParams): Promise<PaymentLink> {
    if (!this.isEnabled || !this.config.cryptomus) {
      throw new Error('Cryptomus integration is not configured');
    }

    const orderId = md5(`${params.telegramId}${Date.now()}${params.callback}`);
    const payload = {
      amount: String(params.good.price.en),
      currency: 'USD',
      order_id: orderId,
      lifetime: 1800,
      url_callback: `${this.config.webhook.url}/cryptomus_payment`,
      is_payment_multiple: false
    };

    const headers = {
      merchant: this.config.cryptomus.merchantUuid,
      sign: computeCryptomusSignature(payload, this.config.cryptomus.apiKey),
      'Content-Type': 'application/json'
    };

    const response = await axios.post('https://api.cryptomus.com/v1/payment', payload, { headers });
    const result = response.data.result as {
      url: string;
      amount: string | number;
      order_id?: string;
      uuid?: string;
    };

    await this.repository.create({
      telegramId: params.telegramId,
      language: params.language,
      paymentUuid: result.order_id ?? result.uuid ?? orderId,
      orderId,
      chatId: params.chatId,
      callback: params.callback
    });

    return {
      url: result.url,
      amount: typeof result.amount === 'string' ? Number(result.amount) : result.amount
    };
  }
}
