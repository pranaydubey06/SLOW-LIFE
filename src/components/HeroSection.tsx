import React, { useState, useEffect } from 'react';
import { Play, Instagram, Music, Heart, Disc, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteStats, Song } from '../types';
import { useAudio } from '../context/AudioContext';

interface HeroSectionProps {
  stats: SiteStats;
  featuredSong?: Song;
  songs?: Song[];
  onExploreClick: () => void;
  instagramHandle?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  stats,
  featuredSong,
  songs = [],
  onExploreClick,
  instagramHandle = 'pranayo6',
}) => {
  const { playSong, isPlaying, currentSong, togglePlay } = useAudio();

  // Playlist of cards to cycle through
  const playlist = songs.length > 0 ? songs : (featuredSong ? [featuredSong] : []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next (exit right, enter left), -1 = prev
  const [isPaused, setIsPaused] = useState(false);

  // Keep index within bounds
  useEffect(() => {
    if (currentIndex >= playlist.length && playlist.length > 0) {
      setCurrentIndex(0);
    }
  }, [playlist.length, currentIndex]);

  // 5-second automatic card rotation
  useEffect(() => {
    if (playlist.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [playlist.length, isPaused]);

  const activeHeroSong = playlist[currentIndex] || featuredSong;
  const backSong1 = playlist[(currentIndex + 1) % playlist.length] || activeHeroSong;
  const backSong2 = playlist[(currentIndex + 2) % playlist.length] || activeHeroSong;

  const isCurrentHeroPlaying = isPlaying && currentSong?.id === activeHeroSong?.id;

  const handleHeroPlay = (songToPlay?: Song) => {
    const target = songToPlay || activeHeroSong;
    if (target) {
      if (currentSong?.id === target.id) {
        togglePlay();
      } else {
        playSong(target);
      }
    }
  };

  const handleNextCard = () => {
    if (playlist.length > 0) {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  const handlePrevCard = () => {
    if (playlist.length > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    }
  };

  const handleDragEnd = (_event: any, info: any) => {
    const swipeThreshold = 80;
    if (info.offset.x > swipeThreshold) {
      handlePrevCard();
    } else if (info.offset.x < -swipeThreshold) {
      handleNextCard();
    }
  };

  // Card slide variants: exit to left, enter from right with luxurious rotation and scale
  const cardVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 320 : -320,
      opacity: 0,
      rotate: dir > 0 ? 12 : -12,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -320 : 320,
      opacity: 0,
      rotate: dir > 0 ? -12 : 12,
      scale: 0.9,
    }),
  };

  return (
    <section className="relative pt-6 pb-16 sm:pt-10 sm:pb-24 lg:pt-14 lg:pb-32 overflow-hidden bg-[#F7F7F5]">
      
      {/* Editorial Decorative Background Dotted Pattern */}
      <div className="absolute top-12 right-12 w-64 h-64 dotted-pattern opacity-40 pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-8 w-40 h-40 dotted-pattern-sm opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT SIDE — Editorial Hero Typography */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-[#ECECEC] text-xs font-semibold tracking-wider text-[#111111] uppercase shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#111111]" />
              <span>Personal Collection</span>
            </motion.div>

            {/* Giant Hero Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="space-y-2"
            >
              <h1 className="font-heading text-5xl sm:text-7xl lg:text-[96px] font-extrabold text-[#111111] leading-[0.92] tracking-tight">
                Music for <br />
                <span className="relative inline-block">
                  everyone.
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-[#DCC6A0]/60 -z-10"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                  >
                    <path d="M0,10 Q50,0 100,10" fill="none" stroke="currentColor" strokeWidth="8" />
                  </svg>
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base sm:text-lg lg:text-xl text-[#7A7A7A] max-w-xl font-normal leading-relaxed"
            >
              A personal collection of old songs, sad melodies, ghazals and timeless classics. Handpicked for late nights, quiet mornings, and wandering thoughts.
            </motion.p>

            {/* Call To Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <button
                onClick={onExploreClick}
                className="group flex items-center space-x-3 px-8 py-4 rounded-full bg-[#111111] text-white font-medium text-sm hover:bg-black transition-all transform active:scale-95 shadow-lg shadow-black/10"
              >
                <Play size={16} className="fill-white" />
                <span>Explore Songs</span>
              </button>

              <a
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2.5 px-6 py-4 rounded-full bg-white border border-[#ECECEC] text-[#111111] font-medium text-sm hover:bg-[#F3EFE8] transition-all shadow-sm"
              >
                <Instagram size={18} />
                <span>Visit Instagram</span>
              </a>
            </motion.div>

            {/* Statistics Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="pt-6 border-t border-[#ECECEC] grid grid-cols-3 gap-4 sm:gap-8 max-w-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-[#111111]">
                  <Music size={16} className="text-[#111111]" />
                  <span className="font-heading text-2xl sm:text-3xl font-bold">{stats.totalSongs}</span>
                </div>
                <p className="text-xs text-[#7A7A7A] font-medium">Total Songs</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-[#111111]">
                  <Heart size={16} className="text-rose-500 fill-rose-500" />
                  <span className="font-heading text-2xl sm:text-3xl font-bold">{stats.favoriteSongs}</span>
                </div>
                <p className="text-xs text-[#7A7A7A] font-medium">Favorite Songs</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-[#111111]">
                  <Disc size={16} className="text-[#111111]" />
                  <span className="font-heading text-2xl sm:text-3xl font-bold">{stats.spotifyLinks}</span>
                </div>
                <p className="text-xs text-[#7A7A7A] font-medium">Spotify Links</p>
              </div>
            </motion.div>

          </div>

          {/* RIGHT SIDE — Dynamic 5s Animated Floating Card Deck */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div
              className="relative w-full max-w-md mx-auto aspect-[4/5] sm:aspect-[3/4]"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              
              {/* Layer 1: Background Hidden Card 1 */}
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`back1-${backSong1?.id || '1'}`}
                  initial={{ rotate: -12, scale: 0.88, opacity: 0, x: -24, y: -16 }}
                  animate={{ rotate: -7, scale: 0.94, opacity: 0.75, x: -18, y: -12 }}
                  exit={{ opacity: 0, scale: 0.85, x: -10, y: -5 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                  className="absolute inset-0 rounded-[28px] overflow-hidden shadow-soft border border-[#ECECEC] bg-white"
                >
                  <img
                    src={backSong1?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'}
                    alt="Background card"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter grayscale contrast-125 opacity-70"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Layer 2: Background Hidden Card 2 */}
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`back2-${backSong2?.id || '2'}`}
                  initial={{ rotate: 12, scale: 0.88, opacity: 0, x: 26, y: 14 }}
                  animate={{ rotate: 8, scale: 0.95, opacity: 0.85, x: 20, y: 10 }}
                  exit={{ opacity: 0, scale: 0.85, x: 10, y: 5 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                  className="absolute inset-0 rounded-[28px] overflow-hidden shadow-soft border border-[#ECECEC] bg-white"
                >
                  <img
                    src={backSong2?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'}
                    alt="Background card 2"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter brightness-90"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Layer 3: Main Front Animated Card */}
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.div
                  key={`front-${activeHeroSong?.id || currentIndex}`}
                  custom={direction}
                  variants={cardVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.65}
                  onDragEnd={handleDragEnd}
                  whileHover={{ 
                    scale: 1.025, 
                    y: -6, 
                    rotate: 1, 
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12)",
                    transition: { type: 'spring', stiffness: 400, damping: 25 }
                  }}
                  whileTap={{ scale: 0.98, cursor: 'grabbing' }}
                  transition={{
                    x: { type: 'spring', stiffness: 300, damping: 26, mass: 0.8 },
                    opacity: { duration: 0.25 },
                    scale: { type: 'spring', stiffness: 300, damping: 26, mass: 0.8 },
                    rotate: { type: 'spring', stiffness: 300, damping: 26, mass: 0.8 },
                  }}
                  className="relative z-20 w-full h-full rounded-[32px] bg-white p-4 sm:p-5 shadow-float border border-[#ECECEC] flex flex-col justify-between group cursor-grab active:cursor-grabbing select-none"
                >
                  {/* Image Container with Floating Vinyl Soundwave Badge */}
                  <div className="relative w-full h-[62%] rounded-[24px] overflow-hidden bg-stone-100">
                    <img
                      src={activeHeroSong?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80'}
                      alt={activeHeroSong?.title || 'Featured Music'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Floating Vinyl Soundwave Badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center space-x-2 border border-white/40 shadow-sm z-10">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#111111] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#111111]" />
                      </span>
                      <span className="text-[10px] font-bold tracking-widest text-[#111111] uppercase font-heading">
                        NOW CURATING ({currentIndex + 1}/{playlist.length})
                      </span>
                    </div>

                    {/* Left/Right Navigation Arrows */}
                    {playlist.length > 1 && (
                      <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevCard();
                          }}
                          className="pointer-events-auto p-2.5 rounded-full bg-white/90 text-[#111111] hover:bg-white shadow-md transition-all transform active:scale-90"
                          aria-label="Previous card"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextCard();
                          }}
                          className="pointer-events-auto p-2.5 rounded-full bg-white/90 text-[#111111] hover:bg-white shadow-md transition-all transform active:scale-90"
                          aria-label="Next card"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    )}

                    {/* Play Overlay Button */}
                    <button
                      onClick={() => handleHeroPlay()}
                      className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/90 backdrop-blur-md text-[#111111] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-10"
                    >
                      {isCurrentHeroPlaying ? (
                        <span className="flex space-x-1 items-center h-5">
                          <span className="w-1 bg-[#111111] h-4 animate-bounce" />
                          <span className="w-1 bg-[#111111] h-6 animate-bounce delay-100" />
                          <span className="w-1 bg-[#111111] h-3 animate-bounce delay-200" />
                        </span>
                      ) : (
                        <Play size={24} className="fill-[#111111] ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Card Content Footer */}
                  <div className="pt-3 px-2 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-[#DCC6A0] uppercase tracking-wider font-heading">
                          {activeHeroSong?.category || 'Timeless Classic'}
                        </span>
                        <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#111111] line-clamp-1">
                          {activeHeroSong?.title || 'Lag Jaa Gale'}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#7A7A7A] font-medium">
                          {activeHeroSong?.artist || 'Lata Mangeshkar'}
                        </p>
                      </div>

                      <span className="text-xs text-[#7A7A7A] font-mono border border-[#ECECEC] px-2.5 py-1 rounded-full">
                        {activeHeroSong?.duration || '04:15'}
                      </span>
                    </div>

                    <p className="text-xs text-[#7A7A7A] line-clamp-2 pt-1 font-normal border-t border-[#ECECEC]/60">
                      {activeHeroSong?.description || 'A timeless melody capturing the essence of unforgettable moments.'}
                    </p>

                    {/* Clean Dot Indicators (No progress bar) */}
                    {playlist.length > 1 && (
                      <div className="pt-2 flex items-center justify-center space-x-1.5">
                        {playlist.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setDirection(idx > currentIndex ? 1 : -1);
                              setCurrentIndex(idx);
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              idx === currentIndex
                                ? 'w-6 bg-[#111111]'
                                : 'w-1.5 bg-[#ECECEC] hover:bg-[#7A7A7A]'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                </motion.div>
              </AnimatePresence>

              {/* Floating Decorative Dotted Tag */}
              <div className="absolute -bottom-6 -right-6 z-30 bg-[#111111] text-white px-4 py-2 rounded-2xl text-xs font-mono shadow-xl hidden sm:flex items-center space-x-2">
                <Sparkles size={14} className="text-[#DCC6A0]" />
                <span>SLOW LIFE COLLECTION #{String(currentIndex + 1).padStart(2, '0')}</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

