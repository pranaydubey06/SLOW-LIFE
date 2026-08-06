import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Disc,
  Youtube,
  Share2,
  Heart,
  Sparkles,
  ExternalLink,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAudio } from '../context/AudioContext';
import { AudioVisualizer } from './AudioVisualizer';

interface PlayerModalProps {
  onToggleFavorite?: (id: string) => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({ onToggleFavorite }) => {
  const {
    currentSong,
    isPlaying,
    progressSec,
    durationSec,
    togglePlay,
    seek,
    isModalOpen,
    closeModal,
    playNext,
    playPrevious,
  } = useAudio();

  const [copied, setCopied] = useState(false);

  if (!isModalOpen || !currentSong) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${currentSong.title} - ${currentSong.artist}`,
        text: `Listen to ${currentSong.title} on SLOW LIFE`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-6">
        
        {/* Backdrop Close */}
        <div className="absolute inset-0" onClick={closeModal} />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative z-10 w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto bg-[#F7F7F5] border-t sm:border border-white/30 rounded-t-[28px] sm:rounded-[32px] shadow-2xl p-4 sm:p-8 space-y-4"
        >
          {/* Mobile Sheet Handle */}
          <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto sm:hidden mb-1" />

          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#ECECEC] text-[#111111] flex items-center justify-center hover:bg-[#F3EFE8] active:scale-95 transition-all z-20 shadow-xs cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* Header Badge */}
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#DCC6A0] uppercase font-heading tracking-widest pt-1 sm:pt-0">
            <Sparkles size={14} className="fill-[#DCC6A0]" />
            <span>NOW PLAYING</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-center">
            
            {/* Cover Image */}
            <div className="md:col-span-5 relative">
              <div className="aspect-square w-48 sm:w-60 md:w-full max-w-[240px] md:max-w-none mx-auto rounded-[20px] sm:rounded-[24px] overflow-hidden bg-stone-200 shadow-float relative group">
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover shadow-soft"
                />
              </div>
            </div>

            {/* Song Info & Controls */}
            <div className="md:col-span-7 space-y-4 sm:space-y-6">
              
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white border border-[#ECECEC] text-[#111111]">
                    {currentSong.category}
                  </span>

                  {onToggleFavorite && (
                    <button
                      onClick={() => onToggleFavorite(currentSong.id)}
                      className="p-2 rounded-full border border-[#ECECEC] bg-white hover:bg-[#F3EFE8] active:scale-90 transition-all cursor-pointer"
                      title={currentSong.isFavorite ? 'Remove Favorite' : 'Add Favorite'}
                    >
                      <Heart
                        size={18}
                        className={currentSong.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-[#111111]'}
                      />
                    </button>
                  )}
                </div>

                <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-[#111111] mt-2 sm:mt-3 leading-tight">
                  {currentSong.title}
                </h2>
                <p className="text-sm sm:text-base text-[#7A7A7A] font-medium mt-0.5">{currentSong.artist}</p>
              </div>

              {/* Visualizer */}
              <AudioVisualizer isPlaying={isPlaying} />

              {/* Progress Slider */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min={0}
                  max={durationSec || 100}
                  value={progressSec}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full h-2 bg-[#ECECEC] rounded-lg cursor-pointer accent-[#111111]"
                />
                <div className="flex justify-between text-xs font-mono text-[#7A7A7A]">
                  <span>{formatTime(progressSec)}</span>
                  <span>{formatTime(durationSec)}</span>
                </div>
              </div>

              {/* Main Playback Controls for Phone */}
              <div className="flex items-center justify-center sm:justify-start space-x-4 py-1">
                <button
                  onClick={playPrevious}
                  className="p-2.5 rounded-full bg-white border border-[#ECECEC] text-[#111111] hover:bg-[#F3EFE8] active:scale-90 transition-all cursor-pointer"
                  title="Previous song"
                >
                  <SkipBack size={20} className="fill-[#111111]" />
                </button>

                <button
                  onClick={togglePlay}
                  className="flex items-center space-x-2 px-7 py-3.5 rounded-full bg-[#111111] text-white font-semibold text-sm hover:bg-black active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause size={18} className="fill-white" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play size={18} className="fill-white ml-0.5" />
                      <span>Play Track</span>
                    </>
                  )}
                </button>

                <button
                  onClick={playNext}
                  className="p-2.5 rounded-full bg-white border border-[#ECECEC] text-[#111111] hover:bg-[#F3EFE8] active:scale-90 transition-all cursor-pointer"
                  title="Next song"
                >
                  <SkipForward size={20} className="fill-[#111111]" />
                </button>
              </div>

              {/* External Links & Share */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                {currentSong.spotifyUrl && (
                  <a
                    href={currentSong.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-full bg-white border border-[#ECECEC] text-[#111111] text-xs font-semibold hover:bg-[#F3EFE8] active:scale-95 transition-all"
                  >
                    <Disc size={15} />
                    <span>Spotify</span>
                    <ExternalLink size={11} className="text-[#7A7A7A]" />
                  </a>
                )}

                {currentSong.youtubeUrl && (
                  <a
                    href={currentSong.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-full bg-white border border-[#ECECEC] text-[#111111] text-xs font-semibold hover:bg-[#F3EFE8] active:scale-95 transition-all"
                  >
                    <Youtube size={15} className="text-red-600" />
                    <span>YouTube</span>
                    <ExternalLink size={11} className="text-[#7A7A7A]" />
                  </a>
                )}

                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-full bg-white border border-[#ECECEC] text-[#111111] text-xs font-semibold hover:bg-[#F3EFE8] active:scale-95 transition-all cursor-pointer"
                  title="Share link"
                >
                  {copied ? (
                    <>
                      <Check size={15} className="text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={15} />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
};

