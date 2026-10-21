import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { CreatorProfile } from '../types';
import { generateUpiUri, formatINR, getUpiAppIntent, UNIVARAM_LOGO_URL } from '../utils/upi';
import { recordSupportCheer } from '../services/payments';
import { useToast } from './Toast';
import { UpiQrCode } from './UpiQrCode';
import {
  X,
  QrCode,
  Smartphone,
  Check,
  Heart,
  ExternalLink,
  Info,
} from 'lucide-react';

interface UpiPaymentModalProps {
  creator: CreatorProfile;
  amount: number;
  coffeesCount?: number;
  initialMessage?: string;
  initialName?: string;
  isOpen: boolean;
  onClose: () => void;
  onCheerRecorded?: () => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  creator,
  amount,
  coffeesCount,
  initialMessage = '',
  initialName = '',
  isOpen,
  onClose,
  onCheerRecorded,
}) => {
  const { success, error, info } = useToast();
  const [activeTab, setActiveTab] = useState<'qr' | 'apps'>('qr');
  const [supporterName, setSupporterName] = useState(initialName || '');
  const [message, setMessage] = useState(initialMessage || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompletedState, setIsCompletedState] = useState(false);

  const computedCoffees = coffeesCount || Math.max(1, Math.round(amount / 18));

  // Generate stable UPI URI using useMemo
  const upiUri = useMemo(() => {
    return generateUpiUri({
      upiId: creator.upiId,
      payeeName: creator.displayName || 'Univaram',
      amount,
      note: message.trim()
        ? `Cheer: ${message.trim().slice(0, 30)}`
        : `Buy ${computedCoffees} Coffees - Univaram`,
    });
  }, [creator.upiId, creator.displayName, amount, message, computedCoffees]);

  // Reset states when opening
  useEffect(() => {
    if (isOpen) {
      setIsCompletedState(false);
      setSupporterName(initialName);
      setMessage(initialMessage);
      setActiveTab('qr');
    }
  }, [isOpen, initialName, initialMessage]);

  if (!isOpen) return null;

  const handleLaunchApp = (app: 'generic' | 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'cred') => {
    const deepLink = getUpiAppIntent(app, upiUri);
    info(`Opening payment link for ${app.toUpperCase()}...`);
    window.location.href = deepLink;
  };

  const handleRecordCheer = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = recordSupportCheer({
      creatorId: creator.id,
      creatorUpiId: creator.upiId,
      amount,
      coffeesCount: computedCoffees,
      supporterName: supporterName.trim() || 'Generous Supporter',
      message: message.trim(),
      verificationMethod: activeTab === 'qr' ? 'qr_code_scan' : 'direct_upi_intent',
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsCompletedState(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      success('Thank you! Your coffee support and cheer note have been published!');
      if (onCheerRecorded) {
        onCheerRecorded();
      }
    } else {
      error(result.error || 'Failed to submit support record.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs transition-all"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upi-modal-title"
    >
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 my-0 sm:my-auto">
        {/* Mobile Pull Indicator */}
        <div className="sm:hidden w-full flex justify-center pt-2.5 pb-1 bg-slate-900">
          <div className="w-12 h-1 bg-slate-700 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="shrink-0 p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 z-10">
            <img
              src={UNIVARAM_LOGO_URL}
              alt="Univaram Logo"
              className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-slate-700 shadow-sm shrink-0"
            />
            <div>
              <h2 id="upi-modal-title" className="font-heading font-bold text-base sm:text-lg text-white leading-tight">
                Buy {computedCoffees} {computedCoffees === 1 ? 'Coffee' : 'Coffees'}
              </h2>
              <p className="text-[11px] sm:text-xs text-amber-200 mt-0.5">
                Amount: <strong className="text-white font-extrabold">{formatINR(amount)}</strong> • <span className="font-mono text-slate-300">{creator.upiId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors z-10 min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Close payment modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content Body */}
        <div className="flex-1 overflow-y-auto modal-scrollbar p-4 sm:p-6 space-y-4 sm:space-y-5">
          {!isCompletedState ? (
            <>
              {/* Payment Method Switcher */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('qr')}
                  className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs ${
                    activeTab === 'qr'
                      ? 'bg-white text-amber-900 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-amber-600" />
                  <span>Scan Custom UPI QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('apps')}
                  className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs ${
                    activeTab === 'apps'
                      ? 'bg-white text-amber-900 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  <span>Pay via UPI App</span>
                </button>
              </div>

              {/* Custom QR Code Tab */}
              {activeTab === 'qr' && (
                <div className="py-1 flex flex-col items-center">
                  <UpiQrCode
                    upiUri={upiUri}
                    amount={amount}
                    coffeesCount={computedCoffees}
                    payeeVpa={creator.upiId}
                    payeeName={creator.displayName}
                    size={210}
                    showActions={true}
                  />
                </div>
              )}

              {/* UPI Apps Tab */}
              {activeTab === 'apps' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 text-center">
                    Tap to launch your preferred UPI application directly on mobile:
                  </p>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleLaunchApp('gpay')}
                      className="p-3 border border-slate-200 hover:border-amber-400 rounded-xl hover:bg-amber-50/50 flex items-center justify-between text-left text-xs font-semibold text-slate-800 transition-colors min-h-[44px]"
                    >
                      <span>Google Pay</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLaunchApp('phonepe')}
                      className="p-3 border border-slate-200 hover:border-amber-400 rounded-xl hover:bg-amber-50/50 flex items-center justify-between text-left text-xs font-semibold text-slate-800 transition-colors min-h-[44px]"
                    >
                      <span>PhonePe</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLaunchApp('paytm')}
                      className="p-3 border border-slate-200 hover:border-amber-400 rounded-xl hover:bg-amber-50/50 flex items-center justify-between text-left text-xs font-semibold text-slate-800 transition-colors min-h-[44px]"
                    >
                      <span>Paytm</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLaunchApp('bhim')}
                      className="p-3 border border-slate-200 hover:border-amber-400 rounded-xl hover:bg-amber-50/50 flex items-center justify-between text-left text-xs font-semibold text-slate-800 transition-colors min-h-[44px]"
                    >
                      <span>BHIM UPI</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLaunchApp('generic')}
                    className="w-full py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
                  >
                    <span>Open Any Supported UPI App</span>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                  </button>
                </div>
              )}

              {/* Supporter cheer form */}
              <form onSubmit={handleRecordCheer} className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>Leave a Cheer for {creator.displayName}</span>
                </div>

                <div>
                  <label htmlFor="supporter-name-input" className="block text-xs font-medium text-slate-700 mb-1">
                    Your Name (optional):
                  </label>
                  <input
                    id="supporter-name-input"
                    type="text"
                    value={supporterName}
                    onChange={(e) => setSupporterName(e.target.value)}
                    placeholder="e.g. Rahul, Sneha, or Anonymous"
                    className="w-full px-3.5 py-2.5 text-base sm:text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="supporter-msg-input" className="block text-xs font-medium text-slate-700 mb-1">
                    Cheer Message (optional):
                  </label>
                  <textarea
                    id="supporter-msg-input"
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Thank you for your inspiring work!"
                    className="w-full px-3.5 py-2.5 text-base sm:text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-medium"
                  />
                </div>

                {/* Direct P2P Info */}
                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Direct Peer-to-Peer Transfer:</strong> Your transfer is routed straight to{' '}
                    <strong>{creator.displayName}</strong> ({creator.upiId}). Univaram Gateway never asks for or stores
                    your UPI PIN or banking passwords. Submitting this record acknowledges your voluntary support.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl font-bold text-xs sm:text-xs transition-colors shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer min-h-[44px]"
                >
                  <Heart className="w-4 h-4" />
                  <span>I Have Completed My Contribution</span>
                </button>
              </form>
            </>
          ) : (
            /* Completed Thank You State */
            <div className="py-4 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl text-slate-900">Thank You for Supporting!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Your voluntary contribution of <strong>{formatINR(amount)}</strong> for{' '}
                  <strong>{creator.displayName}</strong> has been recorded. Your cheer message is now live on the public Supporter Wall of Love.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Payee:</span>
                  <span className="font-medium text-slate-900">{creator.displayName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>UPI VPA:</span>
                  <span className="font-mono text-slate-900">{creator.upiId}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Settlement:</span>
                  <span className="text-emerald-700 font-medium">Direct Bank Settlement via UPI</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Fee:</span>
                  <span className="text-slate-900 font-semibold">₹0 (0% Commission)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors min-h-[44px]"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
