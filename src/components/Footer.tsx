import React from 'react';
import { ShieldCheck, Zap, Coffee, ExternalLink } from 'lucide-react';
import { UNIVARAM_UPI_ID, UNIVARAM_LOGO_URL } from '../utils/upi';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Top Banner / Trust Points */}
      <div className="border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Multiples of ₹18</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Every coffee is priced at an accessible base of ₹18 per cup (1 = ₹18, 2 = ₹36, 3 = ₹54, 5 = ₹90, 10 = ₹180).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Direct Peer-to-Peer UPI</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Funds transfer straight into our Central Bank of India UPI account (<strong className="text-slate-300 font-mono">{UNIVARAM_UPI_ID}</strong>).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">0% Platform Cut</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Voluntary community donations go 100% directly to sustain our open-source tools. No middleman deductions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <img
                src={UNIVARAM_LOGO_URL}
                alt="Univaram Logo"
                className="w-7 h-7 rounded-lg object-contain bg-white p-0.5"
              />
              <span className="font-heading font-extrabold text-lg text-white">
                univaram<span className="text-amber-500">.in</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                Buy Us a Coffee
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Dedicated donation gateway built by <strong className="text-slate-300">univaram.in</strong>. Powering independent software and developer tooling with direct UPI donations.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <a
              href="https://univaram.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              <span>univaram.in</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
            <span>•</span>
            <span className="font-mono text-slate-300">{UNIVARAM_UPI_ID}</span>
          </div>
        </div>

        {/* Mandatory copyright line */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
          <p>© 2026 univaram.in. Built by univaram.in. Developed by Univaram, created by Divyanshu Verma. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
