/**
 * Axios Instance Configuration
 *
 * 백엔드 API 호출을 위한 Axios 인스턴스 및 인터셉터 설정
 * - Access Token 자동 첨부
 * - 401 에러 시 Refresh Token으로 토큰 갱신
 * - 갱신 실패 시 자동 로그아웃
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';

// API 기본 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Axios 인스턴스 생성
 */
export const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초
});

/**
 * 토큰 갱신 중인지 여부
 */
let isRefreshing = false;

/**
 * 토큰 갱신 대기 중인 요청 큐
 */
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

/**
 * 대기 중인 요청 처리
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Request 인터셉터
 * - Access Token을 Authorization 헤더에 자동 첨부
 */
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response 인터셉터
 * - 401 에러 시 Refresh Token으로 토큰 갱신 시도
 * - 갱신 성공 시 원래 요청 재시도
 * - 갱신 실패 시 로그아웃
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 에러이고, 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 로그인/회원가입/토큰갱신 요청은 재시도하지 않음
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      // 토큰 갱신 중이면 대기 큐에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, setTokens, logout } = useAuthStore.getState();

      if (!refreshToken) {
        // Refresh Token이 없으면 로그아웃
        isRefreshing = false;
        logout();
        return Promise.reject(error);
      }

      try {
        // Refresh Token으로 새 Access Token 발급
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          {
            refresh_token: refreshToken,
          }
        );

        const { access_token, refresh_token } = response.data;

        // 새 토큰 저장
        setTokens(access_token, refresh_token);

        // 대기 중인 요청 처리
        processQueue(null, access_token);

        // 원래 요청 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
