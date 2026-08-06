import React, { useState } from 'react';
import { Instagram, Menu, X, Music, Heart, Info, ArrowUpRight, Share2, Check } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'SLOW LIFE | Music Collection',
      text: 'Listen to my curated SLOW LIFE music collection!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed, fallback to copy if needed
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
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

        {/* RIGHT ACTIONS (Desktop & Mobile buttons) */}
        <div className="hidden sm:flex items-center space-x-3">
          
          {/* INSTAGRAM BUTTON WITH ANIMATED BORDER */}
          <div className="relative group p-[1.5px] rounded-full overflow-hidden inline-flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#DCC6A0_0%,#111111_50%,#DCC6A0_100%)] opacity-80 group-hover:opacity-100 transition-opacity" />
            <a
              href={`https://instagram.com/${instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 flex items-center space-x-2 px-4 py-2 rounded-full bg-white text-xs font-semibold text-[#111111] hover:bg-[#F7F7F5] transition-all shadow-xs"
            >
              <Instagram size={14} className="text-[#111111]" />
              <span>Instagram</span>
              <ArrowUpRight size={12} className="text-[#7A7A7A]" />
            </a>
          </div>

          {/* SHARE BUTTON WITH ANIMATED BORDER */}
          <div className="relative group p-[1.5px] rounded-full overflow-hidden inline-flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
            <span className="absolute inset-[-1000%] animate-[spin_3.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#111111_0%,#DCC6A0_50%,#111111_100%)] opacity-80 group-hover:opacity-100 transition-opacity" />
            <button
              onClick={handleShare}
              className="relative z-10 flex items-center space-x-2 px-4 py-2 rounded-full bg-white text-xs font-semibold text-[#111111] hover:bg-[#F7F7F5] transition-all shadow-xs cursor-pointer"
              title="Share Website"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} className="text-[#111111]" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* MOBILE ACTIONS */}
        <div className="flex sm:hidden items-center space-x-2">
          {/* Mobile Quick Share Button */}
          <div className="relative group p-[1.5px] rounded-full overflow-hidden inline-flex items-center justify-center">
            <span className="absolute inset-[-1000%] animate-[spin_3.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#111111_0%,#DCC6A0_50%,#111111_100%)] opacity-90" />
            <button
              onClick={handleShare}
              className="relative z-10 p-2 rounded-full bg-white text-[#111111] flex items-center justify-center min-w-[36px] min-h-[36px]"
              aria-label="Share Website"
            >
              {copied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-full border border-[#ECECEC] bg-white text-[#111111] focus:outline-none min-w-[40px] min-h-[40px] flex items-center justify-center"
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

              <button
                onClick={handleShare}
                className="flex items-center justify-between px-5 py-3 rounded-2xl bg-[#111111] text-white text-sm font-medium"
              >
                <div className="flex items-center space-x-2.5">
                  <Share2 size={18} />
                  <span>{copied ? 'Link Copied to Clipboard!' : 'Share Website'}</span>
                </div>
                {copied ? <Check size={16} className="text-emerald-400" /> : <ArrowUpRight size={16} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

