import { PaymentRecord, SupportCheer } from '../types';
import {
  getStoredCheers,
  saveStoredCheers,
  getStoredPayments,
  saveStoredPayments,
  getStoredGoal,
  saveStoredGoal,
} from './storage';
import { validateSupportAmount } from '../utils/upi';

/**
 * Returns public cheers for display on the Wall of Love
 */
export function getCreatorCheers(creatorId: string): SupportCheer[] {
  const cheers = getStoredCheers();
  return cheers
    .filter((c) => c.creatorId === creatorId && c.isPublic)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Record new supporter contribution directly
 */
export function recordSupportCheer(params: {
  creatorId: string;
  creatorUpiId: string;
  amount: number;
  coffeesCount?: number;
  supporterName: string;
  supporterEmail?: string;
  message?: string;
  verificationMethod: 'direct_upi_intent' | 'qr_code_scan' | 'manual_acknowledgment';
}): { success: boolean; cheer?: SupportCheer; record?: PaymentRecord; error?: string } {
  const amountCheck = validateSupportAmount(params.amount);
  if (!amountCheck.valid) {
    return { success: false, error: amountCheck.error };
  }

  const supporterName = params.supporterName?.trim() || 'Generous Supporter';
  const now = new Date().toISOString();
  const coffeesCount =
    params.coffeesCount || Math.max(1, Math.round(params.amount / 18));

  const newCheer: SupportCheer = {
    id: `cheer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    creatorId: params.creatorId,
    supporterName,
    supporterEmail: params.supporterEmail?.trim(),
    amount: params.amount,
    coffeesCount,
    message: params.message?.trim(),
    createdAt: now,
    status: 'recorded_p2p',
    transactionRef: `UV-${Date.now().toString().slice(-6)}`,
    isPublic: true,
  };

  const newPayment: PaymentRecord = {
    id: `pay-${Date.now()}`,
    creatorId: params.creatorId,
    amount: params.amount,
    currency: 'INR',
    supporterName,
    supporterEmail: params.supporterEmail?.trim(),
    note: params.message?.trim() || 'Voluntary Coffee Support',
    upiId: params.creatorUpiId,
    status: 'recorded_p2p',
    createdAt: now,
    verificationMethod: params.verificationMethod,
  };

  const allCheers = getStoredCheers();
  allCheers.unshift(newCheer);
  saveStoredCheers(allCheers);

  const allPayments = getStoredPayments();
  allPayments.unshift(newPayment);
  saveStoredPayments(allPayments);

  // Update community goal progress
  try {
    const goal = getStoredGoal();
    goal.currentAmount += params.amount;
    saveStoredGoal(goal);
  } catch (err) {
    console.error('Failed to advance goal progress', err);
  }

  return {
    success: true,
    cheer: newCheer,
    record: newPayment,
  };
}
