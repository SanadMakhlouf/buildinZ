import i18n from '../i18n';

/**
 * Get delivery date for "Get it by X" display.
 * Uses estimated_delivery_date if available, else computes from lead days.
 * @param {Object} product - Product with delivery_lead_days, delivery_lead_days_max, estimated_delivery_date
 * @returns {Date|null} Delivery date or null if no delivery info
 */
export function getDeliveryDate(product) {
  const dateStr = product?.estimated_delivery_date || product?.estimatedDeliveryDate;
  if (dateStr) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  const min = product?.delivery_lead_days != null ? parseInt(product.delivery_lead_days, 10) : 3;
  if (min == null || isNaN(min) || min < 0) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 4);
    return fallback;
  }
  const max = product?.delivery_lead_days_max != null ? parseInt(product.delivery_lead_days_max, 10) : null;
  const daysToAdd = Math.max(1, max != null && !isNaN(max) && max > min ? max : (min || 4));
  const d = new Date();
  d.setDate(d.getDate() + daysToAdd);
  return d;
}

/**
 * Format delivery date for display. Uses current language (Arabic or English).
 * Arabic: ar-SA with Latin numerals (per user preference for English numbers).
 */
export function formatDeliveryDate(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return null;
  const locale = i18n.language === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US';
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
