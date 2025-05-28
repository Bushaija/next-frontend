/**
 * Formats a number as Rwandan Franc currency
 * @param value Number to format
 * @param options Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | undefined | null,
  options: {
    locale?: string;
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    compact?: boolean;
  } = {}
): string {
  if (value === undefined || value === null) return "";

  const {
    locale = "en-RW",
    currency = "RWF",
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    compact = false,
  } = options;

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    notation: compact ? "compact" : "standard",
  });

  return formatter.format(value);
}

/**
 * Formats a number as a percentage
 * @param value Number to format (0-1)
 * @param decimalPlaces Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number | undefined | null,
  decimalPlaces: number = 1
): string {
  if (value === undefined || value === null) return "";
  
  return new Intl.NumberFormat("en", {
    style: "percent",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
}

/**
 * Formats large numbers with thousand separators
 * @param value Number to format
 * @returns Formatted number string
 */
export function formatNumber(
  value: number | undefined | null,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  if (value === undefined || value === null) return "";
  
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options;

  return new Intl.NumberFormat("en", {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
} 