import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getPreference, savePreference, deletePreference } from '../services/preferenceService';

export interface SongPreference {
  preferredKey: string | null;
  useFlats: boolean;
}

interface PreferencesState {
  preferences: Record<string, SongPreference>;
  isLoading: boolean;
  
  getPreference: (songId: string) => SongPreference | undefined;
  setPreference: (songId: string, preference: SongPreference) => void;
  fetchPreference: (songId: string) => Promise<void>;
  savePreference: (songId: string, preferredKey: string | null, useFlats: boolean) => Promise<void>;
  deletePreference: (songId: string) => Promise<void>;
  clearPreference: (songId: string) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      preferences: {},
      isLoading: false,

      getPreference: (songId) => {
        return get().preferences[songId];
      },

      setPreference: (songId, preference) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            [songId]: preference,
          },
        }));
      },

      fetchPreference: async (songId) => {
        set({ isLoading: true });
        try {
          const data = await getPreference(songId);
          if (data) {
            set((state) => ({
              preferences: {
                ...state.preferences,
                [songId]: {
                  preferredKey: data.preferred_key,
                  useFlats: data.use_flats,
                },
              },
            }));
          }
        } catch (error) {
          console.error('Error fetching preference:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      savePreference: async (songId, preferredKey, useFlats) => {
        const preference: SongPreference = { preferredKey, useFlats };
        
        set((state) => ({
          preferences: {
            ...state.preferences,
            [songId]: preference,
          },
        }));

        try {
          await savePreference(songId, preferredKey, useFlats);
        } catch (error) {
          console.error('Error saving preference:', error);
        }
      },

      deletePreference: async (songId) => {
        try {
          await deletePreference(songId);
          set((state) => {
            const { [songId]: _, ...rest } = state.preferences;
            return { preferences: rest };
          });
        } catch (error) {
          console.error('Error deleting preference:', error);
        }
      },

      clearPreference: (songId) => {
        set((state) => {
          const { [songId]: _, ...rest } = state.preferences;
          return { preferences: rest };
        });
      },
    }),
    {
      name: 'song-preferences',
      partialize: (state) => ({ preferences: state.preferences }),
    }
  )
);
