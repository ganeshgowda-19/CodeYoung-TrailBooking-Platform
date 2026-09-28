import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, CheckCircle2, ArrowRight, RefreshCw, X, KeyRound } from 'lucide-react';

interface Props {
  isOpen: boolean;
  email: string;
  role: string;
  onVerifySuccess: () => void;
  onCancel: () => void;
}

export const OtpVerificationModal: React.FC<Props> = ({
  isOpen,
  email,
  role,
  onVerifySuccess,
  onCancel,
}) => {
  const [generatedOtp, setGeneratedOtp] = useState<string>('482915');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const generateNewOtp = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newCode);
    return newCode;
  };

  useEffect(() => {
    if (isOpen) {
      generateNewOtp();
      setOtp(['', '', '', '', '', '']);
      setError(null);
      setIsSuccess(false);
      setResendTimer(30);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isOpen && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, resendTimer]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleAutoFill = () => {
    const digits = generatedOtp.split('');
    setOtp(digits);
    setError(null);
    inputRefs.current[5]?.focus();
  };

  const handleResend = () => {
    const newCode = generateNewOtp();
    setOtp(['', '', '', '', '', '']);
    setError(null);
    setResendTimer(30);
    const digits = newCode.split('');
    setOtp(digits);
    inputRefs.current[5]?.focus();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      if (code === generatedOtp) {
        setIsSuccess(true);
        setIsVerifying(false);
        setTimeout(() => {
          onVerifySuccess();
        }, 800);
      } else {
        setIsVerifying(false);
        setError(`Invalid OTP code! Only the generated code (${generatedOtp}) is accepted.`);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 duration-300">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-coral-50 border border-coral-200 text-coral-600 flex items-center justify-center mx-auto shadow-md">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Two-Step Verification</h2>
          <p className="text-xs text-slate-600 max-w-xs mx-auto">
            We sent a 6-digit verification code to <strong className="text-slate-900 font-bold">{email || 'your email'}</strong>
          </p>
        </div>

        {/* Demo Code Auto-Fill Banner */}
        <div className="p-3.5 rounded-2xl bg-coral-50/80 border border-coral-200 text-xs flex items-center justify-between text-coral-700">
          <div className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-4 h-4 text-coral-600 shrink-0" />
            <span>Generated OTP: <strong className="font-mono text-sm tracking-wider">{generatedOtp}</strong></span>
          </div>
          <button
            type="button"
            onClick={handleAutoFill}
            className="px-2.5 py-1 bg-coral-500 hover:bg-coral-600 text-white rounded-lg font-bold text-[11px] shadow-sm transition-all active:scale-95"
          >
            Auto-Fill
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="font-extrabold text-emerald-800 text-base">OTP Verified Successfully! 🎉</h3>
            <p className="text-xs text-emerald-600 font-medium">Access granted for {role} portal. Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            {/* 6 Input Boxes */}
            <div className="flex items-center justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 sm:w-12 h-14 bg-slate-50 border border-slate-300 rounded-2xl text-center text-xl font-extrabold text-slate-900 focus:bg-white focus:border-coral-500 focus:ring-2 focus:ring-coral-500/20 focus:outline-none transition-all shadow-sm"
                />
              ))}
            </div>

            {error && <p className="text-center text-xs font-bold text-rose-500">{error}</p>}

            <button
              type="submit"
              disabled={isVerifying || otp.join('').length < 6}
              className="w-full py-3.5 bg-gradient-to-r from-coral-500 via-coral-600 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-coral-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Code...
                </>
              ) : (
                <>
                  Verify & Proceed <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend Code Option */}
            <div className="text-center text-xs text-slate-500 font-medium">
              Didn't receive the email code?{' '}
              {resendTimer > 0 ? (
                <span className="text-slate-400 font-mono">Resend in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-bold text-coral-600 hover:underline"
                >
                  Resend Code Now
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
