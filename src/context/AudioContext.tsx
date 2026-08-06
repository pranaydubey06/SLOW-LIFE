import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Song } from '../types';

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  progressSec: number;
  durationSec: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  isModalOpen: boolean;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  pauseSong: () => void;
  seek: (timeSec: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  playNext: () => void;
  playPrevious: () => void;
  openModal: (song?: Song) => void;
  closeModal: () => void;
  songsList: Song[];
  setSongsList: (songs: Song[]) => void;
  analyser: AnalyserNode | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [songsList, setSongsList] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progressSec, setProgressSec] = useState<number>(0);
  const [durationSec, setDurationSec] = useState<number>(240);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const initAudioAnalyser = () => {
    if (audioContextRef.current || !audioRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 256; // 128 frequency bins, perfect resolution

      audioRef.current.crossOrigin = 'anonymous';

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyserNode);
      analyserNode.connect(ctx.destination);

      audioContextRef.current = ctx;
      sourceRef.current = source;
      setAnalyser(analyserNode);
    } catch (e) {
      console.warn('Could not initialize Web Audio Analyser:', e);
    }
  };

  const resumeAudioContext = async () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (err) {
        console.warn('Failed to resume audio context:', err);
      }
    }
  };

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.volume = volume;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setProgressSec(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDurationSec(audio.duration);
      }
    };

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        playNext();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  // Update volume
  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : vol;
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      const nextMute = !prev;
      if (audioRef.current) {
        audioRef.current.volume = nextMute ? 0 : volume;
      }
      return nextMute;
    });
  };

  const playSong = (song: Song) => {
    if (currentSong?.id === song.id && isPlaying) {
      return;
    }

    setCurrentSong(song);
    setIsPlaying(true);
    setProgressSec(0);
    setDurationSec(song.durationSec || 240);

    if (audioRef.current) {
      initAudioAnalyser();
      resumeAudioContext();

      const url = song.audioUrl || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-chill-112194.mp3';
      audioRef.current.src = url;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log('Audio playback prevented or restricted:', err);
        // Fallback simulation mode if browser restricts auto-play
        setIsPlaying(true);
      });
    }
  };

  const togglePlay = () => {
    if (!currentSong && songsList.length > 0) {
      playSong(songsList[0]);
      return;
    }

    if (!audioRef.current) return;

    initAudioAnalyser();
    resumeAudioContext();

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(true);
      });
    }
  };

  const pauseSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const seek = (timeSec: number) => {
    setProgressSec(timeSec);
    if (audioRef.current) {
      audioRef.current.currentTime = timeSec;
    }
  };

  const playNext = () => {
    if (!songsList || songsList.length === 0) return;
    if (!currentSong) {
      playSong(songsList[0]);
      return;
    }

    let nextIndex = 0;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * songsList.length);
    } else {
      const currentIndex = songsList.findIndex(s => s.id === currentSong.id);
      nextIndex = (currentIndex + 1) % songsList.length;
    }

    playSong(songsList[nextIndex]);
  };

  const playPrevious = () => {
    if (!songsList || songsList.length === 0) return;
    if (!currentSong) {
      playSong(songsList[0]);
      return;
    }

    const currentIndex = songsList.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songsList.length) % songsList.length;
    playSong(songsList[prevIndex]);
  };

  const toggleShuffle = () => setIsShuffle(prev => !prev);
  const toggleRepeat = () => setIsRepeat(prev => !prev);

  const openModal = (song?: Song) => {
    if (song) {
      if (currentSong?.id !== song.id) {
        playSong(song);
      }
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        progressSec,
        durationSec,
        volume,
        isMuted,
        isShuffle,
        isRepeat,
        isModalOpen,
        playSong,
        togglePlay,
        pauseSong,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        playNext,
        playPrevious,
        openModal,
        closeModal,
        songsList,
        setSongsList,
        analyser,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
