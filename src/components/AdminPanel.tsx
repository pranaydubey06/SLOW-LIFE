import React, { useState } from 'react';
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

  // Settings form states
  const [curatorNote, setCuratorNote] = useState(stats.curatorNote || '');
  const [instagramHandle, setInstagramHandle] = useState(stats.instagramHandle || 'pranayo6');

  // Search filter inside admin songs list
  const [adminSearch, setAdminSearch] = useState('');

  if (!isOpen) return null;

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
    setActiveTab('add');
  };

  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const songData: Partial<Song> = {
        title,
        artist,
        coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        category,
        spotifyUrl,
        youtubeUrl,
        audioUrl,
        description,
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
        }, 1200);
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
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
        
        <div className="relative w-full max-w-5xl bg-[#F7F7F5] rounded-[28px] overflow-hidden shadow-2xl border border-white/20 min-h-[600px] flex flex-col md:flex-row">
          
          {/* Close Window */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/80 text-[#111111] hover:bg-white shadow-sm transition-all"
          >
            <X size={20} />
          </button>

          {/* UNAUTHENTICATED: LOGIN SCREEN */}
          {!isAuthenticated ? (
            <div className="w-full p-8 sm:p-14 flex flex-col items-center justify-center text-center space-y-6 my-auto">
              <div className="w-16 h-16 rounded-full bg-white border border-[#ECECEC] flex items-center justify-center text-[#111111] shadow-soft">
                <Lock size={28} />
              </div>

              <div className="space-y-2 max-w-sm">
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#111111]">
                  SLOW LIFE Admin
                </h2>
                <p className="text-xs text-[#7A7A7A]">
                  Enter your admin password to manage songs, favorites, and curator notes.
                </p>
              </div>

              <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Admin Password..."
                  className="w-full px-5 py-3.5 rounded-2xl bg-white border border-[#ECECEC] text-sm text-[#111111] focus:outline-none focus:border-[#111111] shadow-sm"
                  required
                />

                {authError && <p className="text-xs text-rose-500 font-medium">{authError}</p>}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 rounded-2xl bg-[#111111] text-white text-sm font-semibold hover:bg-black transition-all shadow-md"
                >
                  {isLoggingIn ? 'Verifying...' : 'Unlock Dashboard'}
                </button>
              </form>
            </div>
          ) : (
            /* AUTHENTICATED: ADMIN DASHBOARD LAYOUT */
            <>
              {/* SIDEBAR NAVIGATION */}
              <div className="w-full md:w-64 bg-white border-r border-[#ECECEC] p-6 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Brand Header */}
                  <div className="flex items-center space-x-2.5 pb-4 border-b border-[#ECECEC]">
                    <Shield size={20} className="text-[#111111]" />
                    <div>
                      <h3 className="font-heading text-base font-bold text-[#111111]">Curator Studio</h3>
                      <p className="text-[10px] text-[#7A7A7A] uppercase tracking-wider font-mono">SLOW LIFE v1.0</p>
                    </div>
                  </div>

                  {/* Nav Links */}
                  <nav className="space-y-1.5">
                    <button
                      onClick={() => {
                        resetForm();
                        setActiveTab('dashboard');
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                        activeTab === 'dashboard'
                          ? 'bg-[#111111] text-white'
                          : 'text-[#7A7A7A] hover:bg-[#F3EFE8] hover:text-[#111111]'
                      }`}
                    >
                      <LayoutDashboard size={16} />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        resetForm();
                        setActiveTab('favorites');
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                        activeTab === 'favorites'
                          ? 'bg-[#111111] text-white'
                          : 'text-[#7A7A7A] hover:bg-[#F3EFE8] hover:text-[#111111]'
                      }`}
                    >
                      <Heart size={16} />
                      <span>Favorite Songs ({stats.favoriteSongs})</span>
                    </button>

                    <button
                      onClick={() => {
                        resetForm();
                        setActiveTab('songs');
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                        activeTab === 'songs'
                          ? 'bg-[#111111] text-white'
                          : 'text-[#7A7A7A] hover:bg-[#F3EFE8] hover:text-[#111111]'
                      }`}
                    >
                      <Music size={16} />
                      <span>All Songs ({songs.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        resetForm();
                        setActiveTab('add');
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                        activeTab === 'add'
                          ? 'bg-[#111111] text-white'
                          : 'text-[#7A7A7A] hover:bg-[#F3EFE8] hover:text-[#111111]'
                      }`}
                    >
                      <PlusCircle size={16} />
                      <span>{editingSongId ? 'Edit Song' : 'Upload New Song'}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                        activeTab === 'settings'
                          ? 'bg-[#111111] text-white'
                          : 'text-[#7A7A7A] hover:bg-[#F3EFE8] hover:text-[#111111]'
                      }`}
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                  </nav>
                </div>

                {/* Logout Action */}
                <div className="pt-6 border-t border-[#ECECEC]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all"
                  >
                    <LogOut size={16} />
                    <span>Logout Admin</span>
                  </button>
                </div>
              </div>

              {/* MAIN CONTENT AREA */}
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-h-[80vh]">
                
                {/* TAB 1: DASHBOARD OVERVIEW */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-heading text-2xl font-bold text-[#111111]">
                        Welcome back, Curator
                      </h2>
                      <p className="text-xs text-[#7A7A7A]">
                        Overview of your personal SLOW LIFE collection metrics.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] space-y-1 shadow-sm">
                        <span className="text-xs text-[#7A7A7A] font-medium">Total Songs</span>
                        <p className="font-heading text-3xl font-extrabold text-[#111111]">{stats.totalSongs}</p>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] space-y-1 shadow-sm">
                        <span className="text-xs text-[#7A7A7A] font-medium">Top Favorites</span>
                        <p className="font-heading text-3xl font-extrabold text-[#111111]">{stats.favoriteSongs}</p>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] space-y-1 shadow-sm">
                        <span className="text-xs text-[#7A7A7A] font-medium">Spotify Tracks</span>
                        <p className="font-heading text-3xl font-extrabold text-[#111111]">{stats.spotifyLinks}</p>
                      </div>
                    </div>

                    {/* Quick Add Action Banner */}
                    <div className="bg-white p-6 rounded-2xl border border-[#ECECEC] flex items-center justify-between shadow-sm">
                      <div className="space-y-1">
                        <h4 className="font-heading text-base font-bold text-[#111111]">
                          Add a new song to your collection
                        </h4>
                        <p className="text-xs text-[#7A7A7A]">
                          Include Spotify / YouTube links and custom cover art.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          resetForm();
                          setActiveTab('add');
                        }}
                        className="px-5 py-2.5 rounded-full bg-[#111111] text-white text-xs font-semibold hover:bg-black transition-all flex items-center space-x-2"
                      >
                        <PlusCircle size={14} />
                        <span>Upload Track</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: FAVORITE SONGS MANAGEMENT */}
                {activeTab === 'favorites' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-heading text-2xl font-bold text-[#111111]">
                        Favorite Songs (Exactly 5)
                      </h2>
                      <p className="text-xs text-[#7A7A7A]">
                        Toggle favorites to feature your top 5 defining melodies on the homepage hero section.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {songs.map((song) => (
                        <div
                          key={song.id}
                          className="bg-white p-3.5 rounded-2xl border border-[#ECECEC] flex items-center justify-between hover:border-[#111111] transition-all"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={song.coverUrl}
                              alt={song.title}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                            <div>
                              <h4 className="font-heading text-sm font-bold text-[#111111]">{song.title}</h4>
                              <p className="text-xs text-[#7A7A7A]">{song.artist} • {song.category}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => onUpdateSong(song.id, { isFavorite: !song.isFavorite })}
                            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                              song.isFavorite
                                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                : 'bg-[#F7F7F5] text-[#7A7A7A] border border-[#ECECEC] hover:text-[#111111]'
                            }`}
                          >
                            <Heart size={14} className={song.isFavorite ? 'fill-rose-500' : ''} />
                            <span>{song.isFavorite ? 'Featured Favorite' : 'Make Favorite'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: ALL SONGS LIST & ACTIONS */}
                {activeTab === 'songs' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-heading text-2xl font-bold text-[#111111]">
                          All Songs Library ({songs.length})
                        </h2>
                        <p className="text-xs text-[#7A7A7A]">Manage and edit your music collection.</p>
                      </div>

                      <button
                        onClick={() => {
                          resetForm();
                          setActiveTab('add');
                        }}
                        className="px-4 py-2 rounded-full bg-[#111111] text-white text-xs font-semibold hover:bg-black transition-all flex items-center space-x-1.5"
                      >
                        <PlusCircle size={14} />
                        <span>Add Song</span>
                      </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                      <Search size={16} className="absolute left-4 top-3 text-[#7A7A7A]" />
                      <input
                        type="text"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        placeholder="Search by song name or artist..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#ECECEC] text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                    </div>

                    <div className="space-y-2">
                      {filteredSongs.map((song) => (
                        <div
                          key={song.id}
                          className="bg-white p-3 rounded-2xl border border-[#ECECEC] flex items-center justify-between hover:bg-[#F7F7F5] transition-all"
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <img
                              src={song.coverUrl}
                              alt={song.title}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="font-heading text-xs font-bold text-[#111111] truncate">{song.title}</h4>
                              <p className="text-[11px] text-[#7A7A7A] truncate">{song.artist} • {song.category}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleStartEdit(song)}
                              className="p-2 rounded-lg border border-[#ECECEC] bg-white text-[#111111] hover:bg-[#F3EFE8]"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              onClick={() => onDeleteSong(song.id)}
                              className="p-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: ADD / EDIT SONG FORM */}
                {activeTab === 'add' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-heading text-2xl font-bold text-[#111111]">
                        {editingSongId ? 'Edit Song Details' : 'Upload New Song'}
                      </h2>
                      <p className="text-xs text-[#7A7A7A]">
                        Fill in song information to add it to your SLOW LIFE collection.
                      </p>
                    </div>

                    {message && (
                      <div className="p-3 rounded-xl bg-[#DCC6A0]/20 border border-[#DCC6A0] text-xs font-medium text-[#111111]">
                        {message}
                      </div>
                    )}

                    <form onSubmit={handleSaveSong} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#111111]">Song Title *</label>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Lag Jaa Gale"
                            required
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#ECECEC] text-xs focus:outline-none focus:border-[#111111]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#111111]">Artist Name *</label>
                          <input
                            type="text"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            placeholder="e.g. Lata Mangeshkar"
                            required
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#ECECEC] text-xs focus:outline-none focus:border-[#111111]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#111111]">Category</label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as SongCategory)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#ECECEC] text-xs focus:outline-none focus:border-[#111111]"
                          >
                            <option value="Old">Old</option>
                            <option value="Sad">Sad</option>
                            <option value="Ghazal">Ghazal</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Romantic">Romantic</option>
                            <option value="Bengali">Bengali</option>
                            <option value="Classics">Classics</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#111111]">Cover Image URL</label>
                          <input
                            type="text"
                            value={coverUrl}
                            onChange={(e) => setCoverUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#ECECEC] text-xs focus:outline-none focus:border-[#111111]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#111111]">Spotify Track URL</label>
                          <input
                            type="text"
                            value={spotifyUrl}
                            onChange={(e) => setSpotifyUrl(e.target.value)}
                            placeholder="https://open.spotify.com/track/..."
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#ECECEC] text-xs focus:outline-none focus:border-[#111111]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#111111]">YouTube Video URL</label>
                          <input
                            type="text"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#ECECEC] text-xs focus:outline-none focus:border-[#111111]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#111111]">Audio Stream / MP3 URL</label>
                        <input
                          type="text"
                          value={audioUrl}
                          onChange={(e) => setAudioUrl(e.target.value)}
                          placeholder="Direct MP3 link or stream URL"
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#ECECEC] text-xs focus:outline-none focus:border-[#111111]"
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                        <input
                          type="checkbox"
                          id="isFav"
                          checked={isFavorite}
                          onChange={(e) => setIsFavorite(e.target.checked)}
                          className="w-4 h-4 rounded text-[#111111] focus:ring-[#111111]"
                        />
                        <label htmlFor="isFav" className="text-xs font-medium text-[#111111] cursor-pointer">
                          Mark as Featured Favorite Song
                        </label>
                      </div>

                      <div className="pt-4 flex items-center space-x-3">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-3 rounded-full bg-[#111111] text-white text-xs font-semibold hover:bg-black transition-all"
                        >
                          {isSubmitting ? 'Saving...' : editingSongId ? 'Update Song' : 'Save Song'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            resetForm();
                            setActiveTab('songs');
                          }}
                          className="px-5 py-3 rounded-full border border-[#ECECEC] text-xs font-semibold hover:bg-[#F3EFE8]"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* TAB 5: SETTINGS */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-heading text-2xl font-bold text-[#111111]">Website Settings</h2>
                      <p className="text-xs text-[#7A7A7A]">
                        Update curator note and Instagram social credentials.
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
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#ECECEC] text-xs focus:outline-none focus:border-[#111111]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#111111]">Curator Bio / Philosophy Note</label>
                        <textarea
                          value={curatorNote}
                          onChange={(e) => setCuratorNote(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#ECECEC] text-xs focus:outline-none focus:border-[#111111]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 rounded-full bg-[#111111] text-white text-xs font-semibold hover:bg-black transition-all"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Settings'}
                      </button>
                    </form>
                  </div>
                )}

              </div>
            </>
          )}

        </div>

      </div>
    </AnimatePresence>
  );
};
