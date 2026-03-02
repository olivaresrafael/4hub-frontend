import type { User, Profile } from '../types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrentUser, getProfile, signIn, signUp, signOut, createProfile } from '../services';

interface AuthStore {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setProfile: (profile) => set({ profile }),

      setLoading: (isLoading) => set({ isLoading }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user } = await signIn(email, password);
          set({ user: user as User, isAuthenticated: true });
          
          if (user) {
            let profile = await getProfile(user.id);
            
            if (!profile) {
              const username = user.email?.split('@')[0] || 'user';
              profile = await createProfile(user.id, username);
            }
            
            set({ profile });
          }
        } catch (error) {
          set({ user: null, profile: null, isAuthenticated: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, password, username) => {
        set({ isLoading: true });
        try {
          const { user, session } = await signUp(email, password, username);
          
          if (user && session) {
            await createProfile(user.id, username);
            set({ user: user as User, isAuthenticated: true });
          } else if (user) {
            set({ 
              user: null, 
              profile: null, 
              isAuthenticated: false 
            });
          }
        } catch (error) {
          set({ user: null, profile: null, isAuthenticated: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await signOut();
        } finally {
          set({ user: null, profile: null, isAuthenticated: false });
        }
      },

      fetchProfile: async () => {
        const state = get();
        if (!state.user) return;

        try {
          const profile = await getProfile(state.user.id);
          set({ profile });
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      },

      initialize: async () => {
        set({ isLoading: true });
        try {
          const user = await getCurrentUser();
          set({ user, isAuthenticated: !!user });

          if (user) {
            let profile = await getProfile(user.id);
            
            if (!profile) {
              const username = user.email?.split('@')[0] || 'user';
              try {
                profile = await createProfile(user.id, username);
              } catch (e) {
                console.error('Could not create profile:', e);
              }
            }
            
            set({ profile });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ user: null, profile: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
