import React, { useState, useRef } from 'react';
import {
  Shield,
  Lock,
  LayoutDashboard,
  Heart,
  Music,
  PlusCircle,
  Settings,
  LogOut,
  X,
  Trash2,
  Edit2,
  Check,
  Upload,
  Sparkles,
  Search,
  ExternalLink,
  Disc,
  FileAudio,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Song, SiteStats, AdminTab, SongCategory } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  songs: Song[];
  stats: SiteStats;
  onAddSong: (songData: Partial<Song>) => Promise<boolean>;
  onUpdateSong: (id: string, songData: Partial<Song>) => Promise<boolean>;
  onDeleteSong: (id: string) => Promise<boolean>;
  onUpdateStats: (statsData: Partial<SiteStats>) => Promise<boolean>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  songs,
  stats,
  onAddSong,
  onUpdateSong,
  onDeleteSong,
  onUpdateStats,
}) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Form states for Add / Edit Song
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [category, setCategory] = useState<SongCategory>('Hindi');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Audio & Image File Upload states
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  // Settings form states
  const [curatorNote, setCuratorNote] = useState(stats.curatorNote || '');
  const [instagramHandle, setInstagramHandle] = useState(stats.instagramHandle || 'pranayo6');

  // Search filter inside admin songs list
  const [adminSearch, setAdminSearch] = useState('');

  if (!isOpen) return null;

  // Actual dynamic statistics derived from the real songs list
  const totalSongsCount = songs.length;
  const favoriteSongsCount = songs.filter((s) => s.isFavorite).length;
  const spotifySongsCount = songs.filter((s) => !!s.spotifyUrl && s.spotifyUrl.trim().length > 0).length;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (_) {
        data = null;
      }

      if (res.ok && data?.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('slowlife_admin_token', data.token);
      } else {
        setAuthError(data?.message || 'Incorrect Admin Password');
      }
    } catch (err) {
      setAuthError('Connection failed. Please verify the backend is running.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('slowlife_admin_token');
    setPassword('');
  };

  const resetForm = () => {
    setEditingSongId(null);
    setTitle('');
    setArtist('');
    setCoverUrl('');
    setCategory('Hindi');
    setSpotifyUrl('');
    setYoutubeUrl('');
    setAudioUrl('');
    setDescription('');
    setIsFavorite(false);
    setMessage('');
    setAudioFileName(null);
  };

  const handleStartEdit = (song: Song) => {
    setEditingSongId(song.id);
    setTitle(song.title);
    setArtist(song.artist);
    setCoverUrl(song.coverUrl);
    setCategory(song.category);
    setSpotifyUrl(song.spotifyUrl || '');
    setYoutubeUrl(song.youtubeUrl || '');
    setAudioUrl(song.audioUrl || '');
    setDescription(song.description || '');
    setIsFavorite(song.isFavorite);
    setAudioFileName(null);
    setActiveTab('add');
  };

  // Handle Phone Audio File Picker
  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Auto-fill song title if empty
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
    }

    setAudioFileName(file.name);
    setIsUploadingAudio(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAudioUrl(result);
      setIsUploadingAudio(false);
    };
    reader.onerror = () => {
      setIsUploadingAudio(false);
      setMessage('Failed to load audio file');
    };
    reader.readAsDataURL(file);
  };

  // Handle Phone Cover Image File Picker
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCoverUrl(result);
      setIsUploadingImage(false);
    };
    reader.onerror = () => {
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage('Song title is required');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const songData: Partial<Song> = {
        title: title.trim(),
        artist: artist.trim() || 'Curator Track',
        coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        category,
        spotifyUrl: spotifyUrl.trim(),
        youtubeUrl: youtubeUrl.trim(),
        audioUrl: audioUrl.trim() || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-chill-112194.mp3',
        description: description.trim(),
        isFavorite,
      };

      let ok = false;
      if (editingSongId) {
        ok = await onUpdateSong(editingSongId, songData);
        setMessage(ok ? 'Song updated successfully!' : 'Failed to update song');
      } else {
        ok = await onAddSong(songData);
        setMessage(ok ? 'New song added successfully!' : 'Failed to add song');
      }

      if (ok) {
        setTimeout(() => {
          resetForm();
          setActiveTab('songs');
        }, 1000);
      }
    } catch (err) {
      setMessage('Error saving song');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdateStats({ curatorNote, instagramHandle });
      setMessage('Settings updated!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Error saving settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(adminSearch.toLowerCase()) ||
      s.artist.toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
        
        <div className="relative w-full max-w-5xl bg-[#F7F7F5] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/20 h-[92vh] sm:h-auto sm:max-h-[88vh] flex flex-col">
          
          {/* HEADER BAR (MOBILE & DESKTOP) */}
          <div className="sticky top-0 z-30 bg-white border-b border-[#ECECEC] px-4 py-3 sm:px-6 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center">
                <Shield size={16} />
              </div>
              <div>
                <h3 className="font-heading text-sm sm:text-base font-bold text-[#111111]">Curator Studio</h3>
                <p className="text-[10px] text-[#7A7A7A] uppercase tracking-wider font-mono">Mobile Admin Panel</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition-all flex items-center space-x-1"
                  title="Logout"
                >
                  <LogOut size={13} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-[#F7F7F5] text-[#111111] hover:bg-[#ECECEC] transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* UNAUTHENTICATED: LOGIN SCREEN */}
          {!isAuthenticated ? (
            <div className="w-full p-6 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 my-auto overflow-y-auto">
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#ECECEC] flex items-center justify-center text-[#111111] shadow-md">
                <Lock size={28} />
              </div>

              <div className="space-y-2 max-w-sm">
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#111111]">
                  Admin Login
                </h2>
                <p className="text-xs text-[#7A7A7A]">
                  Enter your admin password to manage songs, upload tracks, and update settings directly from your phone.
                </p>
              </div>

              <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Admin Password..."
                  className="w-full px-5 py-3.5 rounded-2xl bg-white border border-[#ECECEC] text-base sm:text-sm text-[#111111] focus:outline-none focus:border-[#111111] shadow-xs"
                  required
                />

                {authError && <p className="text-xs text-rose-500 font-medium">{authError}</p>}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-4 rounded-2xl bg-[#111111] text-white text-sm font-semibold hover:bg-black transition-all shadow-md active:scale-98"
                >
                  {isLoggingIn ? 'Verifying...' : 'Unlock Mobile Studio'}
                </button>
              </form>
            </div>
          ) : (
            /* AUTHENTICATED: ADMIN DASHBOARD LAYOUT */
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              
              {/* HORIZONTAL MOBILE NAVIGATION TAB BAR */}
              <div className="bg-white border-b border-[#ECECEC] px-3 py-2 overflow-x-auto no-scrollbar flex items-center space-x-1.5 flex-shrink-0">
                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab('dashboard');
                  }}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all min-h-[40px] ${
                    activeTab === 'dashboard'
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'text-[#7A7A7A] hover:bg-[#F3EFE8] hover:text-[#111111]'
                  }`}
                >
                  <LayoutDashboard size={14} />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab('songs');
                  }}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all min-h-[40px] ${
                    activeTab === 'songs'
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'text-[#7A7A7A] hover:bg-[#F3EFE8] hover:text-[#111111]'
                  }`}
                >
                  <Music size={14} />
                  <span>All Songs ({totalSongsCount})</span>
                </button>

                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab('add');
                  }}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all min-h-[40px] ${
                    activeTab === 'add'
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  }`}
                >
                  <PlusCircle size={14} />
                  <span>{editingSongId ? 'Edit Song' : 'Upload Song'}</span>
                </button>

                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab('favorites');
                  }}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all min-h-[40px] ${
                    activeTab === 'favorites'
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'text-[#7A7A7A] hover:bg-[#F3EFE8] hover:text-[#111111]'
                  }`}
                >
                  <Heart size={14} />
                  <span>Favorites ({favoriteSongsCount})</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all min-h-[40px] ${
                    activeTab === 'settings'
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'text-[#7A7A7A] hover:bg-[#F3EFE8] hover:text-[#111111]'
                  }`}
                >
                  <Settings size={14} />
                  <span>Settings</span>
                </button>
              </div>

              {/* MAIN TAB CONTENT SCROLLABLE AREA */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
                
                {/* TAB 1: DASHBOARD OVERVIEW */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#111111]">
                        Curator Overview
                      </h2>
                      <p className="text-xs text-[#7A7A7A]">
                        Live dynamic stats of your music library.
                      </p>
                    </div>

                    {/* DYNAMIC STAT CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ECECEC] flex items-center justify-between shadow-xs">
                        <div>
                          <span className="text-xs text-[#7A7A7A] font-medium block">Total Songs</span>
                          <p className="font-heading text-2xl sm:text-3xl font-extrabold text-[#111111] mt-0.5">
                            {totalSongsCount}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#F7F7F5] flex items-center justify-center text-[#111111]">
                          <Music size={20} />
                        </div>
                      </div>

                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ECECEC] flex items-center justify-between shadow-xs">
                        <div>
                          <span className="text-xs text-[#7A7A7A] font-medium block">Top Favorites</span>
                          <p className="font-heading text-2xl sm:text-3xl font-extrabold text-[#111111] mt-0.5">
                            {favoriteSongsCount}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                          <Heart size={20} className="fill-rose-500" />
                        </div>
                      </div>

                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ECECEC] flex items-center justify-between shadow-xs">
                        <div>
                          <span className="text-xs text-[#7A7A7A] font-medium block">Spotify Tracks</span>
                          <p className="font-heading text-2xl sm:text-3xl font-extrabold text-[#111111] mt-0.5">
                            {spotifySongsCount}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <Disc size={20} />
                        </div>
                      </div>
                    </div>

                    {/* Quick Upload Banner */}
                    <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                      <div className="space-y-1">
                        <h4 className="font-heading text-sm sm:text-base font-bold text-[#111111]">
                          Upload a track from your phone
                        </h4>
                        <p className="text-xs text-[#7A7A7A]">
                          Upload audio files directly or add Spotify links & cover image.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          resetForm();
                          setActiveTab('add');
                        }}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-black transition-all flex items-center justify-center space-x-2"
                      >
                        <PlusCircle size={16} />
                        <span>Upload Song Now</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: FAVORITE SONGS MANAGEMENT */}
                {activeTab === 'favorites' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#111111]">
                        Favorite Songs ({favoriteSongsCount})
                      </h2>
                      <p className="text-xs text-[#7A7A7A]">
                        Toggle favorites to feature your top defining tracks on the homepage hero banner.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {songs.map((song) => (
                        <div
                          key={song.id}
                          className="bg-white p-3 rounded-2xl border border-[#ECECEC] flex items-center justify-between gap-2 hover:border-[#111111] transition-all"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <img
                              src={song.coverUrl}
                              alt={song.title}
                              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="font-heading text-xs sm:text-sm font-bold text-[#111111] truncate">{song.title}</h4>
                              <p className="text-[11px] text-[#7A7A7A] truncate">{song.artist} • {song.category}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => onUpdateSong(song.id, { isFavorite: !song.isFavorite })}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all flex-shrink-0 ${
                              song.isFavorite
                                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                : 'bg-[#F7F7F5] text-[#7A7A7A] border border-[#ECECEC] hover:text-[#111111]'
                            }`}
                          >
                            <Heart size={14} className={song.isFavorite ? 'fill-rose-500' : ''} />
                            <span className="hidden sm:inline">{song.isFavorite ? 'Favorite' : 'Make Favorite'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: ALL SONGS LIST & ACTIONS */}
                {activeTab === 'songs' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#111111]">
                          All Songs ({totalSongsCount})
                        </h2>
                        <p className="text-xs text-[#7A7A7A]">Manage and edit your music collection.</p>
                      </div>

                      <button
                        onClick={() => {
                          resetForm();
                          setActiveTab('add');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-black transition-all flex items-center space-x-1.5"
                      >
                        <PlusCircle size={14} />
                        <span>Add Song</span>
                      </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                      <Search size={16} className="absolute left-3.5 top-3.5 text-[#7A7A7A]" />
                      <input
                        type="text"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        placeholder="Search song title or artist..."
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-[#ECECEC] text-base sm:text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                    </div>

                    <div className="space-y-2">
                      {filteredSongs.map((song) => (
                        <div
                          key={song.id}
                          className="bg-white p-3 rounded-2xl border border-[#ECECEC] flex items-center justify-between gap-2 hover:bg-[#F7F7F5] transition-all"
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <img
                              src={song.coverUrl}
                              alt={song.title}
                              className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="font-heading text-xs sm:text-sm font-bold text-[#111111] truncate">{song.title}</h4>
                              <p className="text-[11px] text-[#7A7A7A] truncate">{song.artist} • {song.category}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            <button
                              onClick={() => handleStartEdit(song)}
                              className="p-2.5 rounded-xl border border-[#ECECEC] bg-white text-[#111111] hover:bg-[#F3EFE8] min-w-[38px] min-h-[38px] flex items-center justify-center"
                              title="Edit"
                            >
                              <Edit2 size={15} />
                            </button>

                            <button
                              onClick={() => onDeleteSong(song.id)}
                              className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 min-w-[38px] min-h-[38px] flex items-center justify-center"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: ADD / EDIT SONG FORM (STREAMLINED FOR PHONE) */}
                {activeTab === 'add' && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#111111]">
                        {editingSongId ? 'Edit Song' : 'Upload New Song'}
                      </h2>
                      <p className="text-xs text-[#7A7A7A]">
                        Easily upload audio files or enter Spotify links from your mobile device.
                      </p>
                    </div>

                    {message && (
                      <div className="p-3.5 rounded-2xl bg-[#DCC6A0]/20 border border-[#DCC6A0] text-xs font-medium text-[#111111] flex items-center space-x-2">
                        <CheckCircle2 size={16} className="text-[#111111]" />
                        <span>{message}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveSong} className="space-y-4">
                      
                      {/* 1. SONG TITLE */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#111111] flex items-center justify-between">
                          <span>Song Title *</span>
                          <span className="text-[10px] text-[#7A7A7A]">Required</span>
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Lag Jaa Gale"
                          required
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#ECECEC] text-base sm:text-xs text-[#111111] focus:outline-none focus:border-[#111111] shadow-xs"
                        />
                      </div>

                      {/* 2. UPLOAD AUDIO SONG (FROM PHONE/FILE) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#111111] flex items-center justify-between">
                          <span>Upload Song (Audio File)</span>
                          <span className="text-[10px] text-amber-700 font-semibold">Select from Phone Storage</span>
                        </label>

                        <input
                          type="file"
                          ref={audioFileInputRef}
                          accept="audio/*"
                          onChange={handleAudioFileSelect}
                          className="hidden"
                        />

                        <div className="flex flex-col sm:flex-row items-stretch gap-2">
                          <button
                            type="button"
                            onClick={() => audioFileInputRef.current?.click()}
                            className="flex-1 py-3.5 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center space-x-2 transition-all active:scale-98"
                          >
                            <FileAudio size={18} />
                            <span>{isUploadingAudio ? 'Processing Audio...' : audioFileName ? `Selected: ${audioFileName}` : 'Choose Audio File from Phone'}</span>
                          </button>

                          {(audioUrl || audioFileName) && (
                            <button
                              type="button"
                              onClick={() => {
                                setAudioUrl('');
                                setAudioFileName(null);
                                if (audioFileInputRef.current) audioFileInputRef.current.value = '';
                              }}
                              className="py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                              title="Remove audio file"
                            >
                              <Trash2 size={16} />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="pt-1">
                          <input
                            type="text"
                            value={audioUrl}
                            onChange={(e) => setAudioUrl(e.target.value)}
                            placeholder="Or paste Direct MP3 / Audio Stream URL"
                            className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#ECECEC] text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                          />
                        </div>
                      </div>

                      {/* 3. COVER IMAGE (URL OR PHONE GALLERY) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#111111] flex items-center justify-between">
                          <span>Cover Image</span>
                          <span className="text-[10px] text-[#7A7A7A]">Gallery / URL</span>
                        </label>

                        <input
                          type="file"
                          ref={imageFileInputRef}
                          accept="image/*"
                          onChange={handleImageFileSelect}
                          className="hidden"
                        />

                        <div className="flex items-center space-x-3">
                          {coverUrl ? (
                            <img
                              src={coverUrl}
                              alt="Cover preview"
                              className="w-14 h-14 rounded-2xl object-cover border border-[#ECECEC] flex-shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-white border border-dashed border-[#ECECEC] flex items-center justify-center text-[#7A7A7A] flex-shrink-0">
                              <ImageIcon size={20} />
                            </div>
                          )}

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => imageFileInputRef.current?.click()}
                                className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-[#F3EFE8] border border-[#ECECEC] text-xs font-semibold text-[#111111] flex items-center justify-center space-x-1.5"
                              >
                                <Upload size={14} />
                                <span>{isUploadingImage ? 'Uploading...' : 'Pick Cover Photo'}</span>
                              </button>

                              {coverUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCoverUrl('');
                                    if (imageFileInputRef.current) imageFileInputRef.current.value = '';
                                  }}
                                  className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center space-x-1 transition-all"
                                  title="Remove cover photo"
                                >
                                  <Trash2 size={14} />
                                  <span>Remove</span>
                                </button>
                              )}
                            </div>

                            <input
                              type="text"
                              value={coverUrl}
                              onChange={(e) => setCoverUrl(e.target.value)}
                              placeholder="Or paste Cover Image URL"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#ECECEC] text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 4. SPOTIFY SONG LINK */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#111111]">Spotify Song Link</label>
                        <input
                          type="text"
                          value={spotifyUrl}
                          onChange={(e) => setSpotifyUrl(e.target.value)}
                          placeholder="https://open.spotify.com/track/..."
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#ECECEC] text-base sm:text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                        />
                      </div>

                      {/* ARTIST & CATEGORY (OPTIONAL / DEFAULTS) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#111111]">Artist Name</label>
                          <input
                            type="text"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            placeholder="e.g. Lata Mangeshkar"
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#ECECEC] text-xs focus:outline-none focus:border-[#111111]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#111111]">Category</label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as SongCategory)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#ECECEC] text-xs focus:outline-none focus:border-[#111111]"
                          >
                            <option value="Hindi">Hindi</option>
                            <option value="Old">Old</option>
                            <option value="Sad">Sad</option>
                            <option value="Ghazal">Ghazal</option>
                            <option value="Romantic">Romantic</option>
                            <option value="Bengali">Bengali</option>
                            <option value="Classics">Classics</option>
                          </select>
                        </div>
                      </div>

                      {/* 5. MARK AS FEATURED FAVORITE SONG TOGGLE */}
                      <div
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          isFavorite
                            ? 'bg-rose-50/80 border-rose-200'
                            : 'bg-white border-[#ECECEC]'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className={`p-2 rounded-xl ${isFavorite ? 'bg-rose-500 text-white' : 'bg-[#F7F7F5] text-[#7A7A7A]'}`}>
                            <Heart size={16} className={isFavorite ? 'fill-white' : ''} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#111111] block">Mark as Featured Favorite Song</span>
                            <span className="text-[10px] text-[#7A7A7A]">Displays song on the homepage hero spotlight</span>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={isFavorite}
                          onChange={(e) => setIsFavorite(e.target.checked)}
                          className="w-5 h-5 rounded text-[#111111] focus:ring-[#111111]"
                        />
                      </div>

                      {/* SUBMIT ACTIONS */}
                      <div className="pt-2 flex items-center space-x-3">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 py-4 rounded-2xl bg-[#111111] text-white text-xs font-bold hover:bg-black transition-all shadow-md active:scale-98"
                        >
                          {isSubmitting ? 'Saving Song...' : editingSongId ? 'Update Song' : 'Save & Publish Song'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            resetForm();
                            setActiveTab('songs');
                          }}
                          className="px-5 py-4 rounded-2xl border border-[#ECECEC] text-xs font-semibold hover:bg-[#F3EFE8]"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* TAB 5: SETTINGS */}
                {activeTab === 'settings' && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#111111]">Curator Settings</h2>
                      <p className="text-xs text-[#7A7A7A]">
                        Update curator diary note and Instagram handle.
                      </p>
                    </div>

                    {message && (
                      <div className="p-3 rounded-xl bg-[#DCC6A0]/20 border border-[#DCC6A0] text-xs font-medium text-[#111111]">
                        {message}
                      </div>
                    )}

                    <form onSubmit={handleSaveSettings} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#111111]">Instagram Handle</label>
                        <input
                          type="text"
                          value={instagramHandle}
                          onChange={(e) => setInstagramHandle(e.target.value)}
                          placeholder="e.g. pranayo6"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#ECECEC] text-base sm:text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#111111]">Curator Bio / Note</label>
                        <textarea
                          value={curatorNote}
                          onChange={(e) => setCuratorNote(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#ECECEC] text-base sm:text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#111111] text-white text-xs font-bold hover:bg-black transition-all"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Curator Settings'}
                      </button>
                    </form>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>

      </div>
    </AnimatePresence>
  );
};
