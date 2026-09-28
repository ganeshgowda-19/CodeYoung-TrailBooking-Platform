import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, LogIn, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { OtpVerificationModal } from '../components/OtpVerificationModal';
import { useAuth } from '../context/AuthContext';
import { strictEmailZodSchema } from '../utils/validation';

const schema = z.object({
  email: strictEmailZodSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['PARENT', 'MENTOR', 'ADMIN']),
});

type LoginFormData = z.infer<typeof schema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<'PARENT' | 'MENTOR' | 'ADMIN'>('PARENT');
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccessMsg, setLoginSuccessMsg] = useState<string | null>(null);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState<{ email: string; role: 'PARENT' | 'MENTOR' | 'ADMIN' } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'sarah.jenkins@example.com',
      password: 'password123',
      role: 'PARENT',
    },
  });

  const currentEmail = watch('email');

  const onSubmit = (data: LoginFormData) => {
    setPendingUser({ email: data.email, role: data.role });
    setIsOtpOpen(true);
  };

  const handleOtpSuccess = () => {
    setIsOtpOpen(false);
    const targetEmail = pendingUser?.email || currentEmail || 'sarah.jenkins@example.com';
    const targetRole = pendingUser?.role || role;

    login(targetEmail, targetRole);
    setLoginSuccessMsg(`Verified & logged in successfully as ${targetRole}! Redirecting...`);
    setTimeout(() => {
      if (targetRole === 'MENTOR') {
        navigate('/mentor');
      } else if (targetRole === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/book');
      }
    }, 600);
  };

  const handleQuickDemo = (demoRole: 'PARENT' | 'MENTOR' | 'ADMIN') => {
    setRole(demoRole);
    setValue('role', demoRole);

    let emailVal = 'sarah.jenkins@example.com';
    if (demoRole === 'MENTOR') emailVal = 'arjun.sharma@trialflow.demo';
    if (demoRole === 'ADMIN') emailVal = 'admin@trialflow.demo';

    setValue('email', emailVal);
    setValue('password', 'password123');

    setPendingUser({ email: emailVal, role: demoRole });
    setIsOtpOpen(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      {/* Attractive Glowing Gradient Border Wrapper */}
      <div className="p-1 rounded-[32px] bg-gradient-to-r from-coral-500 via-purple-500 via-indigo-500 to-emerald-400 shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-500">
        <div className="bg-white p-8 rounded-[28px] space-y-6 relative overflow-hidden border border-white/60">
          {/* Rainbow Accent Top Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-coral-500 via-amber-500 via-emerald-500 to-indigo-500" />

          <div className="text-center space-y-2 pt-1">
            <div className="w-12 h-12 rounded-2xl bg-coral-50 border border-coral-200 text-coral-600 flex items-center justify-center mx-auto shadow-md">
              <LogIn className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Welcome Back</h1>
            <p className="text-xs text-slate-500">Sign in to manage your 1:1 live trial sessions & schedule</p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setRole('PARENT');
                setValue('role', 'PARENT');
              }}
              className={`py-2 rounded-xl transition-all ${
                role === 'PARENT' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Parent
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('MENTOR');
                setValue('role', 'MENTOR');
              }}
              className={`py-2 rounded-xl transition-all ${
                role === 'MENTOR' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Mentor
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('ADMIN');
                setValue('role', 'ADMIN');
              }}
              className={`py-2 rounded-xl transition-all ${
                role === 'ADMIN' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>

          {loginSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {loginSuccessMsg}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={() => {
              const defaultGoogleEmail = role === 'MENTOR' 
                ? 'arjun.sharma@gmail.com' 
                : role === 'ADMIN' 
                ? 'admin.codeyoung@gmail.com' 
                : 'sarah.jenkins@gmail.com';

              const userEnteredEmail = window.prompt(
                `Google Sign-In (${role} Account):\n\nEnter your Google Account email to continue:`,
                defaultGoogleEmail
              );

              if (userEnteredEmail !== null && userEnteredEmail.trim() !== '') {
                const cleanEmail = userEnteredEmail.trim();
                const googleName = cleanEmail.split('@')[0].replace('.', ' ');
                
                // Direct Google Login
                login(cleanEmail, role, googleName);
                setLoginSuccessMsg(`⚡ Successfully authenticated via Google (${cleanEmail})! Redirecting to ${role} portal...`);

                setTimeout(() => {
                  if (role === 'MENTOR') {
                    navigate('/mentor');
                  } else if (role === 'ADMIN') {
                    navigate('/admin');
                  } else {
                    navigate('/book');
                  }
                }, 600);
              }
            }}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-400 rounded-xl text-slate-800 text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 active:scale-95 group relative overflow-hidden"
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-110 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="tracking-tight text-slate-900 font-extrabold">Sign in with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] text-slate-400 uppercase tracking-widest font-extrabold absolute">
              or sign in with email
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            {/* Email */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  {...register('email')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 font-medium"
                />
              </div>
              {errors.email && <p className="text-rose-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-coral-600 hover:from-indigo-700 hover:via-purple-700 hover:to-coral-700 text-white font-black text-xs rounded-xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              {/* Shimmer reflection sweep */}
              <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform">
                <LogIn className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="tracking-wide">Sign In to {role} Portal</span>
            </button>
          </form>

          {/* Quick Demo Options */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Quick One-Click Demo Logins
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('PARENT')}
                className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-[11px] text-center"
              >
                Demo Parent
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('MENTOR')}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-[11px] text-center"
              >
                Demo Mentor
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold text-[11px] text-center"
              >
                Demo Admin
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-coral-600 hover:text-coral-700">
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>

      <OtpVerificationModal
        isOpen={isOtpOpen}
        email={pendingUser?.email || currentEmail || 'user@example.com'}
        role={pendingUser?.role || role}
        onVerifySuccess={handleOtpSuccess}
        onCancel={() => setIsOtpOpen(false)}
      />
    </div>
  );
};
