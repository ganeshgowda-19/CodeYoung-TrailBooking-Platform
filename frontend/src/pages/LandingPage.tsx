import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  Sparkles,
  Users,
  ArrowRight,
  Code,
  Cpu,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  XCircle,
  Zap,
  Target,
  Laptop,
  Clock,
} from 'lucide-react';

const RunningNumber: React.FC<{
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  formatComma?: boolean;
  duration?: number;
}> = ({ target, decimals = 0, prefix = '', suffix = '', formatComma = false, duration = 2500 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(easeProgress * target);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    const interval = setInterval(() => {
      startTimestamp = null;
      animationFrameId = requestAnimationFrame(step);
    }, 6000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(interval);
    };
  }, [target, duration]);

  const formatted = decimals > 0
    ? count.toFixed(decimals)
    : formatComma
      ? Math.floor(count).toLocaleString()
      : Math.floor(count).toString();

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [mentorFilter, setMentorFilter] = useState<'available' | 'zero' | 'one' | 'all'>('available');

  const { data: mentorsList } = useQuery({
    queryKey: ['mentors-list'],
    queryFn: api.getMentors,
  });

  const subjectTracks = [
    {
      title: 'Engineering & Computer Science',
      grades: 'Engineering, CS & IT',
      desc: 'Master Python, Data Structures, System Design, AI & Full-Stack Development with 1:1 live feedback.',
      icon: Code,
      themeColor: 'from-indigo-500 to-purple-600',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/90',
      skills: ['Python AI', 'Data Structures', 'System Design', 'Full-Stack'],
      projectOutcome: 'Build & deploy a live interactive AI Web App',
      accentBorder: 'hover:border-indigo-400/80',
    },
    {
      title: 'Medical & Healthcare Science',
      grades: 'Medical, Nursing & Bio',
      desc: 'Clinical concept breakdowns, Human Physiology, Pharmacology & Memory-retention techniques.',
      icon: GraduationCap,
      themeColor: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
      skills: ['Clinical Cases', 'Human Physiology', 'Pharmacology', 'Mnemonics'],
      projectOutcome: 'Complete a visual clinical case study breakdown',
      accentBorder: 'hover:border-emerald-400/80',
    },
    {
      title: 'School & Mathematics Foundation',
      grades: 'Grades 1–12 (School STEM)',
      desc: 'Visual mental math, competitive Math Olympiad logic, physics & analytical reasoning.',
      icon: Cpu,
      themeColor: 'from-amber-500 to-coral-500',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200/90',
      skills: ['Math Olympiad', 'Mental Math', 'Physics Logic', 'Spatial Reasoning'],
      projectOutcome: 'Build a 3D visual problem-solving engine',
      accentBorder: 'hover:border-amber-400/80',
    },
  ];

  const comparisonFeatures = [
    {
      feature: 'Instruction Ratio & Focus',
      category: 'Class Format',
      icon: Users,
      trialflow: '100% Dedicated 1-on-1 Live Interaction',
      traditional: 'Crowded Group Calls (20–50 Students) or Static Videos',
      advantage: 'Direct mentor feedback with zero distractions',
    },
    {
      feature: 'Mentor Daily Teaching Cap',
      category: 'Instructor Quality',
      icon: Zap,
      trialflow: 'Strict Limit (Max 2 Demo Sessions / Day per Mentor)',
      traditional: 'Overworked Tutors (6–10 Demanding Classes / Day)',
      advantage: '100% High Mentor Energy & Dedicated Focus',
    },
    {
      feature: 'Adaptive Pacing Engine',
      category: 'Learning Speed',
      icon: Target,
      trialflow: 'Diagnostic Quiz Pacing (Slow, Moderate, Quick Profile)',
      traditional: 'Rigid One-Size-Fits-All Pacing',
      advantage: 'Tailored speed so no student gets left behind',
    },
    {
      feature: 'Practical Real-World Output',
      category: 'Hands-on Project',
      icon: Laptop,
      trialflow: 'Build & Deploy Real Software Project in 1st Session',
      traditional: 'Passive Slide Watching & Rote Homework Drills',
      advantage: 'Tangible portfolio project ready in 30 mins',
    },
    {
      feature: 'Global Timezone Correction',
      category: 'Scheduling Engine',
      icon: Clock,
      trialflow: 'Automatic Local DST Detection (US, UK, Asia, CA)',
      traditional: 'Manual Timezone Calculations & Slot Confusion',
      advantage: 'Instant local time slot matching',
    },
  ];

  const faqs = [
    {
      q: 'Is the 1:1 trial session completely free?',
      a: 'Yes, 100% free! There are no credit card details required to book your trial class. You get full access to a live 1:1 session with a certified mentor.',
    },
    {
      q: 'Who can join the platform?',
      a: 'TrialFlow is open to everyone facing difficulty in learning—from Engineering and Computer Science students to Medical/Doctors, K-12 School students, and Career Transitioners.',
    },
    {
      q: 'How does mentor allocation work?',
      a: 'Our smart scheduling system automatically pairs your student with an active, certified mentor based on your local timezone and selected learning domain. Mentors have a strict daily teaching limit (max 2 demo classes per day) so they are energetic and 100% focused on your student.',
    },
    {
      q: 'What equipment do we need for the trial class?',
      a: 'All you need is a laptop, desktop, or mobile device with a working webcam and microphone. The trial classroom runs directly inside your browser!',
    },
  ];

  return (
    <div className="space-y-20 pb-20 overflow-x-hidden">
      {/* 1. Hero Section */}
      <section id="overview" className="scroll-mt-24 relative pt-4 md:pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 text-left space-y-6">
            {/* Realtime Capacity Badge */}
            <div className="inline-flex flex-wrap items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900 text-white border border-slate-700/80 text-xs font-extrabold shadow-lg backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-amber-400 tracking-wide font-black">🚀 CodeYoung 1:1 Live Mentorship</span>
              <span className="text-slate-600">•</span>
              <span className="bg-gradient-to-r from-amber-300 via-coral-300 to-rose-300 bg-clip-text text-transparent font-black">
                🔥 Limited Free Trial Sessions Available Today
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Personalized 1:1 Live Mentorship Across{' '}
                <span className="bg-gradient-to-r from-coral-600 via-amber-500 via-emerald-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-xs">
                  CS, Medical Science & STEM
                </span>
              </h1>
            </div>

            {/* 2-Min Diagnostic Assessment Feature Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-amber-300 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" /> 2-Minute Diagnostic Assessment
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                  AI Pacing Sync
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Identify your pace profile (<span className="text-emerald-400 font-bold">Slow</span>, <span className="text-amber-300 font-bold">Moderate</span>, or <span className="text-coral-400 font-bold">Quick</span>) to instantly pair with a top 1% certified mentor.
              </p>
            </div>

            {/* Primary Action Group */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                to="/book"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-coral-600 via-coral-500 to-amber-500 hover:from-coral-500 hover:to-amber-400 text-white text-sm font-black rounded-2xl shadow-xl shadow-coral-500/25 transition-all flex items-center justify-center gap-2.5 active:scale-95 group relative overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" /> Book Free 1:1 Trial Class
              </Link>

              <Link
                to="/mentor"
                className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-sm font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xs hover:border-slate-300 active:scale-95"
              >
                <Users className="w-4 h-4 text-indigo-600" /> View Mentor Network
              </Link>
            </div>

            {/* Trust Checkmarks */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-700 font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Free Trial
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No Credit Card Needed
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Auto Timezone Correction
              </span>
            </div>
          </div>

          {/* Right Hero Image Visual - Positioned a little bit lower */}
          <div className="lg:col-span-5 relative lg:pt-12 sm:pt-8 pt-4">
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-tr from-coral-500/20 via-amber-500/20 to-indigo-500/20 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-gradient-to-br from-indigo-500/20 via-emerald-500/20 to-coral-500/20 rounded-full blur-3xl -z-10" />

            <div className="rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden p-2 sm:p-3">
              <img
                src="/hero-image.jpeg"
                alt="CodeYoung 1:1 Live Learning"
                className="w-full h-auto rounded-2xl object-cover shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Statistics Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center border border-slate-800 overflow-hidden">
          {/* Subtle Live Running Accent Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-coral-500 via-amber-400 via-emerald-400 to-indigo-500 animate-pulse" />

          <div className="space-y-1 relative">
            <p className="text-3xl sm:text-4xl font-black text-coral-400 font-mono tracking-tight">
              <RunningNumber target={20000} formatComma={true} suffix="+" />
            </p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Students</p>
          </div>
          <div className="space-y-1 relative">
            <p className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
              <RunningNumber target={4.98} decimals={2} suffix=" / 5.0" />
            </p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Parent Rating</p>
          </div>
          <div className="space-y-1 relative">
            <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
              <RunningNumber target={100} suffix="%" />
            </p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">1:1 Live Ratio</p>
          </div>
          <div className="space-y-1 relative">
            <p className="text-3xl sm:text-4xl font-black text-indigo-400 font-mono tracking-tight">
              Max <RunningNumber target={2} suffix="/Day" />
            </p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mentor Daily Limit</p>
          </div>
        </div>
      </section>

      {/* 3. Curriculum Tracks Section (Professional SaaS Layout) */}
      <section id="tracks" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-coral-50 border border-coral-200/80 text-coral-600 text-xs font-black tracking-wider uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Universal Curriculum Tracks
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Tailored Programs For Every Learning Domain
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
            Every student completes a real, tangible project during their very first 1:1 live trial session—guided step-by-step by an expert mentor.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {subjectTracks.map((track, i) => {
            const Icon = track.icon;
            return (
              <div
                key={i}
                className={`bg-white rounded-3xl p-7 border border-slate-200/90 shadow-lg hover:shadow-2xl ${track.accentBorder} transition-all duration-300 flex flex-col justify-between group relative overflow-hidden`}
              >
                {/* Top Subtle Gradient Stripe */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${track.themeColor}`} />

                <div className="space-y-5">
                  {/* Card Top Row: Icon + Target Audience Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${track.themeColor} p-0.5 shadow-md group-hover:scale-105 transition-transform`}>
                      <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                        <Icon className="w-7 h-7 text-slate-900" />
                      </div>
                    </div>

                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border shadow-2xs ${track.badgeBg}`}>
                      {track.grades}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="font-black text-slate-900 text-xl tracking-tight leading-snug">
                      {track.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {track.desc}
                    </p>
                  </div>

                  {/* Skills Pill Chips */}
                  <div className="pt-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
                      Core Subjects Taught:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {track.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Session 1 Project Outcome Banner & CTA */}
                <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Session 1 Project Output
                      </span>
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">100% Live</span>
                    </div>
                    <p className="text-xs font-extrabold text-emerald-950 leading-snug">
                      {track.projectOutcome}
                    </p>
                  </div>

                  <Link
                    to="/book"
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 group-hover:bg-gradient-to-r group-hover:from-coral-600 group-hover:to-amber-500 shadow-md active:scale-95"
                  >
                    Select This Track & Book <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Why 1:1 Mentorship Wins (Professional SaaS Comparison Matrix) */}
      <section id="why-us" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-12 shadow-2xl border border-slate-800/90">
          {/* Ambient Glowing Orbs */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0,transparent_70%)] pointer-events-none" />

          {/* Section Header */}
          <div className="relative z-10 text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-black tracking-wider uppercase backdrop-blur-md shadow-lg shadow-emerald-500/5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} /> The TrialFlow Distinction
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Why 1:1 Live Studio <br />
              <span className="bg-gradient-to-r from-coral-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
                Outperforms Group & Recorded Classes
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl mx-auto leading-relaxed">
              Discover how personalized 1-on-1 attention, diagnostic pacing, and fresh mentors deliver 3x faster concept mastery compared to traditional methods.
            </p>
          </div>

          {/* SaaS Comparison Table Grid */}
          <div className="relative z-10 space-y-4">
            {/* Table Column Headers */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 text-xs font-extrabold uppercase tracking-wider text-slate-400 backdrop-blur-md">
              <div className="col-span-4 flex items-center gap-2">
                <span>Evaluation Metric</span>
              </div>
              <div className="col-span-4 text-emerald-400 flex items-center gap-2 font-black">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <Sparkles className="w-4 h-4 text-emerald-400" /> TrialFlow 1:1 Live Studio
              </div>
              <div className="col-span-4 text-slate-400 flex items-center gap-1.5">
                Traditional / Mass Courses
              </div>
            </div>

            {/* Feature Comparison Cards / Rows */}
            {comparisonFeatures.map((row, index) => {
              const Icon = row.icon;
              return (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 sm:p-6 rounded-2xl bg-slate-800/40 hover:bg-slate-800/90 border border-slate-700/50 hover:border-emerald-500/40 transition-all duration-300 group items-center shadow-md hover:shadow-xl hover:shadow-emerald-500/5"
                >
                  {/* Left Metric Info */}
                  <div className="md:col-span-4 space-y-1.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-400/30 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-indigo-400/60 transition-all duration-300 shadow-inner">
                        <Icon className="w-5 h-5 text-indigo-300" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">
                          {row.category}
                        </span>
                        <h3 className="font-extrabold text-white text-sm sm:text-base group-hover:text-indigo-200 transition-colors">
                          {row.feature}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: TrialFlow 1:1 Advantage (Highlighted) */}
                  <div className="md:col-span-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-emerald-900/40 to-slate-900/90 border border-emerald-500/50 space-y-2.5 shadow-lg group-hover:border-emerald-400/80 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/5 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-start gap-2.5 relative z-10">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-400/50 shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="font-extrabold text-emerald-100 text-xs sm:text-sm leading-snug">
                          {row.trialflow}
                        </p>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold backdrop-blur-sm">
                          <span>✨ Key Benefit:</span>
                          <span className="text-white font-extrabold">{row.advantage}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Traditional Approach (Muted) */}
                  <div className="md:col-span-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 text-slate-400 space-y-1 group-hover:border-slate-700/80 transition-all">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 border border-rose-500/20">
                        <XCircle className="w-4 h-4 text-rose-400/90" />
                      </div>
                      <p className="font-medium text-slate-400 text-xs sm:text-sm leading-snug pt-0.5">
                        {row.traditional}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Key Summary Stats Cards */}
          <div className="relative z-10 pt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800/80 mt-12">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-800/30 hover:bg-slate-800/90 border border-slate-700/60 hover:border-coral-500/50 transition-all duration-300 flex items-center gap-4 group shadow-lg">
              <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-coral-500/20 to-coral-600/10 border border-coral-500/40 text-coral-400 font-black text-lg sm:text-xl shrink-0 shadow-inner whitespace-nowrap tracking-tight group-hover:scale-105 transition-transform">
                100%
              </div>
              <div className="space-y-0.5">
                <p className="font-extrabold text-white text-xs sm:text-sm group-hover:text-coral-300 transition-colors">
                  Direct 1:1 Attention
                </p>
                <p className="text-[11px] text-slate-400 leading-snug">Zero crowded classroom noise</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-800/30 hover:bg-slate-800/90 border border-slate-700/60 hover:border-amber-500/50 transition-all duration-300 flex items-center gap-4 group shadow-lg">
              <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-400 font-black text-lg sm:text-xl shrink-0 shadow-inner whitespace-nowrap tracking-tight group-hover:scale-105 transition-transform">
                Max 2
              </div>
              <div className="space-y-0.5">
                <p className="font-extrabold text-white text-xs sm:text-sm group-hover:text-amber-300 transition-colors">
                  Sessions / Day Cap
                </p>
                <p className="text-[11px] text-slate-400 leading-snug">Fresh & energetic mentors</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-800/30 hover:bg-slate-800/90 border border-slate-700/60 hover:border-emerald-500/50 transition-all duration-300 flex items-center gap-4 group shadow-lg">
              <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/40 text-emerald-400 font-black text-lg sm:text-xl shrink-0 shadow-inner whitespace-nowrap tracking-tight group-hover:scale-105 transition-transform">
                1st Class
              </div>
              <div className="space-y-0.5">
                <p className="font-extrabold text-white text-xs sm:text-sm group-hover:text-emerald-300 transition-colors">
                  Hands-on Project
                </p>
                <p className="text-[11px] text-slate-400 leading-snug">Tangible portfolio outcome</p>
              </div>
            </div>
          </div>

          {/* Bottom Action CTA */}
          <div className="relative z-10 text-center pt-10">
            <Link
              to="/book"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-coral-500 via-coral-600 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm transition-all shadow-xl shadow-coral-500/25 active:scale-95 group hover:shadow-coral-500/40"
            >
              <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" /> Experience 1:1 Live Trial — Book Now <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Mentor Network Showcase */}
      <section id="mentors" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-black tracking-wider uppercase shadow-xs">
            <Users className="w-3.5 h-3.5 text-amber-600" /> Top 1% Global Faculty & Milestones
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Meet Our Certified Mentors
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
            Mentors are sorted dynamically by daily availability: <strong>Mentors with 0 sessions engaged today appear FIRST</strong>, followed by mentors with 1 session engaged.
          </p>

          {/* Availability Filter Tabs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-extrabold">
            <button
              onClick={() => setMentorFilter('available')}
              className={`px-4 py-2 rounded-xl border transition-all ${mentorFilter === 'available'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
            >
              ✨ Available Mentors (0 Engaged First)
            </button>
            <button
              onClick={() => setMentorFilter('zero')}
              className={`px-4 py-2 rounded-xl border transition-all ${mentorFilter === 'zero'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
            >
              🟢 0 Sessions Engaged
            </button>
            <button
              onClick={() => setMentorFilter('one')}
              className={`px-4 py-2 rounded-xl border transition-all ${mentorFilter === 'one'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-md'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
            >
              🟡 1 Session Engaged
            </button>
            <button
              onClick={() => setMentorFilter('all')}
              className={`px-4 py-2 rounded-xl border transition-all ${mentorFilter === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
            >
              All Mentors
            </button>
          </div>
        </div>

        {/* Mentor Cards Grid */}
        {(() => {
          const visibleMentors = (mentorsList || []).filter((m) => {
            const todayCount = m.todayBookingsCount || 0;
            const maxCap = m.maxDailyClasses || 2;
            if (mentorFilter === 'zero') return todayCount === 0;
            if (mentorFilter === 'one') return todayCount === 1;
            if (mentorFilter === 'available') return todayCount < maxCap;
            return true;
          });

          if (visibleMentors.length === 0) {
            return (
              <div className="p-8 sm:p-12 rounded-3xl bg-amber-50/70 border-2 border-amber-200 text-center space-y-4 max-w-2xl mx-auto shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto font-black text-2xl shadow-sm">
                  ⚡
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900">No Certified Mentors Match This Filter Right Now</h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
                    All mentors in this category are either conducting live trial sessions or have reached their maximum daily capacity cap (2 classes/day) to preserve 100% teaching quality.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setMentorFilter('all')}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
                  >
                    View All Mentors
                  </button>
                  <Link
                    to="/book"
                    className="px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
                  >
                    Book Next Available Slot
                  </Link>
                </div>
              </div>
            );
          }

          // Duplicate mentors list if small to ensure a smooth continuous marquee scroll
          const marqueeMentors = visibleMentors.length < 6
            ? [...visibleMentors, ...visibleMentors, ...visibleMentors, ...visibleMentors]
            : [...visibleMentors, ...visibleMentors];

          return (
            <div className="overflow-hidden relative w-full py-2">
              {/* Fade gradient edges on left and right */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-50 to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-50 to-transparent z-10" />

              <div className="animate-marquee-rtl flex items-stretch gap-6 py-2">
                {marqueeMentors.map((mentor, index) => {
                  const initials = mentor.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('');
                  const todayCount = mentor.todayBookingsCount || 0;
                  const maxCap = mentor.maxDailyClasses || 2;

                  // Color palettes for colored borders
                  const colorPalettes = [
                    { border: 'border-2 border-indigo-200 hover:border-indigo-500 shadow-indigo-500/10 hover:shadow-indigo-500/20', stripe: 'from-indigo-500 via-purple-500 to-coral-500', avatar: 'from-indigo-500 via-purple-500 to-coral-500', titleColor: 'text-indigo-600', btn: 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                    { border: 'border-2 border-coral-200 hover:border-coral-500 shadow-coral-500/10 hover:shadow-coral-500/20', stripe: 'from-coral-500 via-amber-500 to-emerald-500', avatar: 'from-coral-500 via-amber-500 to-emerald-500', titleColor: 'text-coral-600', btn: 'from-coral-600 to-amber-500 hover:from-coral-700 hover:to-amber-600' },
                    { border: 'border-2 border-emerald-200 hover:border-emerald-500 shadow-emerald-500/10 hover:shadow-emerald-500/20', stripe: 'from-emerald-500 via-teal-500 to-indigo-500', avatar: 'from-emerald-500 via-teal-500 to-indigo-500', titleColor: 'text-emerald-700', btn: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                    { border: 'border-2 border-amber-200 hover:border-amber-500 shadow-amber-500/10 hover:shadow-amber-500/20', stripe: 'from-amber-500 via-orange-500 to-rose-500', avatar: 'from-amber-500 via-orange-500 to-rose-500', titleColor: 'text-amber-700', btn: 'from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700' },
                    { border: 'border-2 border-purple-200 hover:border-purple-500 shadow-purple-500/10 hover:shadow-purple-500/20', stripe: 'from-purple-500 via-rose-500 to-coral-500', avatar: 'from-purple-500 via-rose-500 to-coral-500', titleColor: 'text-purple-600', btn: 'from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700' },
                    { border: 'border-2 border-teal-200 hover:border-teal-500 shadow-teal-500/10 hover:shadow-teal-500/20', stripe: 'from-teal-500 via-indigo-500 to-purple-500', avatar: 'from-teal-500 via-indigo-500 to-purple-500', titleColor: 'text-teal-700', btn: 'from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700' },
                  ];
                  const palette = colorPalettes[index % colorPalettes.length];

                  let statusBadge = (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/90 px-2.5 py-1 rounded-full font-black text-[10px] flex items-center gap-1.5 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>🟢 0/{maxCap} Engaged Today</span>
                    </span>
                  );

                  if (todayCount === 1) {
                    statusBadge = (
                      <span className="bg-amber-50 text-amber-800 border border-amber-200/90 px-2.5 py-1 rounded-full font-black text-[10px] flex items-center gap-1.5 shadow-xs">
                        <span>🟡 1/{maxCap} Engaged Today</span>
                      </span>
                    );
                  } else if (todayCount >= maxCap) {
                    statusBadge = (
                      <span className="bg-rose-50 text-rose-800 border border-rose-200/90 px-2.5 py-1 rounded-full font-black text-[10px] flex items-center gap-1.5 shadow-xs">
                        <span>🔴 2/{maxCap} Full Today</span>
                      </span>
                    );
                  }

                  return (
                    <div
                      key={`${mentor.id}-${index}`}
                      className={`w-[320px] sm:w-[350px] shrink-0 bg-white p-6 rounded-[32px] ${palette.border} shadow-lg space-y-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group relative overflow-hidden`}
                    >
                      {/* Top Rainbow Accent Strip */}
                      <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${palette.stripe}`} />

                      <div className="space-y-4 pt-1">
                        {/* Avatar & Basic Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${palette.avatar} p-0.5 shadow-md shrink-0 group-hover:scale-105 transition-transform relative`}>
                              <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center font-black text-slate-900 text-base">
                                {initials}
                              </div>
                              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">
                                ✓
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-black text-slate-900 text-base leading-snug group-hover:text-coral-600 transition-colors">
                                  {mentor.name}
                                </h3>
                              </div>
                              <p className={`text-xs font-black ${palette.titleColor}`}>
                                {mentor.title || 'Senior EdTech Mentor'}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono pt-0.5 flex items-center gap-1">
                                <span>🌐 {mentor.timezone}</span>
                              </p>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black shrink-0 shadow-2xs">
                            Top 1% Faculty
                          </span>
                        </div>

                        {/* Ratings & Student Milestone Summary */}
                        <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-700">
                          <span className="flex items-center gap-1 text-amber-600 font-extrabold">
                            ★ 4.98 <span className="text-slate-400 font-normal text-[10px]">(140+ Reviews)</span>
                          </span>
                          <span className="text-slate-500">🎓 6+ Yrs Exp</span>
                        </div>

                        {/* Milestone Highlights Banner */}
                        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 border border-slate-200/90 space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                            <span>Milestones & Expertise</span>
                            <span className="text-indigo-600">Grades 1-12</span>
                          </p>
                          <p className="text-xs font-black text-slate-800 leading-relaxed">
                            {mentor.milestone || '🏆 500+ Live 1:1 Trial Classes Conducted'}
                          </p>
                          {mentor.badges && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {mentor.badges.map((b, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs"
                                >
                                  {b}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Availability Status Footer & Book Button */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {statusBadge}
                        <Link
                          to="/book"
                          className={`px-4 py-2 bg-gradient-to-r ${palette.btn} text-white rounded-xl text-xs font-black transition-all shadow-md shadow-slate-900/10 hover:shadow-lg shrink-0 active:scale-95 flex items-center gap-1.5`}
                        >
                          Book 1:1 Class <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </section>

      {/* 6. Parent Reviews & Testimonials */}
      <section id="reviews" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-coral-500 via-amber-500 to-indigo-600 rounded-3xl p-1 shadow-2xl">
          <div className="bg-white rounded-[22px] p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-black text-coral-600 uppercase tracking-widest">Loved by 20,000+ Families</span>
              <h2 className="text-3xl font-black text-slate-900">What Parents & Students Say</h2>
              <div className="flex items-center justify-center gap-1 text-amber-500 pt-1">
                <span className="font-black text-slate-900 text-lg mr-2">4.98 / 5.0</span>
                {'★'.repeat(5)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-amber-500 text-sm">★★★★★</span>
                  <span className="text-[10px] font-bold text-slate-400">USA • 2 days ago</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  "My son built his very first playable Python game in just 30 minutes during the trial class. The mentor was patient and so encouraging!"
                </p>
                <div className="pt-2 border-t border-slate-200/60 font-bold text-xs text-slate-900">
                  — Jessica Miller (Parent of Ethan)
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-amber-500 text-sm">★★★★★</span>
                  <span className="text-[10px] font-bold text-slate-400">UK • 1 week ago</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  "The automatic timezone scheduling made booking seamless from London. My daughter loved the 1:1 math olympiad lesson!"
                </p>
                <div className="pt-2 border-t border-slate-200/60 font-bold text-xs text-slate-900">
                  — Priya Patel (Parent of Ananya)
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-amber-500 text-sm">★★★★★</span>
                  <span className="text-[10px] font-bold text-slate-400">India • 3 days ago</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  "I love that mentors are capped at 2 demo sessions per day. Our mentor Arjun was full of energy and gave 100% attention to my son."
                </p>
                <div className="pt-2 border-t border-slate-200/60 font-bold text-xs text-slate-900">
                  — Rajesh Sharma (Parent of Rohan)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Frequently Asked Questions (FAQ) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Clear & Transparent</h2>
            <p className="text-3xl font-black text-slate-900">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left font-extrabold text-sm text-slate-900 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                      {faq.q}
                    </span>
                    <span className="text-slate-400 font-mono text-lg">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
