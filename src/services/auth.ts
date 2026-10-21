import { User } from '../types';
import { getStoredCurrentUser, setStoredCurrentUser, getStoredCreators, saveStoredCreators } from './storage';

type AuthListener = (user: User | null) => void;
const listeners: Set<AuthListener> = new Set();

export function subscribeAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  listener(getStoredCurrentUser());
  return () => {
    listeners.delete(listener);
  };
}

function notify(user: User | null) {
  setStoredCurrentUser(user);
  listeners.forEach((fn) => fn(user));
}

export function getCurrentUser(): User | null {
  return getStoredCurrentUser();
}

export function signInWithEmail(email: string, password: string): { success: boolean; user?: User; error?: string } {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  // Check if matching creator profile exists for this email or demo
  const creators = getStoredCreators();
  const matchedCreator = creators.find(
    (c) => c.userId === email || c.username === email.split('@')[0] || email.includes(c.username)
  );

  const user: User = {
    id: matchedCreator ? matchedCreator.userId : `user-${Date.now()}`,
    email: email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
    profileId: matchedCreator ? matchedCreator.id : undefined,
    username: matchedCreator ? matchedCreator.username : undefined,
  };

  notify(user);
  return { success: true, user };
}

export function signUpWithEmail(email: string, password: string): { success: boolean; user?: User; error?: string } {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  const user: User = {
    id: `user-${Date.now()}`,
    email: email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
  };

  notify(user);
  return { success: true, user };
}

export function switchDemoAccount(creatorUsername: string): User | null {
  const creators = getStoredCreators();
  const creator = creators.find((c) => c.username === creatorUsername);
  if (!creator) return null;

  const user: User = {
    id: creator.userId,
    email: `${creator.username}@univaram.in`,
    createdAt: creator.createdAt,
    profileId: creator.id,
    username: creator.username,
  };

  notify(user);
  return user;
}

export function signOut(): void {
  notify(null);
}

export function updateUserProfileLink(userId: string, profileId: string, username: string): void {
  const currentUser = getStoredCurrentUser();
  if (currentUser && currentUser.id === userId) {
    const updated: User = {
      ...currentUser,
      profileId,
      username,
    };
    notify(updated);
  }
}
