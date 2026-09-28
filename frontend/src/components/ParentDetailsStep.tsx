import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, ArrowRight } from 'lucide-react';
import { strictEmailZodSchema, strictNameZodSchema } from '../utils/validation';

const schema = z.object({
  parentName: strictNameZodSchema,
  parentEmail: strictEmailZodSchema,
  studentName: strictNameZodSchema,
  gradeGroup: z.string().optional(),
  subjectTrack: z.string().optional(),
});

export type ParentDetailsFormData = z.infer<typeof schema>;

interface Props {
  initialValues: ParentDetailsFormData;
  onNext: (data: ParentDetailsFormData) => void;
}

export const ParentDetailsStep: React.FC<Props> = ({ initialValues, onNext }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParentDetailsFormData>({
    resolver: zodResolver(schema),
    values: {
      parentName: initialValues.parentName || '',
      parentEmail: initialValues.parentEmail || '',
      studentName: initialValues.studentName || '',
      gradeGroup: initialValues.gradeGroup || 'General Learning',
      subjectTrack: initialValues.subjectTrack || 'Coding & AI',
    },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6 border-2 border-slate-300 rounded-3xl p-6 sm:p-8 bg-white shadow-xl">
      <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-300">
        <h2 className="text-xl font-extrabold text-slate-900 mb-1">Step 1: Parent & Student Details</h2>
        <p className="text-xs text-slate-600">
          Tell us about your student so we can pair them with the ideal specialist mentor.
        </p>
      </div>

      <div className="space-y-5">
        {/* Parent Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Parent Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="e.g. Sarah Jenkins"
              {...register('parentName')}
              className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.parentName
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-coral-500 focus:ring-coral-500/20'
              }`}
            />
          </div>
          {errors.parentName && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.parentName.message}</p>}
        </div>

        {/* Parent Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Parent Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              placeholder="e.g. sarah.jenkins@example.com"
              {...register('parentEmail')}
              className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.parentEmail
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-coral-500 focus:ring-coral-500/20'
              }`}
            />
          </div>
          {errors.parentEmail && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.parentEmail.message}</p>}
        </div>

        {/* Student Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Student Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="e.g. Alex Jenkins (or Student Name)"
              {...register('studentName')}
              className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.studentName
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
            />
          </div>
          {errors.studentName && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.studentName.message}</p>}
        </div>
      </div>

      <div className="pt-4 flex justify-end border-t border-slate-200">
        <button
          type="submit"
          className="px-6 py-2.5 bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-coral-500/20 transition-all flex items-center gap-2 active:scale-95"
        >
          Continue to Timezone <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
