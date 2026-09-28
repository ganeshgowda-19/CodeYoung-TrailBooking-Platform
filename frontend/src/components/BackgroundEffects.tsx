import React from 'react';

export const BackgroundEffects: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Architectural Dot Grid Texture Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-25" />

      {/* Ambient Top Radiant Shimmer Gradient */}
      <div className="absolute top-0 inset-x-0 h-[32rem] bg-gradient-to-b from-indigo-100/60 via-purple-50/30 to-transparent pointer-events-none" />

      {/* Top-Left Indigo & Violet Animated Ambient Glow Orb */}
      <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl animate-float-slow" />

      {/* Middle-Right Warm Coral & Amber Glow Orb */}
      <div className="absolute top-1/3 -right-32 w-[36rem] h-[36rem] bg-gradient-to-bl from-coral-500/15 via-amber-500/10 to-transparent rounded-full blur-3xl animate-float-reverse" />

      {/* Bottom-Left Emerald & Teal Mint Aura */}
      <div className="absolute bottom-1/4 left-10 w-[30rem] h-[30rem] bg-gradient-to-tr from-emerald-500/12 via-teal-500/08 to-transparent rounded-full blur-3xl animate-pulse-subtle" />

      {/* Bottom Subtle Shimmer */}
      <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-slate-200/40 to-transparent" />
    </div>
  );
};
