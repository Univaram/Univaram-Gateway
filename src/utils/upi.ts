/**
 * Utility functions for UPI payment URI generation and validations for Univaram Gateway
 */

export interface UpiUriParams {
  upiId: string;
  payeeName: string;
  amount: number;
  note?: string;
  transactionRef?: string;
}

/**
 * Dedicated payee UPI ID for Univaram Gateway
 */
export const UNIVARAM_UPI_ID = 'univaram@centralbank';

/**
 * Official Univaram logo image URL
 */
export const UNIVARAM_LOGO_URL = 'https://univaram.in/Univaram-logo-128.webp';

/**
 * Single coffee base price in INR (Strictly multiple of 18: ₹18, ₹36, ₹54, ₹90, ₹180, etc.)
 */
export const COFFEE_PRICE_INR = 18;

/**
 * Calculates total support amount for a given number of coffees in multiples of ₹18
 */
export function getCoffeeAmount(cups: number): number {
  const count = Math.max(1, Math.round(cups || 1));
  return count * COFFEE_PRICE_INR;
}

/**
 * Returns total coffees for an amount, calculated as multiples of ₹18
 */
export function getCoffeesFromAmount(amount: number): number {
  if (isNaN(amount) || amount < COFFEE_PRICE_INR) return 1;
  return Math.max(1, Math.round(amount / COFFEE_PRICE_INR));
}



/**
 * Validates UPI VPA format (e.g. username@okhdfcbank, creator@upi)
 */
export function isValidUpiId(upiId: string): boolean {
  if (!upiId || typeof upiId !== 'string') return false;
  const trimmed = upiId.trim();
  // Standard UPI format: characters + @ + bank handle (min 3 chars before @, valid domain-like after)
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,50}@[a-zA-Z0-9.\-_]{2,30}$/;
  return upiRegex.test(trimmed);
}

/**
 * Validates custom support amount in INR (min ₹1, max ₹1,00,000)
 */
export function validateSupportAmount(amount: number): { valid: boolean; error?: string } {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return { valid: false, error: 'Please enter a valid contribution amount.' };
  }
  if (amount < 1) {
    return { valid: false, error: 'Minimum contribution amount is ₹1.' };
  }
  if (amount > 100000) {
    return { valid: false, error: 'Maximum contribution amount for single transfer is ₹1,00,000.' };
  }
  return { valid: true };
}

/**
 * Validates unique creator username (lowercase alphanumeric + hyphens, 3-30 chars)
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: 'Username is required.' };
  }
  const trimmed = username.trim();
  if (trimmed !== trimmed.toLowerCase()) {
    return { valid: false, error: 'Username must be in lowercase characters only.' };
  }
  if (trimmed.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters.' };
  }
  if (trimmed.length > 30) {
    return { valid: false, error: 'Username must not exceed 30 characters.' };
  }
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Username can only contain lowercase letters, numbers, and hyphens (cannot start or end with a hyphen).',
    };
  }
  return { valid: true };
}

/**
 * Generates standard UPI URI:
 * upi://pay?pa={upiId}&pn={payeeName}&am={amount}&cu=INR&tn={note}&tr={ref}
 */
export function generateUpiUri(params: UpiUriParams): string {
  const { upiId, payeeName, amount, note, transactionRef } = params;
  
  const searchParams = new URLSearchParams();
  searchParams.set('pa', upiId.trim());
  searchParams.set('pn', payeeName.trim());
  searchParams.set('am', Number(amount).toFixed(2));
  searchParams.set('cu', 'INR');
  
  if (note && note.trim()) {
    searchParams.set('tn', note.trim().slice(0, 50));
  } else {
    searchParams.set('tn', `Support on Univaram Gateway`);
  }

  if (transactionRef) {
    searchParams.set('tr', transactionRef);
  }

  return `upi://pay?${searchParams.toString()}`;
}

/**
 * Formats a number to Indian Rupee representation (e.g. ₹500, ₹1,200)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

/**
 * Formats UPI app specific deep link intent URLs
 */
export function getUpiAppIntent(app: 'generic' | 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'cred', baseUri: string): string {
  const query = baseUri.replace('upi://pay?', '');
  switch (app) {
    case 'gpay':
      return `gpay://upi/pay?${query}`;
    case 'phonepe':
      return `phonepe://pay?${query}`;
    case 'paytm':
      return `paytmmp://pay?${query}`;
    case 'bhim':
      return `bhim://pay?${query}`;
    case 'cred':
      return `cred://pay?${query}`;
    case 'generic':
    default:
      return baseUri;
  }
}
