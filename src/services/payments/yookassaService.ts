import axios from 'axios';
import { randomUUID } from 'crypto';

import { AppConfig } from '../../config/env.js';
import { Good } from '../goodsService.js';
import { YookassaPaymentsRepository } from '../../db/repositories/yookassaPaymentsRepository.js';
import { PaymentLink } from './types.js';

interface CreateYookassaPaymentParams {
  telegramId: number;
  callback: string;
  chatId: number;
  language: string;
  good: Good;
  botUsername: string;
}

export class YookassaService {
  constructor(private readonly config: AppConfig, private readonly repository: YookassaPaymentsRepository) {}

  get isEnabled(): boolean {
    return Boolean(this.config.yookassa);
  }

  async createPayment(params: CreateYookassaPaymentParams): Promise<PaymentLink> {
    if (!this.isEnabled || !this.config.yookassa) {
      throw new Error('YooKassa integration is not configured');
    }

    const { shopId, secretKey, email } = this.config.yookassa;
    const idempotenceKey = randomUUID();
    const payload = {
      amount: {
        value: params.good.price.ru.toFixed(2),
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect',
        return_url: `https://t.me/${params.botUsername}`
      },
      capture: true,
      description: `???????? ?? VPN ${this.config.shopName}`,
      save_payment_method: false,
      receipt: {
        customer: {
          email: email ?? undefined
        },
        items: [
          {
            description: `???????? ?? VPN ??????: ???-?? ??????? - ${params.good.months}`,
            quantity: '1',
            amount: {
              value: params.good.price.ru.toFixed(2),
              currency: 'RUB'
            },
            vat_code: '1'
          }
        ]
      }
    };

    const response = await axios.post(
      'https://api.yookassa.ru/v3/payments',
      payload,
      {
        auth: {
          username: shopId,
          password: secretKey
        },
        headers: {
          'Idempotence-Key': idempotenceKey
        }
      }
    );

    const payment = response.data as {
      id: string;
      confirmation: { confirmation_url: string };
      amount: { value: string };
    };

    await this.repository.create({
      telegramId: params.telegramId,
      language: params.language,
      paymentId: payment.id,
      chatId: params.chatId,
      callback: params.callback
    });

    return {
      url: payment.confirmation.confirmation_url,
      amount: Number(payment.amount.value)
    };
  }
}
