import { createHash } from 'crypto';

const escapeSlashes = (value: string): string => value.replace(/\//g, '\\/');

export const computeCryptomusSignature = (payload: Record<string, unknown>, key: string): string => {
  const json = JSON.stringify(payload);
  const encoded = Buffer.from(json).toString('base64');
  return createHash('md5').update(`${encoded}${key}`).digest('hex');
};

export const verifyCryptomusWebhook = (rawPayload: Record<string, unknown>, key: string): boolean => {
  if (!rawPayload || typeof rawPayload !== 'object') {
    return false;
  }

  const { sign } = rawPayload as { sign?: string };
  if (!sign) {
    return false;
  }

  const payload: Record<string, unknown> = {};
  for (const [payloadKey, value] of Object.entries(rawPayload)) {
    if (payloadKey === 'sign') {
      continue;
    }
    payload[payloadKey] = value;
  }

  const json = JSON.stringify(payload);
  const normalized = escapeSlashes(json);
  const encoded = Buffer.from(normalized, 'utf-8').toString('base64');
  const calculated = createHash('md5').update(`${encoded}${key}`).digest('hex');
  return calculated === sign;
};
