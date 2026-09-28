import React from 'react';

export const BrandLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return (
    <div className={`${className} rounded-2xl bg-gradient-to-tr from-coral-500 via-amber-500 to-indigo-500 p-0.5 shadow-lg transition-transform group-hover:scale-105 overflow-hidden ring-2 ring-white/10 shrink-0`}>
      <img src="/logo.jpeg" alt="CodeYoung Logo" className="w-full h-full object-cover rounded-[14px]" />
    </div>
  );
};
