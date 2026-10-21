import { CreatorProfile, CreatorCategory } from '../types';
import { getStoredCreators, saveStoredCreators } from './storage';
import { validateUsername, isValidUpiId } from '../utils/upi';
import { updateUserProfileLink } from './auth';

export function getAllPublishedCreators(options?: {
  category?: string;
  query?: string;
}): CreatorProfile[] {
  let list = getStoredCreators().filter((c) => c.isPublished);

  if (options?.category && options.category !== 'All') {
    list = list.filter((c) => c.category === options.category);
  }

  if (options?.query && options.query.trim()) {
    const q = options.query.trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }

  return list;
}

export function getCreatorByUsername(username: string): CreatorProfile | undefined {
  if (!username) return undefined;
  const clean = username.trim().toLowerCase();
  const list = getStoredCreators();
  return list.find((c) => c.username.toLowerCase() === clean);
}

export function getCreatorById(id: string): CreatorProfile | undefined {
  if (!id) return undefined;
  const list = getStoredCreators();
  return list.find((c) => c.id === id);
}

export function getCreatorByUserId(userId: string): CreatorProfile | undefined {
  if (!userId) return undefined;
  const list = getStoredCreators();
  return list.find((c) => c.userId === userId);
}

export function isUsernameAvailable(username: string, currentProfileId?: string): boolean {
  const clean = username.trim().toLowerCase();
  const list = getStoredCreators();
  return !list.some((c) => c.username.toLowerCase() === clean && c.id !== currentProfileId);
}

export function createCreatorProfile(
  userId: string,
  data: {
    username: string;
    displayName: string;
    tagline: string;
    bio: string;
    category: CreatorCategory;
    avatarUrl?: string;
    bannerColor?: string;
    upiId: string;
    suggestedAmounts?: number[];
    welcomeMessage?: string;
    socialLinks?: {
      github?: string;
      twitter?: string;
      youtube?: string;
      website?: string;
    };
  }
): { success: boolean; profile?: CreatorProfile; error?: string } {
  // 1. Validate username
  const usernameCheck = validateUsername(data.username);
  if (!usernameCheck.valid) {
    return { success: false, error: usernameCheck.error };
  }

  if (!isUsernameAvailable(data.username)) {
    return { success: false, error: `The username @${data.username} is already claimed. Please pick another one.` };
  }

  // 2. Validate UPI ID
  if (!isValidUpiId(data.upiId)) {
    return { success: false, error: 'Please provide a valid UPI Virtual Payment Address (e.g. name@bank).' };
  }

  if (!data.displayName || data.displayName.trim().length < 2) {
    return { success: false, error: 'Display name must be at least 2 characters.' };
  }

  const newProfile: CreatorProfile = {
    id: `creator-${Date.now()}`,
    userId,
    username: data.username.trim().toLowerCase(),
    displayName: data.displayName.trim(),
    tagline: data.tagline?.trim() || 'Independent Creator on Univaram Gateway',
    bio: data.bio?.trim() || 'Welcome to my creator support page!',
    category: data.category,
    avatarUrl:
      data.avatarUrl?.trim() ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(data.username)}`,
    bannerColor: data.bannerColor || '#4f46e5',
    upiId: data.upiId.trim(),
    suggestedAmounts: data.suggestedAmounts?.length ? data.suggestedAmounts : [50, 100, 250, 500],
    customAmountEnabled: true,
    welcomeMessage: data.welcomeMessage?.trim() || 'Thank you for your generous support!',
    socialLinks: data.socialLinks || {},
    projects: [],
    isPublished: true,
    isVerifiedBadge: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const list = getStoredCreators();
  list.unshift(newProfile);
  saveStoredCreators(list);
  updateUserProfileLink(userId, newProfile.id, newProfile.username);

  return { success: true, profile: newProfile };
}

export function updateCreatorProfile(
  profileId: string,
  userId: string,
  updates: Partial<CreatorProfile>
): { success: boolean; profile?: CreatorProfile; error?: string } {
  const list = getStoredCreators();
  const index = list.findIndex((c) => c.id === profileId);

  if (index === -1) {
    return { success: false, error: 'Creator profile not found.' };
  }

  const existing = list[index];

  // Authorization check
  if (existing.userId !== userId && !existing.isDemoProfile) {
    return { success: false, error: 'Unauthorized: You do not have permission to edit this profile.' };
  }

  // If username is being changed, validate and check availability
  if (updates.username && updates.username.toLowerCase() !== existing.username.toLowerCase()) {
    const usernameCheck = validateUsername(updates.username);
    if (!usernameCheck.valid) {
      return { success: false, error: usernameCheck.error };
    }
    if (!isUsernameAvailable(updates.username, profileId)) {
      return { success: false, error: `The username @${updates.username} is already taken.` };
    }
  }

  // If upiId is being updated
  if (updates.upiId && !isValidUpiId(updates.upiId)) {
    return { success: false, error: 'Please provide a valid UPI Virtual Payment Address (e.g. name@bank).' };
  }

  const updated: CreatorProfile = {
    ...existing,
    ...updates,
    username: updates.username ? updates.username.trim().toLowerCase() : existing.username,
    updatedAt: new Date().toISOString(),
  };

  list[index] = updated;
  saveStoredCreators(list);
  updateUserProfileLink(userId, updated.id, updated.username);

  return { success: true, profile: updated };
}
