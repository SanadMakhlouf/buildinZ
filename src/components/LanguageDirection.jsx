import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Sets document lang and dir based on current i18n language.
 * Arabic: lang="ar", dir="rtl"
 * English: lang="en", dir="ltr"
 */
const LanguageDirection = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language || 'ar';
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [i18n.language]);

  return null;
};

export default LanguageDirection;
