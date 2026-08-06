import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#ECECEC] py-12 sm:py-16 text-center">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center space-y-2">
        <div className="flex items-center space-x-2 text-xl sm:text-2xl font-heading font-semibold text-[#111111] tracking-wide">
          <span>Thank you</span>
          <Heart size={22} className="fill-rose-500 text-rose-500 animate-pulse inline-block" />
        </div>
      </div>
    </footer>
  );
};
