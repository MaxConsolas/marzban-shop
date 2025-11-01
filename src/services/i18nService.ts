import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

import { formatTemplate, TemplateValues } from '../utils/template.js';
import { logger } from '../logger.js';

export type TranslateFn = (phrase: string, values?: TemplateValues) => string;

type LocaleData = Record<string, string>;

export class I18nService {
  private readonly localesDir = resolve(process.cwd(), 'locales');
  private readonly fallback = 'en';
  private readonly translations = new Map<string, LocaleData>();
  private readonly timestamps = new Map<string, number>();

  constructor() {
    this.loadLocales();
    if (!this.translations.has(this.fallback)) {
      this.translations.set(this.fallback, {});
    }
  }

  private loadLocales(): void {
    if (!existsSync(this.localesDir)) {
      logger.warn({ localesDir: this.localesDir }, 'Locales directory is missing');
      return;
    }

    const entries = readdirSync(this.localesDir, { withFileTypes: true });
    const jsonFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json'));
    const seenLocales = new Set<string>();

    for (const file of jsonFiles) {
      const locale = file.name.replace(/\.json$/i, '').toLowerCase();
      const filePath = join(this.localesDir, file.name);

      try {
        const stats = statSync(filePath);
        if (this.timestamps.get(locale) === stats.mtimeMs) {
          seenLocales.add(locale);
          continue;
        }

        const raw = readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw) as LocaleData;
        this.translations.set(locale, parsed);
        this.timestamps.set(locale, stats.mtimeMs);
        seenLocales.add(locale);
      } catch (error) {
        this.translations.delete(locale);
        this.timestamps.delete(locale);
        logger.error({ error, locale }, 'Failed to load locale');
      }
    }

    for (const locale of [...this.translations.keys()]) {
      if (locale === this.fallback) {
        continue;
      }
      if (!seenLocales.has(locale)) {
        this.translations.delete(locale);
        this.timestamps.delete(locale);
      }
    }

    if (!this.translations.has(this.fallback)) {
      this.translations.set(this.fallback, {});
    }
  }

  private normalizeLocale(locale?: string): string {
    if (!locale) {
      return this.fallback;
    }
    const normalized = locale.toLowerCase().split(/[-_]/)[0];
    return this.translations.has(normalized) ? normalized : this.fallback;
  }

  translate(phrase: string, locale?: string, values?: TemplateValues): string {
    this.loadLocales();
    const normalized = this.normalizeLocale(locale);
    const translation =
      this.translations.get(normalized)?.[phrase] ??
      this.translations.get(this.fallback)?.[phrase] ??
      phrase;

    return formatTemplate(translation, values);
  }

  getTranslator(locale?: string): TranslateFn {
    return (phrase, values) => this.translate(phrase, locale, values);
  }
}
