import { create } from 'zustand';
import { fetchUserName, sendIdTokenToBackend } from '../api/auth';

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  userName: string | null;
  isLoading: boolean;
  login: (googleIdToken: string, backendUrl: string) => Promise<void>;
  logout: () => void;
  checkAuthStatus: (backendUrl: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  token: null,
  userName: null,
  isLoading: false,

  login: async (googleIdToken: string, backendUrl: string) => {
    set({ isLoading: true });
    const [appToken, error] = await sendIdTokenToBackend(googleIdToken, backendUrl);

    if (error || !appToken) {
      console.error('Login failed:', error);
      set({ isLoading: false, token: null, isLoggedIn: false, userName: null });
      localStorage.removeItem('appToken');
      return;
    }

    const [fetchedName, nameError] = await fetchUserName(appToken, backendUrl);
    if (nameError || !fetchedName) {
      console.error('Failed to fetch user name:', nameError);
      set({ isLoading: false, token: null, isLoggedIn: false, userName: null });
      localStorage.removeItem('appToken');
      return;
    }

    localStorage.setItem('appToken', appToken);
    set({ 
      isLoggedIn: true, 
      token: appToken, 
      userName: fetchedName, 
      isLoading: false 
    });
  },

  logout: () => {
    localStorage.removeItem('appToken');
    set({ isLoggedIn: false, token: null, userName: null });
  },

  checkAuthStatus: async (backendUrl: string) => {
    const appToken = localStorage.getItem('appToken');
    if (!appToken) {
      set({ isLoggedIn: false, token: null, userName: null });
      return;
    }

    set({ isLoading: true });
    const [fetchedName, nameError] = await fetchUserName(appToken, backendUrl);

    if (nameError || !fetchedName) {
      get().logout(); // Token is invalid or expired, so log out
      set({ isLoading: false });
      return;
    }

    set({ 
      isLoggedIn: true, 
      token: appToken, 
      userName: fetchedName, 
      isLoading: false 
    });
  },
}));
