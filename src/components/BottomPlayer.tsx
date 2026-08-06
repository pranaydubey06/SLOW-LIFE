import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Heart,
  Maximize2,
  Disc,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAudio } from '../context/AudioContext';

interface BottomPlayerProps {
  onToggleFavorite?: (id: string) => void;
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const BottomPlayer: React.FC<BottomPlayerProps> = ({ onToggleFavorite }) => {
  const {
    currentSong,
    isPlaying,
    progressSec,
    durationSec,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    playNext,
    playPrevious,
    openModal,
  } = useAudio();

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-3 sm:bottom-6 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="max-w-5xl mx-auto bg-white/95 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] sm:rounded-[28px] shadow-float pointer-events-auto relative overflow-hidden"
      >
        {/* Real-time Dynamic Progress Indicator at the top edge of the card */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-stone-100">
          <div
            className="h-full bg-[#C8B087] transition-all duration-300"
            style={{ width: `${(progressSec / (durationSec || 1)) * 100}%` }}
          />
        </div>

        {/* DESKTOP LAYOUT (md and up) */}
        <div className="hidden md:flex items-center justify-between p-4 gap-4">
          {/* LEFT: ALBUM COVER & SONG INFO */}
          <div className="flex items-center space-x-3 w-1/4 justify-start">
            <div
              onClick={() => openModal(currentSong)}
              className="group relative w-14 h-14 rounded-[16px] overflow-hidden bg-stone-100 flex-shrink-0 cursor-pointer shadow-sm"
            >
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 size={16} className="text-white" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h4
                onClick={() => openModal(currentSong)}
                className="font-heading text-sm sm:text-base font-bold text-[#111111] truncate cursor-pointer hover:underline"
              >
                {currentSong.title}
              </h4>
              <p className="text-xs text-[#7A7A7A] truncate font-medium">{currentSong.artist}</p>
            </div>

            {/* Heart Favorite Toggle Button */}
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(currentSong.id)}
                className="p-2 rounded-full text-[#111111] hover:bg-[#F3EFE8] transition-colors"
              >
                <Heart
                  size={18}
                  className={currentSong.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-[#111111]'}
                />
              </button>
            )}
          </div>

          {/* CENTER: PLAYBACK CONTROLS & PROGRESS */}
          <div className="flex-1 w-2/4 flex flex-col items-center space-y-1.5">
            {/* Controls buttons */}
            <div className="flex items-center space-x-6">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                className={`p-1.5 rounded-full transition-colors ${
                  isShuffle ? 'text-[#111111] font-bold bg-[#F3EFE8]' : 'text-[#7A7A7A] hover:text-[#111111]'
                }`}
                title="Shuffle"
              >
                <Shuffle size={16} />
              </button>

              {/* Previous */}
              <button
                onClick={playPrevious}
                className="p-1.5 text-[#111111] hover:opacity-75 transition-opacity"
                title="Previous song"
              >
                <SkipBack size={20} className="fill-[#111111]" />
              </button>

              {/* Play/Pause Main Button */}
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-[#111111] text-white flex items-center justify-center hover:bg-black transition-all transform active:scale-95 shadow-md"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause size={20} className="fill-white" />
                ) : (
                  <Play size={20} className="fill-white ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={playNext}
                className="p-1.5 text-[#111111] hover:opacity-75 transition-opacity"
                title="Next song"
              >
                <SkipForward size={20} className="fill-[#111111]" />
              </button>

              {/* Repeat */}
              <button
                onClick={toggleRepeat}
                className={`p-1.5 rounded-full transition-colors ${
                  isRepeat ? 'text-[#111111] font-bold bg-[#F3EFE8]' : 'text-[#7A7A7A] hover:text-[#111111]'
                }`}
                title="Repeat"
              >
                <Repeat size={16} />
              </button>
            </div>

            {/* Progress Bar with timestamps */}
            <div className="w-full flex items-center space-x-2 text-[11px] font-mono text-[#7A7A7A]">
              <span>{formatTime(progressSec)}</span>
              <input
                type="range"
                min={0}
                max={durationSec || 100}
                value={progressSec}
                onChange={(e) => seek(Number(e.target.value))}
                className="w-full h-1.5 bg-[#ECECEC] rounded-lg cursor-pointer accent-[#111111]"
              />
              <span>{formatTime(durationSec)}</span>
            </div>
          </div>

          {/* RIGHT: VOLUME & MODAL EXPAND */}
          <div className="flex items-center justify-end space-x-3 w-1/4">
            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <button onClick={toggleMute} className="text-[#111111] hover:opacity-75">
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-16 h-1 bg-[#ECECEC] rounded-lg cursor-pointer accent-[#111111]"
              />
            </div>

            {/* Spotify Direct Button */}
            {currentSong.spotifyUrl && (
              <a
                href={currentSong.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-[#F3EFE8] text-[#111111] transition-colors"
                title="Open on Spotify"
              >
                <Disc size={18} />
              </a>
            )}

            {/* Expand Modal */}
            <button
              onClick={() => openModal()}
              className="p-2 rounded-full border border-[#ECECEC] hover:bg-[#F3EFE8] text-[#111111] transition-colors"
              title="Expand Full Player Modal"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* MOBILE LAYOUT (less than md) */}
        <div className="flex md:hidden items-center justify-between p-3.5 pt-4">
          {/* Left Side: Clickable Artwork and Details to open PlayerModal */}
          <div
            onClick={() => openModal(currentSong)}
            className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-[12px] overflow-hidden bg-stone-100 flex-shrink-0 shadow-sm">
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-heading text-xs sm:text-sm font-bold text-[#111111] truncate">
                {currentSong.title}
              </h4>
              <p className="text-[10px] sm:text-xs text-[#7A7A7A] truncate font-medium">
                {currentSong.artist}
              </p>
            </div>
          </div>

          {/* Right Side: Interactive Play & Navigation Controls */}
          <div className="flex items-center space-x-1.5 flex-shrink-0 pl-2">
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(currentSong.id);
                }}
                className="p-2 text-[#111111] active:scale-90 transition-transform"
              >
                <Heart
                  size={18}
                  className={currentSong.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-[#111111]'}
                />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            >
              {isPlaying ? (
                <Pause size={16} className="fill-white" />
              ) : (
                <Play size={16} className="fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                playNext();
              }}
              className="p-2 text-[#111111] active:scale-90 transition-transform"
            >
              <SkipForward size={18} className="fill-[#111111]" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
