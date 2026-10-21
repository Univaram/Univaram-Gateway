import { CreatorProfile, SupportCheer, PaymentRecord, DonationGoal } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'univaram_gateway_user',
  CREATORS: 'univaram_gateway_creators',
  CHEERS: 'univaram_gateway_cheers',
  PAYMENTS: 'univaram_gateway_payments',
  GOAL: 'univaram_gateway_donation_goal',
};

export function getStoredCurrentUser(): any {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredCurrentUser(user: any): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (err) {
    console.error('Failed to save user to storage', err);
  }
}

// Dedicated profile for Univaram (built by univaram.in)
export const UNIVARAM_PROFILE: CreatorProfile = {
  id: 'creator-univaram',
  userId: 'user-univaram',
  username: 'univaram',
  displayName: 'Univaram',
  tagline: 'Independent Developer Tools, Open Web & Infrastructure',
  bio: 'Crafting open-source software, developer utilities, and high-performance web systems. Built by univaram.in, created by Divyanshu Verma. Buy us a coffee in multiples of ₹18 to power our independent infrastructure!',
  category: 'Developers',
  avatarUrl: 'https://univaram.in/Univaram-logo-128.webp',
  bannerColor: '#f59e0b', // Amber / Coffee
  upiId: 'univaram@centralbank',
  suggestedAmounts: [18, 36, 54, 90, 180],
  customAmountEnabled: true,
  welcomeMessage: 'Thank you for buying us a coffee! Every cup directly supports our servers, open-source tools, and keeps univaram.in independent.',
  socialLinks: {
    website: 'https://univaram.in',
    github: 'https://github.com',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
  },
  projects: [
    {
      id: 'proj-1',
      title: 'univaram.in',
      description: 'Independent software development and open-source tools portal.',
      tag: 'Developer Tools',
      url: 'https://univaram.in',
    },
    {
      id: 'proj-2',
      title: 'Open Source Web Utilities',
      description: 'Free developer scripts, API endpoints, and lightweight utilities.',
      tag: 'Open Source',
      url: 'https://univaram.in',
    },
  ],
  isPublished: true,
  isVerifiedBadge: true,
  isDemoProfile: false,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-10-21T07:30:00Z',
};

export const SEED_CREATORS: CreatorProfile[] = [UNIVARAM_PROFILE];

// REMOVED ALL MOCK DATA - Clean empty cheers array
export const SEED_CHEERS: SupportCheer[] = [];

export function getStoredCreators(): CreatorProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CREATORS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CREATORS, JSON.stringify(SEED_CREATORS));
      return SEED_CREATORS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.CREATORS, JSON.stringify(SEED_CREATORS));
      return SEED_CREATORS;
    }
    return parsed;
  } catch {
    return SEED_CREATORS;
  }
}

export function saveStoredCreators(creators: CreatorProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CREATORS, JSON.stringify(creators));
  } catch (err) {
    console.error('Failed to save creators to storage', err);
  }
}

export function getStoredCheers(): SupportCheer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHEERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CHEERS, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredCheers(cheers: SupportCheer[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHEERS, JSON.stringify(cheers));
  } catch (err) {
    console.error('Failed to save cheers to storage', err);
  }
}

export function getStoredPayments(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredPayments(payments: PaymentRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  } catch (err) {
    console.error('Failed to save payments', err);
  }
}

export const DEFAULT_GOAL: DonationGoal = {
  title: 'Monthly Server & Open-Source Maintenance',
  description: 'Covers fast cloud hosting, domain infrastructure, SSL, and keeping all Univaram tools 100% free with no paywalls or ads. Built by univaram.in.',
  targetAmount: 18000, // 1000 coffees × ₹18
  currentAmount: 0,    // Starts at 0 - NO mock amounts! Updates automatically when admin verifies UTR
};

export function getStoredGoal(): DonationGoal {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOAL);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GOAL, JSON.stringify(DEFAULT_GOAL));
      return DEFAULT_GOAL;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.targetAmount === 'number' ? parsed : DEFAULT_GOAL;
  } catch {
    return DEFAULT_GOAL;
  }
}

export function saveStoredGoal(goal: DonationGoal): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GOAL, JSON.stringify(goal));
  } catch (err) {
    console.error('Failed to save goal to storage', err);
  }
}

/**
 * Recalculate goal raised total based on sum of VERIFIED cheers
 */
export function syncGoalFromVerifiedCheers(): number {
  const cheers = getStoredCheers();
  const verifiedTotal = cheers
    .filter((c) => c.status === 'verified')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const currentGoal = getStoredGoal();
  currentGoal.currentAmount = verifiedTotal;
  saveStoredGoal(currentGoal);
  return verifiedTotal;
}
