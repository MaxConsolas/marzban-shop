import Gettext from 'node-gettext';
import { po as poParser } from 'gettext-parser';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

import { formatTemplate, TemplateValues } from '../utils/template.js';
import { logger } from '../logger.js';

export type TranslateFn = (phrase: string, values?: TemplateValues) => string;

export class I18nService {
  private gt = new Gettext();
  private localesDir = resolve(process.cwd(), 'locales');
  private domain = 'bot';
  private fallback = 'en';
  private loadedLocales = new Set<string>();
  private cacheTimestamp: number | null = null;

  constructor() {
    this.reload();
  }

  private readLocaleDirectories(): string[] {
    if (!existsSync(this.localesDir)) {
      logger.warn({ localesDir: this.localesDir }, 'Locales directory is missing');
      return [];
    }
    return readdirSync(this.localesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  }

  private loadLocale(locale: string): void {
    const poPath = join(this.localesDir, locale, 'LC_MESSAGES', `${this.domain}.po`);
    if (!existsSync(poPath)) {
      logger.warn({ locale, poPath }, 'Translation file not found');
      return;
    }
    const raw = readFileSync(poPath);
    const parsed = poParser.parse(raw);
    this.gt.addTranslations(locale, this.domain, parsed);
    this.loadedLocales.add(locale);
  }

  private reload(): void {
    const directories = this.readLocaleDirectories();
    let newestTimestamp = 0;
    for (const locale of directories) {
      const poPath = join(this.localesDir, locale, 'LC_MESSAGES', `${this.domain}.po`);
      if (!existsSync(poPath)) {
        continue;
      }
      const stats = statSync(poPath);
      newestTimestamp = Math.max(newestTimestamp, stats.mtimeMs);
    }

    if (this.cacheTimestamp && newestTimestamp <= this.cacheTimestamp) {
      return;
    }

    this.gt = new Gettext();
    this.loadedLocales.clear();
    for (const locale of directories) {
      try {
        this.loadLocale(locale);
      } catch (error) {
        logger.error({ error, locale }, 'Failed to load locale');
      }
    }

    if (!this.loadedLocales.has(this.fallback)) {
      // Ensure fallback exists even if directory missing.
      this.gt.addTranslations(this.fallback, this.domain, { translations: { '': {} } });
      this.loadedLocales.add(this.fallback);
    }
    this.cacheTimestamp = newestTimestamp;
  }

  private resolveLocale(locale?: string): string {
    if (!locale) {
      return this.fallback;
    }
    const normalized = locale.toLowerCase().split('-')[0];
    if (this.loadedLocales.has(normalized)) {
      return normalized;
    }
    return this.fallback;
  }

  translate(phrase: string, locale?: string, values?: TemplateValues): string {
    this.reload();
    const resolved = this.resolveLocale(locale);
    this.gt.setLocale(resolved);
    this.gt.textdomain(this.domain);
    const translated = this.gt.gettext(phrase);
    return formatTemplate(translated, values);
  }

  getTranslator(locale?: string): TranslateFn {
    const resolved = this.resolveLocale(locale);
    return (phrase, values) => this.translate(phrase, resolved, values);
  }
}
