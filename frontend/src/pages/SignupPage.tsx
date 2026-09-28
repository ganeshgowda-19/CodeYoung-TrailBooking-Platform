import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, UserPlus, Sparkles, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { OtpVerificationModal } from '../components/OtpVerificationModal';
import { useAuth } from '../context/AuthContext';
import { strictEmailZodSchema, strictNameZodSchema } from '../utils/validation';

const schema = z.object({
  name: strictNameZodSchema,
  email: strictEmailZodSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['PARENT', 'MENTOR']),
});

type SignupFormData = z.infer<typeof schema>;

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [pendingSignup, setPendingSignup] = useState<{ name: string; email: string; role: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'PARENT',
    },
  });

  const selectedRole = watch('role');
  const currentEmail = watch('email');

  const onSubmit = (data: SignupFormData) => {
    setPendingSignup({ name: data.name, email: data.email, role: data.role });
    setIsOtpOpen(true);
  };

  const handleOtpSuccess = () => {
    setIsOtpOpen(false);
    setSuccessMsg(`Email verified! Account created for ${pendingSignup?.name || 'you'}. Redirecting to trial booking...`);
    setTimeout(() => {
      navigate('/book');
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-md">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Create Your Account</h1>
          <p className="text-xs text-slate-500">Join thousands of parents and students learning with 1:1 live mentors</p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setValue('role', 'PARENT')}
            className={`py-2 rounded-xl transition-all ${
              selectedRole === 'PARENT' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            I am a Parent
          </button>

          <button
            type="button"
            onClick={() => setValue('role', 'MENTOR')}
            className={`py-2 rounded-xl transition-all ${
              selectedRole === 'MENTOR' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            I am a Mentor
          </button>
        </div>

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Google Sign Up Button */}
        <button
          type="button"
          onClick={() => {
            const userEnteredEmail = window.prompt(
              `Google Sign-Up (${selectedRole} Account):\n\nEnter your Google Account email to register & log in:`,
              'sarah.jenkins@gmail.com'
            );

            if (userEnteredEmail !== null && userEnteredEmail.trim() !== '') {
              const cleanEmail = userEnteredEmail.trim();
              const googleName = cleanEmail.split('@')[0].replace('.', ' ');

              // Direct Google Login
              login(cleanEmail, selectedRole, googleName);
              setSuccessMsg(`⚡ Successfully created account via Google (${cleanEmail})! Redirecting...`);

              setTimeout(() => {
                navigate('/book');
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
          <span className="tracking-tight text-slate-900 font-extrabold">Sign up with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[10px] text-slate-400 uppercase tracking-widest font-extrabold absolute">
            or sign up with email
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          {/* Full Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                {...register('name')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 font-medium"
              />
            </div>
            {errors.name && <p className="text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                placeholder="e.g. sarah.jenkins@example.com"
                {...register('email')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 font-medium"
              />
            </div>
            {errors.email && <p className="text-rose-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Create Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
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
            className="w-full py-3 bg-gradient-to-r from-coral-600 via-coral-500 to-amber-500 hover:from-coral-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-coral-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Create Free Account
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-coral-600 hover:text-coral-700">
            Sign In Here
          </Link>
        </div>
      </div>

      <OtpVerificationModal
        isOpen={isOtpOpen}
        email={pendingSignup?.email || currentEmail || 'user@example.com'}
        role={pendingSignup?.role || selectedRole}
        onVerifySuccess={handleOtpSuccess}
        onCancel={() => setIsOtpOpen(false)}
      />
    </div>
  );
};
