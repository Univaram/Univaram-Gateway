export type CreatorCategory =
  | 'Developers'
  | 'Writers'
  | 'Designers'
  | 'Artists'
  | 'Educators'
  | 'Musicians'
  | 'Content Creators'
  | 'Open Source'
  | 'Independent Creators';

export interface CreatorProject {
  id: string;
  title: string;
  description: string;
  url?: string;
  tag?: string;
}

export interface CreatorSocialLinks {
  twitter?: string;
  github?: string;
  youtube?: string;
  linkedin?: string;
  website?: string;
  instagram?: string;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  username: string; // e.g. "univaram"
  displayName: string;
  tagline: string;
  bio: string;
  category: CreatorCategory;
  avatarUrl: string;
  bannerColor: string; // Hex color for header accent
  upiId: string; // e.g. "univaram@centralbank"
  suggestedAmounts: number[]; // e.g. [18, 36, 54, 90, 180]
  customAmountEnabled: boolean;
  welcomeMessage: string;
  socialLinks: CreatorSocialLinks;
  projects: CreatorProject[];
  isPublished: boolean;
  isVerifiedBadge?: boolean;
  isDemoProfile?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
  profileId?: string;
  username?: string;
}

export type ContributionStatus = 'pending_verification' | 'verified' | 'rejected' | 'recorded_p2p';

export interface SupportCheer {
  id: string;
  creatorId: string;
  supporterName: string;
  supporterEmail?: string;
  amount: number;
  coffeesCount?: number;
  message?: string;
  utrNumber?: string; // 12-digit UPI UTR / Transaction ID
  createdAt: string;
  verifiedAt?: string;
  status: ContributionStatus;
  certificateId?: string;
  transactionRef?: string;
  isPublic: boolean;
}

export interface DonationGoal {
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
}

export interface PaymentRecord {
  id: string;
  creatorId: string;
  amount: number;
  currency: 'INR';
  supporterName: string;
  supporterEmail?: string;
  note?: string;
  upiId: string;
  utrNumber?: string;
  status: ContributionStatus;
  certificateId?: string;
  createdAt: string;
  verifiedAt?: string;
  verificationMethod: 'direct_upi_intent' | 'qr_code_scan' | 'manual_acknowledgment' | 'utr_submission';
}

export type PageRoute =
  | 'home'
  | 'explore'
  | 'creator'
  | 'how-it-works'
  | 'signin'
  | 'signup'
  | 'onboarding'
  | 'dashboard'
  | 'about'
  | 'faq'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'payment-policy';
