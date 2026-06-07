export const locales = ['en', 'vi'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);
