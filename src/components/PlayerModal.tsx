import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  Disc,
  Youtube,
  Share2,
  Heart,
  Volume2,
  VolumeX,
  Sparkles,
  ExternalLink,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAudio } from '../context/AudioContext';
import { Song } from '../types';
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
  } = useAudio();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'embed'>('details');

  if (!isModalOpen || !currentSong) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Convert Spotify URL to embed if available
  const getSpotifyEmbedUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('open.spotify.com/track/')) {
      const trackId = url.split('/track/')[1]?.split('?')[0];
      return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
    }
    return null;
  };

  const spotifyEmbed = getSpotifyEmbedUrl(currentSong.spotifyUrl);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6">
        
        {/* Backdrop Close */}
        <div className="absolute inset-0" onClick={closeModal} />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative z-10 w-full max-w-3xl bg-[#F7F7F5] border border-white/20 rounded-[32px] overflow-hidden shadow-2xl p-6 sm:p-8"
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white border border-[#ECECEC] text-[#111111] flex items-center justify-center hover:bg-[#F3EFE8] transition-all z-20"
          >
            <X size={20} />
          </button>

          {/* Header Badge */}
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#DCC6A0] uppercase font-heading tracking-widest mb-6">
            <Sparkles size={14} className="fill-[#DCC6A0]" />
            <span>NOW PLAYING</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Large Artwork */}
            <div className="md:col-span-5 relative">
              <div className="aspect-square w-full rounded-[24px] overflow-hidden bg-stone-200 shadow-float relative group">
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover shadow-soft"
                />


              </div>
            </div>

            {/* Right Column: Details & Audio Player */}
            <div className="md:col-span-7 space-y-6">
              
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-white border border-[#ECECEC] text-[#111111]">
                    {currentSong.category}
                  </span>

                  {onToggleFavorite && (
                    <button
                      onClick={() => onToggleFavorite(currentSong.id)}
                      className="p-2 rounded-full border border-[#ECECEC] bg-white hover:bg-[#F3EFE8] transition-colors"
                    >
                      <Heart
                        size={18}
                        className={currentSong.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-[#111111]'}
                      />
                    </button>
                  )}
                </div>

                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#111111] mt-3">
                  {currentSong.title}
                </h2>
                <p className="text-base text-[#7A7A7A] font-medium">{currentSong.artist}</p>
              </div>

              {/* Dynamic Interactive Audio Visualizer */}
              <AudioVisualizer isPlaying={isPlaying} />

              {/* Progress Bar in Modal */}
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

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* Play / Pause Toggle */}
                <button
                  onClick={togglePlay}
                  className="flex items-center space-x-2 px-6 py-3 rounded-full bg-[#111111] text-white font-medium text-sm hover:bg-black transition-all shadow-md"
                >
                  {isPlaying ? (
                    <>
                      <Pause size={16} className="fill-white" />
                      <span>Pause Audio</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} className="fill-white" />
                      <span>Play Track</span>
                    </>
                  )}
                </button>

                {/* Spotify External Button */}
                {currentSong.spotifyUrl && (
                  <a
                    href={currentSong.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-5 py-3 rounded-full bg-white border border-[#ECECEC] text-[#111111] text-xs font-semibold hover:bg-[#F3EFE8] transition-all"
                  >
                    <Disc size={16} />
                    <span>Spotify</span>
                    <ExternalLink size={12} className="text-[#7A7A7A]" />
                  </a>
                )}

                {/* YouTube External Button */}
                {currentSong.youtubeUrl && (
                  <a
                    href={currentSong.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-5 py-3 rounded-full bg-white border border-[#ECECEC] text-[#111111] text-xs font-semibold hover:bg-[#F3EFE8] transition-all"
                  >
                    <Youtube size={16} className="text-red-600" />
                    <span>YouTube</span>
                    <ExternalLink size={12} className="text-[#7A7A7A]" />
                  </a>
                )}

                {/* Share Link */}
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-white border border-[#ECECEC] text-[#111111] hover:bg-[#F3EFE8] transition-all"
                  title="Share link"
                >
                  {copied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
                </button>
              </div>

            </div>

          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
};
