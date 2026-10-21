import React, { useState } from 'react';
import { UNIVARAM_UPI_ID, UNIVARAM_LOGO_URL } from '../utils/upi';
import { useToast } from './Toast';
import { Coffee, Copy, Check, ExternalLink, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { success, info } = useToast();
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCopyUpi = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(UNIVARAM_UPI_ID);
      setCopiedUpi(true);
      success(`UPI ID copied: ${UNIVARAM_UPI_ID}`);
      setTimeout(() => setCopiedUpi(false), 2500);
    } else {
      info(`UPI ID: ${UNIVARAM_UPI_ID}`);
    }
  };

  const handleScrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4 sm:gap-8">
          {/* Zone 1: Single Element Brand Wordmark */}
          <a
            href="/"
            className="flex items-center gap-2.5 font-heading font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            <img
              src={UNIVARAM_LOGO_URL}
              alt="Univaram Logo"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain shadow-xs bg-white p-0.5 border border-slate-200/80"
              onError={(e) => {
                // Fallback to emoji if network blocks image
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <span>
              univaram<span className="text-amber-600">.in</span>
            </span>
          </a>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs lg:text-sm font-semibold text-slate-600">
            <button
              onClick={() => handleScrollToSection('donate-card')}
              className="hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Buy Us Coffee
            </button>
            <button
              onClick={() => handleScrollToSection('impact')}
              className="hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Where Money Goes
            </button>
            <button
              onClick={() => handleScrollToSection('maker')}
              className="hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              About Univaram
            </button>
            <button
              onClick={() => handleScrollToSection('faq')}
              className="hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              FAQ
            </button>
            <a
              href="https://univaram.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-amber-800 transition-colors whitespace-nowrap shrink-0"
            >
              <span>univaram.in</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </nav>

          {/* Zone 3: Primary Action & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCopyUpi}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors border border-slate-200"
              title="Copy Central Bank UPI VPA"
            >
              {copiedUpi ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-slate-800 font-bold">{UNIVARAM_UPI_ID}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleScrollToSection('donate-card')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl transition-all shadow-sm hover:shadow shadow-amber-600/25 active:scale-[0.98] min-h-[40px] cursor-pointer"
            >
              <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Buy Coffee</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => handleScrollToSection('donate-card')}
            className="block w-full text-left py-2.5 px-3 text-sm font-bold text-slate-800 hover:bg-amber-50 hover:text-amber-900 rounded-xl transition-colors"
          >
            Buy Us a Coffee
          </button>
          <button
            onClick={() => handleScrollToSection('impact')}
            className="block w-full text-left py-2.5 px-3 text-sm font-bold text-slate-800 hover:bg-amber-50 hover:text-amber-900 rounded-xl transition-colors"
          >
            Where Money Goes
          </button>
          <button
            onClick={() => handleScrollToSection('maker')}
            className="block w-full text-left py-2.5 px-3 text-sm font-bold text-slate-800 hover:bg-amber-50 hover:text-amber-900 rounded-xl transition-colors"
          >
            About Univaram & Divyanshu
          </button>
          <button
            onClick={() => handleScrollToSection('faq')}
            className="block w-full text-left py-2.5 px-3 text-sm font-bold text-slate-800 hover:bg-amber-50 hover:text-amber-900 rounded-xl transition-colors"
          >
            Frequently Asked Questions
          </button>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Payee VPA:</span>
            <button
              onClick={handleCopyUpi}
              className="px-2.5 py-1 bg-slate-100 text-slate-900 font-mono text-xs font-bold rounded-lg border border-slate-200"
            >
              {copiedUpi ? 'Copied VPA!' : UNIVARAM_UPI_ID}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
