import { createHash } from 'crypto';

export const md5 = (value: string): string => createHash('md5').update(value).digest('hex');
