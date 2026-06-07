import type { Locale } from './config';
import en from '@/locales/en.json';
import vi from '@/locales/vi.json';

const dictionaries = { en, vi } as const;
export type Dictionary = typeof en;
export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale] as Dictionary;
