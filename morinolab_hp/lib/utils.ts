import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * オブジェクトに `xxxJa` / `xxxEn` のような多言語フィールドがある場合に
 * `locale` に応じた値を安全に取得するヘルパー。
 *
 * @example
 * getLocalized(theme, 'name', 'ja') // => theme.nameJa
 * getLocalized(theme, 'desc', 'en') // => theme.descEn
 */
export function getLocalized<T extends Record<string, any>>(
  item: T,
  baseKey: string,
  locale: 'ja' | 'en'
): string {
  const key = `${baseKey}${locale === 'ja' ? 'Ja' : 'En'}` as keyof T;
  const fallbackKey = `${baseKey}${locale === 'ja' ? 'En' : 'Ja'}` as keyof T;

  if (typeof item[key] === 'string' && item[key]) {
    return item[key] as string;
  }
  if (typeof item[fallbackKey] === 'string' && item[fallbackKey]) {
    return item[fallbackKey] as string;
  }

  // 最後の手段として空文字列を返す
  return '';
}
