import React, { useState, useMemo } from 'react';
import { UNIVARAM_PROFILE } from '../services/storage';
import {
  formatINR,
  getCoffeeAmount,
  UNIVARAM_UPI_ID,
  validateSupportAmount,
  generateUpiUri,
  getUpiAppIntent,
  UNIVARAM_LOGO_URL,
} from '../utils/upi';
import { UpiPaymentModal } from '../components/UpiPaymentModal';
import { UpiQrCode } from '../components/UpiQrCode';
import { useToast } from '../components/Toast';
import {
  Coffee,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Server,
  Code,
  QrCode,
  Plus,
  Minus,
  ExternalLink,
  Sparkles,
  ChevronDown,
  Lock,
} from 'lucide-react';

const COFFEE_PRESETS = [
  { cups: 1, label: '1 Coffee' },
  { cups: 2, label: '2 Coffees' },
  { cups: 3, label: '3 Coffees' },
  { cups: 5, label: '5 Coffees' },
  { cups: 10, label: '10 Coffees' },
];

const FAQ_ITEMS = [
  {
    question: 'Why is the price of coffee in multiples of ₹18?',
    answer:
      'At univaram.in, coffee is priced at an accessible base of ₹18 per cup. Supporters can choose 1 cup (₹18), 2 cups (₹36), 3 cups (₹54), 5 cups (₹90), 10 cups (₹180), or any custom multiple of ₹18 you wish to contribute!',
  },
  {
    question: 'How does the custom UPI QR payment work?',
    answer:
      'When you select your coffee count, an authentic NPCI-compliant custom UPI link and vector QR code are generated for univaram@centralbank. You can scan the QR code directly on screen with any camera/UPI app (Google Pay, PhonePe, Paytm, BHIM, Cred) or tap to open directly on your mobile device.',
  },
  {
    question: 'Does univaram.in take any commission or platform fee?',
    answer:
      'No. There is 0% platform commission. UPI transfers are direct peer-to-peer bank transactions governed by NPCI. 100% of your voluntary contribution reaches Univaram directly.',
  },
  {
    question: 'Is my banking information safe?',
    answer:
      'Completely safe. Univaram Gateway never asks for, sees, or stores your UPI PIN, OTPs, or debit/credit card numbers. Payment authorization happens exclusively inside your official UPI banking app.',
  },
];

export const BuyCoffeePage: React.FC = () => {
  const { success, error, info } = useToast();

  const [coffeesCount, setCoffeesCount] = useState<number>(3); // Default 3 cups = ₹54
  const [supporterName, setSupporterName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0); // First item open by default

  const totalAmount = getCoffeeAmount(coffeesCount);

  // Live UPI URI for custom QR code (derived via useMemo to prevent infinite loops)
  const liveUpiUri = useMemo(() => {
    return generateUpiUri({
      upiId: UNIVARAM_UPI_ID,
      payeeName: 'Univaram',
      amount: totalAmount,
      note: message.trim()
        ? `Cheer: ${message.trim().slice(0, 30)}`
        : `Buy ${coffeesCount} Coffees - Univaram`,
    });
  }, [totalAmount, coffeesCount, message]);

  const handleIncrement = () => {
    setCoffeesCount((prev) => Math.min(100, prev + 1));
  };

  const handleDecrement = () => {
    setCoffeesCount((prev) => Math.max(1, prev - 1));
  };

  const handleCupsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(val)) {
      setCoffeesCount(Math.min(500, Math.max(1, val)));
    }
  };

  const handleInitiateDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const valCheck = validateSupportAmount(totalAmount);
    if (!valCheck.valid) {
      error(valCheck.error || 'Please enter a valid donation amount.');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleCopyUpiId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(UNIVARAM_UPI_ID);
      setCopiedUpi(true);
      success(`UPI ID copied: ${UNIVARAM_UPI_ID}`);
      setTimeout(() => setCopiedUpi(false), 2500);
    } else {
      info(`UPI ID: ${UNIVARAM_UPI_ID}`);
    }
  };

  const handleOpenUpiApp = (app: 'generic' | 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'cred') => {
    const intentUrl = getUpiAppIntent(app, liveUpiUri);
    window.location.href = intentUrl;
    success(`Opening UPI payment app for ${formatINR(totalAmount)}...`);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 overflow-x-hidden">
      {/* Precision Desktop Viewport Hero Section */}
      <section className="relative pt-3 sm:pt-6 lg:pt-6 overflow-hidden">
        {/* Subtle background ambient blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-tr from-amber-100/70 via-amber-50/30 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Attribution Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <img src={UNIVARAM_LOGO_URL} alt="Univaram" className="w-5 h-5 rounded-md object-contain bg-white shadow-2xs" />
              <span>Built by <strong className="text-slate-900 font-bold">univaram.in</strong></span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-600">Created by Divyanshu Verma</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500 font-medium">Direct Payee:</span>
              <button
                type="button"
                onClick={handleCopyUpiId}
                className="font-mono font-bold text-slate-900 bg-slate-100 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{UNIVARAM_UPI_ID}</span>
                {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
              </button>
            </div>
          </div>

          {/* Main 2-Column Hero Card Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
            
            {/* Left Column: Coffee Selection & Customization */}
            <div id="donate-card" className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-950/5 border border-slate-200/90 flex flex-col justify-between space-y-3">
              <div>
                {/* Header */}
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-base shrink-0 shadow-inner">
                    ☕
                  </div>
                  <div>
                    <h1 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                      Buy Us a Coffee
                    </h1>
                    <p className="text-[11px] text-slate-500">
                      Price: <strong className="text-amber-800 font-bold">₹18</strong> / coffee · Multiples of ₹18
                    </p>
                  </div>
                </div>

                {/* Coffee Presets */}
                <div className="mt-3">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Select Coffee Count:
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {COFFEE_PRESETS.map((preset) => {
                      const isSelected = coffeesCount === preset.cups;
                      const cost = getCoffeeAmount(preset.cups);
                      return (
                        <button
                          key={preset.cups}
                          type="button"
                          onClick={() => setCoffeesCount(preset.cups)}
                          className={`py-1.5 px-1 text-center rounded-xl border transition-all flex flex-col items-center justify-center cursor-pointer min-h-[40px] ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-2xs ring-1 ring-amber-500/30'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium'
                          }`}
                        >
                          <div className="text-[11px] font-extrabold">☕ {preset.cups}</div>
                          <div className="text-[10px] text-amber-800 font-bold">₹{cost}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Stepper Input */}
                <div className="mt-2.5 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 text-[11px]">Multiplier:</span>
                    <span className="text-[11px] font-semibold text-amber-800">
                      {coffeesCount} × ₹18 = <strong className="text-sm font-extrabold text-amber-900">₹{totalAmount}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={coffeesCount <= 1}
                      className="w-8 h-8 rounded-lg bg-white border border-amber-300 text-slate-700 hover:bg-amber-100 flex items-center justify-center font-bold disabled:opacity-40 transition-colors shrink-0 cursor-pointer text-xs"
                      aria-label="Decrease coffee count"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex-1 relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={coffeesCount}
                        onChange={handleCupsInputChange}
                        className="w-full py-1 text-center text-sm font-extrabold text-slate-900 bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-700 pointer-events-none">
                        {coffeesCount === 1 ? 'cup' : 'cups'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleIncrement}
                      className="w-8 h-8 rounded-lg bg-white border border-amber-300 text-slate-700 hover:bg-amber-100 flex items-center justify-center font-bold transition-colors shrink-0 cursor-pointer text-xs"
                      aria-label="Increase coffee count"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Name & Cheer message optional inputs */}
                <div className="mt-2.5 space-y-2">
                  <div>
                    <label htmlFor="home-supporter-name" className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Your Name / Handle (optional):
                    </label>
                    <input
                      id="home-supporter-name"
                      type="text"
                      placeholder="e.g. Rahul or Anonymous"
                      value={supporterName}
                      onChange={(e) => setSupporterName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label htmlFor="home-cheer-message" className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Cheer note for Univaram & Divyanshu (optional):
                    </label>
                    <input
                      id="home-cheer-message"
                      type="text"
                      placeholder="Great work on univaram.in!"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Trust Badge */}
              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 font-medium border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  0% Commission
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Direct Bank Settlement
                </span>
              </div>
            </div>

            {/* Right Column: ALL PAYMENT OPTIONS VISIBLE AT ONCE ON DESKTOP */}
            <div className="lg:col-span-7 bg-gradient-to-b from-white to-amber-50/40 rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-950/5 border-2 border-amber-200/90 flex flex-col justify-between">
              
              {/* Header Banner */}
              <div className="flex items-center justify-between pb-2.5 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                      Scan or Tap Any UPI App
                    </h2>
                    <p className="text-[10px] text-slate-500">
                      All options ready simultaneously · <span className="font-mono text-slate-800">{UNIVARAM_UPI_ID}</span>
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ready
                </span>
              </div>

              {/* Main 2-Side Grid inside Card for Desktop: QR Code on Left + App Launchers on Right */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center py-2">
                
                {/* Side A: Vector QR Code */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center bg-white p-2.5 rounded-xl border border-amber-100 shadow-inner">
                  <UpiQrCode
                    upiUri={liveUpiUri}
                    amount={totalAmount}
                    coffeesCount={coffeesCount}
                    payeeVpa={UNIVARAM_UPI_ID}
                    payeeName="Univaram"
                    size={170}
                    showActions={false}
                  />
                  <div className="mt-1.5 text-center">
                    <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                      {formatINR(totalAmount)} ({coffeesCount} {coffeesCount === 1 ? 'coffee' : 'coffees'})
                    </span>
                  </div>
                </div>

                {/* Side B: All 5 Direct UPI App Buttons + Quick Actions */}
                <div className="sm:col-span-7 space-y-2">
                  <p className="text-[11px] font-bold text-slate-700">
                    Tap to Launch Payment App directly:
                  </p>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenUpiApp('gpay')}
                      className="py-2 px-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition-all shadow-2xs cursor-pointer min-h-[38px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Google Pay</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenUpiApp('phonepe')}
                      className="py-2 px-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition-all shadow-2xs cursor-pointer min-h-[38px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-600" />
                        <span>PhonePe</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenUpiApp('paytm')}
                      className="py-2 px-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition-all shadow-2xs cursor-pointer min-h-[38px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-500" />
                        <span>Paytm</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenUpiApp('bhim')}
                      className="py-2 px-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition-all shadow-2xs cursor-pointer min-h-[38px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        <span>BHIM UPI</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenUpiApp('cred')}
                      className="py-2 px-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition-all shadow-2xs cursor-pointer min-h-[38px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-black" />
                        <span>Cred UPI</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenUpiApp('generic')}
                      className="py-2 px-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-between transition-all shadow-2xs cursor-pointer min-h-[38px]"
                    >
                      <span>Any App</span>
                      <ExternalLink className="w-3 h-3 text-white/80" />
                    </button>
                  </div>

                  {/* VPA Bar & Actions */}
                  <div className="pt-1 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[10px] text-slate-500 font-mono truncate">
                      VPA: <strong>{UNIVARAM_UPI_ID}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpiId}
                      className="px-2 py-1 bg-white border border-slate-200 hover:border-amber-400 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Fullscreen Modal trigger button */}
              <button
                type="button"
                onClick={(e) => handleInitiateDonation(e)}
                className="mt-2 w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Open Expanded Modal View ({formatINR(totalAmount)})</span>
              </button>

            </div>

          </div>
        </div>
      </section>

      {/* Where Your Donation Goes */}
      <section id="impact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
            <span>Built by univaram.in</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Transparent Voluntary Funding</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            Where Does Your Coffee Support Go?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every voluntary multiple of ₹18 sent to <span className="font-mono font-semibold">{UNIVARAM_UPI_ID}</span> directly
            sustains our independent developer tooling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1 */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-bold">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-slate-900">Cloud & Fast Hosting</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Powering high-availability servers, edge CDN routes, SSL encryption, and high-bandwidth APIs for univaram.in with zero downtime.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-bold">
              <Code className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-slate-900">Open-Source Utilities</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Keeping our utilities, GitHub repositories, and developer scripts 100% free and accessible to all developers without paywalls or ads.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-slate-900">0% Commission Non-Custodial</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your contribution never passes through middleman escrow taking a cut. 100% lands directly in our Central Bank UPI account.
            </p>
          </div>
        </div>
      </section>

      {/* Maker Story */}
      <section id="maker" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="bg-gradient-to-tr from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-5 sm:p-8 shadow-xl relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold text-amber-400 block mb-0.5">
                Meet the Maker
              </span>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
                Univaram & Divyanshu Verma
              </h3>
            </div>
            <div className="px-3 py-1 rounded-xl bg-slate-800 text-amber-300 text-xs font-bold border border-slate-700 font-mono">
              Verified UPI: {UNIVARAM_UPI_ID}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            It was built by <strong className="text-white font-bold">univaram.in</strong>, created by{' '}
            <strong className="text-white font-bold">Divyanshu Verma</strong>. Univaram is dedicated to crafting
            accessible, reliable web software and digital developer utilities. Rather than cluttering tools with intrusive
            advertisements or paywalls, we run entirely on voluntary donations and community support from users who appreciate our craft.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-slate-300 font-medium">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Central Bank of India VPA</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Non-profit voluntary backing</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Built by univaram.in</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Accordion FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center space-y-1.5 mb-6">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500">
            <span>Donor Questions</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Univaram Gateway</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-2.5">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-slate-900 hover:bg-slate-50/80 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-amber-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Security & NPCI Compliance Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Direct P2P NPCI Transfer to <strong className="text-slate-900 font-mono">{UNIVARAM_UPI_ID}</strong>. No middleman account storage.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 shrink-0">
            <span>Central Bank of India VPA</span>
            <span aria-hidden="true">·</span>
            <span>0% Platform Commission</span>
          </div>
        </div>
      </section>

      {/* UPI Custom QR Payment Modal */}
      <UpiPaymentModal
        creator={UNIVARAM_PROFILE}
        amount={totalAmount}
        coffeesCount={coffeesCount}
        initialName={supporterName}
        initialMessage={message}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
};
