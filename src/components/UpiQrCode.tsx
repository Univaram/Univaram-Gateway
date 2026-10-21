import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, QrCode as QrIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { formatINR, UNIVARAM_LOGO_URL } from '../utils/upi';
import { useToast } from './Toast';

interface UpiQrCodeProps {
  upiUri: string;
  amount: number;
  coffeesCount?: number;
  payeeVpa: string;
  payeeName?: string;
  size?: number;
  showActions?: boolean;
  className?: string;
}

export const UpiQrCode: React.FC<UpiQrCodeProps> = ({
  upiUri,
  amount,
  coffeesCount,
  payeeVpa,
  payeeName = 'Univaram',
  size = 260,
  showActions = true,
  className = '',
}) => {
  const { success, error } = useToast();
  const [dataUrl, setDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [copiedVpa, setCopiedVpa] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;
    setIsGenerating(true);
    setGenerateError(null);

    if (!upiUri) {
      setGenerateError('No UPI URI provided');
      setIsGenerating(false);
      return;
    }

    QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: Math.max(300, size * 2), // generate at 2x for sharp retina rendering
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (!isCancelled) {
          setDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Failed to generate UPI QR Code:', err);
          setGenerateError('Could not render QR code');
          setIsGenerating(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [upiUri, size]);

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(payeeVpa);
    setCopiedVpa(true);
    success(`Copied UPI ID: ${payeeVpa}`);
    setTimeout(() => setCopiedVpa(false), 2500);
  };

  const handleDownloadQr = () => {
    if (!dataUrl) {
      error('QR code is not ready yet');
      return;
    }
    try {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `univaram-upi-qr-${amount}inr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      success('QR Code saved to downloads!');
    } catch (err) {
      console.error('Download failed:', err);
      error('Failed to download image.');
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* QR Code Container with High Contrast & Visual Framing */}
      <div className="relative p-3.5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex items-center justify-center group">
        {isGenerating ? (
          <div
            style={{ width: size, height: size }}
            className="flex flex-col items-center justify-center gap-2 text-slate-400 bg-slate-50 rounded-xl"
          >
            <RefreshCw className="w-7 h-7 animate-spin text-amber-600" />
            <span className="text-xs font-semibold text-slate-600">Generating UPI QR...</span>
          </div>
        ) : generateError ? (
          <div
            style={{ width: size, height: size }}
            className="flex flex-col items-center justify-center gap-2 text-rose-500 bg-rose-50 rounded-xl p-4 text-center"
          >
            <AlertCircle className="w-8 h-8 text-rose-600" />
            <span className="text-xs font-bold text-slate-800">QR Generation Failed</span>
            <span className="text-[11px] text-slate-500">{generateError}</span>
          </div>
        ) : (
          <div className="relative" style={{ width: size, height: size }}>
            <img
              src={dataUrl}
              alt={`UPI QR code for ${formatINR(amount)} to ${payeeVpa}`}
              width={size}
              height={size}
              className="w-full h-full object-contain rounded-lg select-none"
              loading="eager"
              decoding="sync"
            />
            {/* Center Brand Icon */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-amber-500 shadow-md flex items-center justify-center overflow-hidden p-0.5">
                <img
                  src={UNIVARAM_LOGO_URL}
                  alt="Univaram"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UPI Info Pill below QR */}
      <div className="mt-3 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/90 text-amber-900 text-xs font-extrabold">
          <span>{formatINR(amount)}</span>
          {coffeesCount && (
            <span className="text-[11px] font-medium text-amber-700">
              ({coffeesCount} {coffeesCount === 1 ? 'coffee' : 'coffees'})
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500">
          Scan with <strong>Google Pay</strong>, <strong>PhonePe</strong>, <strong>Paytm</strong>,{' '}
          <strong>BHIM</strong>, or <strong>Cred</strong>
        </p>
      </div>

      {/* Action Buttons: Copy VPA & Download QR */}
      {showActions && (
        <div className="mt-3 w-full max-w-xs space-y-2">
          {/* VPA Bar */}
          <div className="w-full bg-slate-50 border border-slate-200/90 rounded-xl p-2 flex items-center justify-between text-xs shadow-2xs">
            <span className="text-slate-600 font-mono font-bold truncate px-1 text-[11px]">
              {payeeVpa}
            </span>
            <button
              type="button"
              onClick={handleCopyVpa}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:border-amber-400 rounded-lg font-medium text-slate-700 hover:text-amber-800 transition-colors shadow-2xs"
            >
              {copiedVpa ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] font-bold text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Copy VPA</span>
                </>
              )}
            </button>
          </div>

          {/* Download QR Image for gallery scanning */}
          <button
            type="button"
            onClick={handleDownloadQr}
            disabled={!dataUrl || isGenerating}
            className="w-full py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-[11px] font-semibold text-slate-700 hover:text-slate-900 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Save / Download QR Image</span>
          </button>
        </div>
      )}
    </div>
  );
};
