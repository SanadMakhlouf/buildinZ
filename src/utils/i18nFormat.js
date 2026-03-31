import i18n from '../i18n';

/**
 * Get the locale string for date/number formatting based on current i18n language.
 * Arabic: ar-SA, English: en-US
 */
export const getFormatLocale = () => (i18n.language === 'ar' ? 'ar-SA' : 'en-US');

/**
 * Format a date using the current locale.
 */
export const formatDate = (date, options = {}) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString(getFormatLocale(), options);
};

/**
 * Format a number. In Arabic UI we use English numerals (1,2,3) instead of Arabic-Indic (١٢٣).
 */
export const formatNumber = (num, options = {}) => {
  return Number(num).toLocaleString('en-US', options);
};
