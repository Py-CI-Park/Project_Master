/**
 * Authentication Store (Zustand)
 *
 * 사용자 인증 상태 및 토큰 관리를 위한 Zustand 스토어
 * - 로그인/로그아웃 기능
 * - 토큰 저장/조회 (localStorage)
 * - 현재 사용자 정보 관리
 * - 자동 로그인 (토큰 검증)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 사용자 정보 인터페이스
 */
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  avatar_url: string | null;
}

/**
 * 인증 상태 인터페이스
 */
interface AuthState {
  // 상태
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // 액션
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (isLoading: boolean) => void;
}

/**
 * 인증 스토어
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false, // 초기 로딩 상태 (persist가 자동으로 처리)

      // 토큰 설정
      setTokens: (accessToken, refreshToken) => {
        set({
          accessToken,
          refreshToken,
          isAuthenticated: !!accessToken,
        });
      },

      // 사용자 정보 설정
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      // 로그인
      login: (accessToken, refreshToken, user) => {
        console.log('🔐 authStore.login called:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          userId: user?.id,
          username: user?.username,
        });
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // 로그아웃
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // 사용자 정보 업데이트
      updateUser: (updatedFields) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        }));
      },

      // 로딩 상태 설정
      setLoading: (isLoading) => {
        set({ isLoading });
      },
    }),
    {
      name: 'auth-storage', // localStorage 키 이름
      partialize: (state) => ({
        // localStorage에 저장할 상태만 선택
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
