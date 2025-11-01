export type TemplateValues = Record<string, string | number | boolean | null | undefined>;

export const formatTemplate = (template: string, values?: TemplateValues): string => {
  if (!values) {
    return template;
  }
  return template.replace(/\{([^{}]+)\}/g, (match, key) => {
    const value = values[key.trim()];
    if (value === undefined || value === null) {
      return match;
    }
    return String(value);
  });
};
