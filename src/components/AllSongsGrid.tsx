import React from 'react';
import { Play, Pause, Disc, Heart, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Song } from '../types';
import { useAudio } from '../context/AudioContext';

interface AllSongsGridProps {
  songs: Song[];
  onToggleFavorite: (id: string) => void;
}

export const AllSongsGrid: React.FC<AllSongsGridProps> = ({ songs, onToggleFavorite }) => {
  const { playSong, isPlaying, currentSong, togglePlay, openModal } = useAudio();

  if (songs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#F3EFE8] flex items-center justify-center text-[#7A7A7A] mb-4">
          <Sparkles size={24} />
        </div>
        <h3 className="font-heading text-xl font-bold text-[#111111]">No songs found</h3>
        <p className="text-sm text-[#7A7A7A] mt-1 max-w-sm mx-auto">
          Try adjusting your search query or selecting a different category.
        </p>
      </div>
    );
  }

  return (
    <section className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Responsive Grid: 5 columns desktop, 3 columns tablet, 2 columns mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {songs.map((song, idx) => {
            const isThisPlaying = isPlaying && currentSong?.id === song.id;

            return (
              <motion.div
                key={song.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3) }}
                className="group relative bg-white rounded-[20px] p-2.5 sm:p-3 border border-[#ECECEC] shadow-sm hover:shadow-float transition-all duration-300 flex flex-col justify-between"
              >
                {/* Cover Image Container */}
                <div 
                  onClick={() => {
                    if (isThisPlaying) {
                      togglePlay();
                    } else {
                      playSong(song);
                    }
                  }}
                  className="relative aspect-square w-full rounded-[14px] overflow-hidden bg-stone-100 mb-2.5 cursor-pointer group/cover"
                >
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Favorite Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(song.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#111111] hover:bg-white active:scale-90 transition-all shadow-sm z-10"
                    title={song.isFavorite ? 'Remove favorite' : 'Add favorite'}
                  >
                    <Heart
                      size={15}
                      className={song.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-[#111111]'}
                    />
                  </button>

                  {/* Play Button Overlay: easily tappable and visible on mobile, slick hover effect on desktop */}
                  <div
                    className={`absolute inset-0 m-auto w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 z-10 ${
                      isThisPlaying
                        ? 'bg-white text-[#111111] scale-100 opacity-100'
                        : 'bg-white/90 text-[#111111] md:opacity-0 md:scale-90 md:group-hover/cover:opacity-100 md:group-hover/cover:scale-100'
                    }`}
                  >
                    {isThisPlaying ? (
                      <Pause size={18} className="fill-[#111111]" />
                    ) : (
                      <Play size={18} className="fill-[#111111] ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Info Text */}
                <div className="px-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#DCC6A0] uppercase tracking-wider font-heading">
                      {song.category}
                    </span>
                    <span className="text-[10px] text-[#7A7A7A] font-mono">{song.duration}</span>
                  </div>

                  <h4
                    onClick={() => openModal(song)}
                    className="font-heading text-sm sm:text-base font-bold text-[#111111] truncate cursor-pointer hover:text-[#7A7A7A] transition-colors"
                  >
                    {song.title}
                  </h4>

                  <p className="text-xs text-[#7A7A7A] truncate font-medium">{song.artist}</p>
                </div>

                {/* Minimal Footer Links */}
                <div className="pt-2 mt-2 border-t border-[#ECECEC]/60 flex items-center justify-between">
                  <button
                    onClick={() => openModal(song)}
                    className="text-[10px] sm:text-[11px] font-medium text-[#7A7A7A] hover:text-[#111111] transition-colors"
                  >
                    Listen & Details
                  </button>

                  {song.spotifyUrl && (
                    <a
                      href={song.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-full hover:bg-[#F3EFE8] text-[#111111] transition-colors"
                      title="Spotify"
                    >
                      <Disc size={14} />
                    </a>
                  )}
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
};
