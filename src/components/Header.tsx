import React, { useState } from 'react';
import { Instagram, Menu, X, Music, Heart, Info, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  instagramHandle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onNavigate,
  instagramHandle = 'pranayo6',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F7F7F5]/80 transition-all duration-300 border-b border-[#ECECEC]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <button
          onClick={() => handleNavClick('home')}
          className="group flex items-center space-x-2.5 text-left focus:outline-none"
        >
          <span className="font-heading tracking-[0.25em] text-xl sm:text-2xl font-bold text-[#111111] uppercase group-hover:opacity-80 transition-opacity">
            SLOW LIFE
          </span>
          <span className="w-2 h-2 rounded-full bg-[#DCC6A0] inline-block animate-pulse" />
        </button>

        {/* CENTER NAV LINKS (Desktop) */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative py-1 text-sm font-medium tracking-wide transition-colors ${
                  isActive ? 'text-[#111111]' : 'text-[#7A7A7A] hover:text-[#111111]'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111111] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="hidden sm:flex items-center space-x-3">
          {/* INSTAGRAM BUTTON */}
          <a
            href={`https://instagram.com/${instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 rounded-full border border-[#ECECEC] bg-white text-xs font-medium text-[#111111] hover:bg-[#F3EFE8] transition-all shadow-sm"
          >
            <Instagram size={14} className="text-[#111111]" />
            <span>Instagram</span>
            <ArrowUpRight size={12} className="text-[#7A7A7A]" />
          </a>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="flex sm:hidden items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-full border border-[#ECECEC] bg-white text-[#111111] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="sm:hidden border-b border-[#ECECEC] bg-[#FFFFFF] px-6 py-6 shadow-lg"
          >
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left text-lg font-heading font-medium transition-colors ${
                    activeSection === item.id ? 'text-[#111111] font-bold' : 'text-[#7A7A7A]'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <hr className="border-[#ECECEC] my-2" />

              <a
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-5 py-3 rounded-2xl bg-[#F7F7F5] border border-[#ECECEC] text-sm font-medium text-[#111111]"
              >
                <div className="flex items-center space-x-2.5">
                  <Instagram size={18} />
                  <span>Follow on Instagram</span>
                </div>
                <ArrowUpRight size={16} className="text-[#7A7A7A]" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
