import React, { useState, useEffect } from 'react';
import { AudioProvider, useAudio } from './context/AudioContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AllSongsGrid } from './components/AllSongsGrid';
import { BottomPlayer } from './components/BottomPlayer';
import { PlayerModal } from './components/PlayerModal';
import { AboutSection } from './components/AboutSection';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';

import { Song, SiteStats } from './types';
import { INITIAL_SONGS, DEFAULT_STATS } from './data/songs';

function MainApp() {
  const { setSongsList } = useAudio();

  const [songs, setSongs] = useState<Song[]>(INITIAL_SONGS);
  const [stats, setStats] = useState<SiteStats>(DEFAULT_STATS);

  const [activeSection, setActiveSection] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Check URL hash or path for /admin
  useEffect(() => {
    if (window.location.pathname.includes('/admin') || window.location.hash.includes('admin')) {
      setIsAdminOpen(true);
    }
  }, []);

  // Fetch initial songs from Express API
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch('/api/songs');
        if (res.ok) {
          const data = await res.json();
          if (data.songs && data.songs.length > 0) {
            setSongs(data.songs);
            setSongsList(data.songs);
          }
          if (data.stats) {
            setStats(data.stats);
          }
        } else {
          setSongsList(INITIAL_SONGS);
        }
      } catch (err) {
        console.log('Using initial client song dataset:', err);
        setSongsList(INITIAL_SONGS);
      }
    };

    fetchSongs();
  }, []);

  // Keep songs context synced
  useEffect(() => {
    setSongsList(songs);
  }, [songs]);

  // Smooth Navigation Scroll Handler
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Toggle Favorite Action
  const handleToggleFavorite = async (id: string) => {
    const songIndex = songs.findIndex((s) => s.id === id);
    if (songIndex === -1) return;

    const newFav = !songs[songIndex].isFavorite;
    const updatedSongs = [...songs];
    updatedSongs[songIndex] = { ...updatedSongs[songIndex], isFavorite: newFav };

    setSongs(updatedSongs);

    // Update stats count locally
    const favCount = updatedSongs.filter((s) => s.isFavorite).length;
    setStats((prev) => ({ ...prev, favoriteSongs: favCount }));

    // Sync with API if available
    try {
      const token = sessionStorage.getItem('slowlife_admin_token') || 'guest_token';
      await fetch(`/api/songs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isFavorite: newFav }),
      });
    } catch (err) {
      console.log('Local state updated.');
    }
  };

  // API Admin Actions
  const handleAddSong = async (songData: Partial<Song>): Promise<boolean> => {
    try {
      const token = sessionStorage.getItem('slowlife_admin_token') || 'guest_token';
      const res = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(songData),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.songs) setSongs(data.songs);
        if (data.stats) setStats(data.stats);
        return true;
      }
    } catch (err) {
      console.error(err);
    }

    // Local fallback addition
    const newSong: Song = {
      id: `song-${Date.now()}`,
      title: songData.title || 'Untitled',
      artist: songData.artist || 'Unknown',
      coverUrl: songData.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      category: songData.category || 'Hindi',
      spotifyUrl: songData.spotifyUrl,
      youtubeUrl: songData.youtubeUrl,
      audioUrl: songData.audioUrl || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-chill-112194.mp3',
      isFavorite: !!songData.isFavorite,
      description: songData.description,
      duration: '04:12',
      durationSec: 252,
    };

    const newSongs = [newSong, ...songs];
    setSongs(newSongs);
    setStats((prev) => ({
      ...prev,
      totalSongs: prev.totalSongs + 1,
      favoriteSongs: newSong.isFavorite ? prev.favoriteSongs + 1 : prev.favoriteSongs,
    }));
    return true;
  };

  const handleUpdateSong = async (id: string, songData: Partial<Song>): Promise<boolean> => {
    const updated = songs.map((s) => (s.id === id ? { ...s, ...songData } : s));
    setSongs(updated);

    try {
      const token = sessionStorage.getItem('slowlife_admin_token') || 'guest_token';
      await fetch(`/api/songs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(songData),
      });
    } catch (err) {
      console.error(err);
    }
    return true;
  };

  const handleDeleteSong = async (id: string): Promise<boolean> => {
    const filtered = songs.filter((s) => s.id !== id);
    setSongs(filtered);

    try {
      const token = sessionStorage.getItem('slowlife_admin_token') || 'guest_token';
      await fetch(`/api/songs/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error(err);
    }
    return true;
  };

  const handleUpdateStats = async (statsData: Partial<SiteStats>): Promise<boolean> => {
    setStats((prev) => ({ ...prev, ...statsData }));
    try {
      const token = sessionStorage.getItem('slowlife_admin_token') || 'guest_token';
      await fetch('/api/stats', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(statsData),
      });
    } catch (err) {
      console.error(err);
    }
    return true;
  };

  // Filtered list of songs
  const filteredSongs = songs.filter((song) => {
    const matchesCategory =
      selectedCategory === 'All' ? true : song.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const favoritesList = songs.filter((s) => s.isFavorite);
  const heroFeaturedSong = favoritesList[0] || songs[0];

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111111] flex flex-col font-sans selection:bg-[#DCC6A0]/30">
      
      {/* HEADER */}
      <Header
        activeSection={activeSection}
        onNavigate={handleNavigate}
        instagramHandle={stats.instagramHandle}
      />

      {/* HERO SECTION */}
      <HeroSection
        stats={stats}
        featuredSong={heroFeaturedSong}
        songs={songs}
        onExploreClick={() => handleNavigate('songs')}
        instagramHandle={stats.instagramHandle}
      />

      {/* ALL SONGS RESPONSIVE GRID */}
      <AllSongsGrid
        songs={filteredSongs}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* ABOUT & CURATOR DIARY */}
      <AboutSection
        curatorNote={stats.curatorNote}
        instagramHandle={stats.instagramHandle}
      />

      {/* FOOTER */}
      <Footer />

      {/* STICKY BOTTOM MUSIC PLAYER */}
      <BottomPlayer onToggleFavorite={handleToggleFavorite} />

      {/* PLAYER MODAL */}
      <PlayerModal onToggleFavorite={handleToggleFavorite} />

      {/* ADMIN PANEL MODAL */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        songs={songs}
        stats={stats}
        onAddSong={handleAddSong}
        onUpdateSong={handleUpdateSong}
        onDeleteSong={handleDeleteSong}
        onUpdateStats={handleUpdateStats}
      />

    </div>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <MainApp />
    </AudioProvider>
  );
}
