import React from 'react';

export const TeachingRobot: React.FC = () => {
  return (
    <div className="w-full relative mt-6 pt-2 pb-2 overflow-hidden select-none">
      
      {/* 1. COMPACT SMALL FIXED CODE MONITOR (STAYS STILL IN BACK-CENTER) */}
      <div className="w-full flex justify-center items-center relative z-0 mb-1">
        <div className="w-64 sm:w-80 rounded-2xl bg-slate-950/95 border border-slate-700/80 shadow-xl p-2.5 backdrop-blur-md space-y-1.5 relative overflow-hidden">
          {/* Ambient Inner Code Glow */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
          
          {/* Monitor Top Control Bar */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500/80" />
              <span className="w-2 h-2 rounded-full bg-amber-500/80" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
              <span className="text-[10px] text-slate-300 font-mono ml-1.5 font-bold tracking-tight truncate max-w-[140px]">
                1on1-studio.ts
              </span>
            </div>
            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-extrabold border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping inline-block" />
              CODE LIVE
            </span>
          </div>

          {/* Compact Code Display Screen */}
          <div className="font-mono text-[10px] leading-tight space-y-0.5 text-slate-300 bg-slate-900/90 p-2 rounded-lg border border-slate-800 shadow-inner">
            <p className="text-purple-400">
              <span className="text-amber-300 font-bold">async function</span> <span className="text-emerald-300 font-bold">start1on1</span>() &#123;
            </p>
            <p className="pl-3 text-slate-400">
              <span className="text-indigo-300 font-semibold">const</span> pace = <span className="text-cyan-300">await</span> aiEngine.getProfile();
            </p>
            <p className="pl-3 text-slate-400">
              <span className="text-indigo-300 font-semibold">const</span> mentor = <span className="text-cyan-300">await</span> pairMentor(&#123; pace &#125;);
            </p>
            <p className="pl-3 text-emerald-400 font-extrabold">
              return mentor.startLiveStudio(); <span className="text-slate-500">// 3x</span>
            </p>
            <p className="text-purple-400">&#125;</p>
          </div>
        </div>
      </div>

      {/* 2. Sleek Professional Laser Track Floor Line */}
      <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-700/80 relative shadow-lg overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-coral-500 via-emerald-400 to-amber-500 opacity-70 animate-pulse rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-marquee-rtl" />
      </div>

      {/* 3. Humanoid Robot Walking Container (WALKS IN FRONT OF SMALL MONITOR) */}
      <div className="relative h-44 w-full pt-3 -mt-3 shadow-none">
        <div className="absolute top-0 animate-robot-action-sequence flex flex-col items-center group cursor-pointer z-20">
          
          {/* Humanoid AI Mentor Display (w-40 h-40 = 160px) */}
          <div className="animate-robot-walk-bounce relative w-40 h-40 flex items-center justify-center">
            {/* Soft Ambient Core Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-coral-500/15 to-emerald-500/20 rounded-full blur-2xl animate-pulse pointer-events-none" />

            {/* High-Precision Humanoid Robot Vector */}
            <svg
              viewBox="0 0 100 100"
              className="w-40 h-40 relative z-10 drop-shadow-2xl"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Sleek Hair / Cybernetic Head Crown */}
              <path d="M 28 32 C 28 16, 72 16, 72 32 C 72 26, 60 20, 50 20 C 40 20, 28 26, 28 32 Z" fill="#1E1B4B" stroke="#4338CA" strokeWidth="1" />
              <path d="M 32 24 C 42 17, 58 17, 68 24" fill="#312E81" />

              {/* Humanoid Face Contour (Warm Synthetic Porcelain Skin Tone) */}
              <path d="M 30 30 C 30 20, 70 20, 70 30 L 70 50 C 70 60, 50 64, 50 64 C 50 64, 30 60, 30 50 Z" fill="url(#human-skin-grad)" stroke="#CBD5E1" strokeWidth="1.5" />

              {/* Humanoid Ears with Mini Tech Node */}
              <path d="M 27 38 C 24 38, 24 48, 27 48 Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1" />
              <path d="M 73 38 C 76 38, 76 48, 73 48 Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1" />
              <circle cx="26" cy="43" r="1.5" fill="#6366F1" />
              <circle cx="74" cy="43" r="1.5" fill="#6366F1" />

              {/* Humanoid Eyebrows */}
              <path d="M 36 34 Q 42 32 46 34" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 54 34 Q 58 32 64 34" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />

              {/* Stylish Smart AR Glasses Frame */}
              <rect x="33" y="36" width="15" height="10" rx="3" fill="#0F172A" fillOpacity="0.8" stroke="#6366F1" strokeWidth="1.2" />
              <rect x="52" y="36" width="15" height="10" rx="3" fill="#0F172A" fillOpacity="0.8" stroke="#6366F1" strokeWidth="1.2" />
              <line x1="48" y1="41" x2="52" y2="41" stroke="#6366F1" strokeWidth="1.5" />

              {/* Expressive Humanoid Eyes */}
              <circle cx="40.5" cy="41" r="3.5" fill="#0284C7" />
              <circle cx="59.5" cy="41" r="3.5" fill="#0284C7" />
              <circle cx="41.5" cy="40" r="1.2" fill="#FFFFFF" />
              <circle cx="60.5" cy="40" r="1.2" fill="#FFFFFF" />

              {/* Nose Contour */}
              <path d="M 50 43 L 48 48 L 52 48" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" fill="none" />

              {/* Friendly Human Smile */}
              <path d="M 42 53 Q 50 58 58 53" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* Humanoid Neck */}
              <rect x="44" y="62" width="12" height="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" rx="2" />

              {/* Professional Suit / Blazer Attire */}
              <path d="M 24 68 L 76 68 L 72 82 L 28 82 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
              
              {/* White Dress Shirt & Red/Coral Tie */}
              <polygon points="50,68 44,78 56,78" fill="#FFFFFF" />
              <polygon points="50,70 48,82 50,86 52,82" fill="#F43F5E" />

              {/* Suit Lapels */}
              <path d="M 24 68 L 42 78 L 38 82" stroke="#334155" strokeWidth="1.5" fill="none" />
              <path d="M 76 68 L 58 78 L 62 82" stroke="#334155" strokeWidth="1.5" fill="none" />

              {/* Left Arm holding Professional Smart Clipboard */}
              <g>
                <line x1="24" y1="72" x2="14" y2="68" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
                <line x1="14" y1="68" x2="8" y2="48" stroke="#F1F5F9" strokeWidth="3" strokeLinecap="round" />
                {/* Smart Clipboard */}
                <rect x="2" y="36" width="14" height="20" rx="2" fill="#334155" stroke="#6366F1" strokeWidth="1.2" />
                <rect x="4" y="40" width="10" height="14" rx="1" fill="#FFFFFF" />
                <line x1="6" y1="43" x2="12" y2="43" stroke="#475569" strokeWidth="1" />
                <line x1="6" y1="47" x2="12" y2="47" stroke="#475569" strokeWidth="1" />
                <line x1="6" y1="51" x2="10" y2="51" stroke="#10B981" strokeWidth="1" />
              </g>

              {/* Right Arm - Waving & Professional Handshake */}
              <g className="animate-robot-hand-shake" style={{ transformOrigin: '76px 72px' }}>
                <line x1="76" y1="72" x2="88" y2="62" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
                <circle cx="91" cy="59" r="4" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1" />
                <path d="M89 54 L94 59 M91 53 L96 58 M93 55 L98 60" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* LONGER HUMANOID LEGS (Extended length down to y=106) */}
              <g className="animate-robot-left-leg" style={{ transformOrigin: '37px 82px' }}>
                <rect x="32" y="82" width="11" height="22" rx="3" fill="#0F172A" stroke="#1E293B" strokeWidth="1" />
                <line x1="32" y1="93" x2="43" y2="93" stroke="#334155" strokeWidth="1" />
                {/* Shoe */}
                <path d="M 30 102 L 44 102 L 44 106 L 30 106 Z" fill="#020617" rx="1" />
              </g>
              <g className="animate-robot-right-leg" style={{ transformOrigin: '63px 82px' }}>
                <rect x="56" y="82" width="11" height="22" rx="3" fill="#0F172A" stroke="#1E293B" strokeWidth="1" />
                <line x1="56" y1="93" x2="67" y2="93" stroke="#334155" strokeWidth="1" />
                {/* Shoe */}
                <path d="M 54 102 L 68 102 L 68 106 L 54 106 Z" fill="#020617" rx="1" />
              </g>

              {/* Color Gradients */}
              <defs>
                <linearGradient id="human-skin-grad" x1="30" y1="20" x2="70" y2="64" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" />
                  <stop offset="0.7" stopColor="#F8FAFC" />
                  <stop offset="1" stopColor="#E2E8F0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
