import { create } from 'zustand';
import type { Song, CreateSongDTO, UpdateSongDTO } from '../types';
import {
  createSong,
  getSong,
  updateSong,
  deleteSong,
  getUserSongs,
  searchSongs,
} from '../services';

interface SongsStore {
  songs: Song[];
  currentSong: Song | null;
  isLoading: boolean;
  error: string | null;

  setSongs: (songs: Song[]) => void;
  setCurrentSong: (song: Song | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchSongs: () => Promise<void>;
  fetchSong: (id: string) => Promise<void>;
  create: (data: CreateSongDTO) => Promise<Song>;
  update: (id: string, data: UpdateSongDTO) => Promise<void>;
  remove: (id: string) => Promise<void>;
  search: (query: string) => Promise<void>;
  clearError: () => void;
}

export const useSongsStore = create<SongsStore>((set) => ({
  songs: [],
  currentSong: null,
  isLoading: false,
  error: null,

  setSongs: (songs) => set({ songs }),

  setCurrentSong: (currentSong) => set({ currentSong }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  fetchSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const songs = await getUserSongs();
      set({ songs, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, isLoading: false });
    }
  },

  fetchSong: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const song = await getSong(id);
      set({ currentSong: song, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, isLoading: false });
    }
  },

  create: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const song = await createSong(data);
      set((state) => ({
        songs: [song, ...state.songs],
        isLoading: false,
      }));
      return song;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  update: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedSong = await updateSong(id, data);
      set((state) => ({
        songs: state.songs.map((s) => (s.id === id ? updatedSong : s)),
        currentSong: state.currentSong?.id === id ? updatedSong : state.currentSong,
        isLoading: false,
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteSong(id);
      set((state) => ({
        songs: state.songs.filter((s) => s.id !== id),
        currentSong: state.currentSong?.id === id ? null : state.currentSong,
        isLoading: false,
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  search: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const songs = await searchSongs(query);
      set({ songs, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
