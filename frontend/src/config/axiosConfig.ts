/**
 * Axios Configuration
 *
 * API 통신을 위한 Axios 인스턴스 설정
 * - Base URL 설정
 * - 요청/응답 인터셉터
 * - 에러 핸들링
 */

import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../stores/authStore';

// 환경 변수에서 API Base URL 가져오기 (없으면 기본값 사용)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Axios 인스턴스 생성
 */
export const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000, // 10초
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청 인터셉터
 * - 요청 전에 실행되는 로직
 * - 인증 토큰 추가 등
 */
axiosInstance.interceptors.request.use(
  (config: any) => {
    // authStore에서 토큰 가져오기
    const { accessToken } = useAuthStore.getState();

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // 요청 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log('🚀 Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        hasToken: !!accessToken,
        token: accessToken ? `${accessToken.substring(0, 20)}...` : 'NO TOKEN',
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터
 * - 응답 후 실행되는 로직
 * - 에러 핸들링
 */
axiosInstance.interceptors.response.use(
  (response: any) => {
    // 응답 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log('✅ Response:', {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError) => {
    // 에러 로깅
    console.error('❌ Response Error:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    // 에러 타입별 처리
    if (error.response) {
      // 서버가 응답을 반환한 경우
      const status = error.response.status;

      switch (status) {
        case 400:
          console.error('400 Bad Request:', error.response.data);
          break;
        case 401:
          console.error('401 Unauthorized: 토큰이 만료되었습니다. 로그아웃합니다.');
          // 토큰 만료 시 자동 로그아웃
          useAuthStore.getState().logout();
          // 로그인 페이지로 리다이렉트
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('403 Forbidden: 권한이 없습니다.');
          break;
        case 404:
          console.error('404 Not Found: 리소스를 찾을 수 없습니다.');
          break;
        case 422:
          console.error('422 Unprocessable Entity: 유효성 검증 실패', error.response.data);
          break;
        case 500:
          console.error('500 Internal Server Error: 서버 오류가 발생했습니다.');
          break;
        default:
          console.error(`${status} Error:`, error.response.data);
      }
    } else if (error.request) {
      // 요청이 전송되었지만 응답을 받지 못한 경우
      console.error('네트워크 오류: 서버에 연결할 수 없습니다.');
    } else {
      // 요청 설정 중 오류가 발생한 경우
      console.error('요청 설정 오류:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * API 에러 타입 정의
 */
export interface ApiError {
  message: string;
  detail?: string;
  status?: number;
}

/**
 * API 에러를 사용자 친화적인 메시지로 변환
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;

    // 서버 응답이 있는 경우
    if (axiosError.response?.data) {
      const data = axiosError.response.data;
      return data.detail || data.message || '알 수 없는 오류가 발생했습니다.';
    }

    // 네트워크 오류
    if (axiosError.request && !axiosError.response) {
      return '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
    }

    // 요청 설정 오류
    return axiosError.message || '요청 처리 중 오류가 발생했습니다.';
  }

  // Axios 에러가 아닌 경우
  return '알 수 없는 오류가 발생했습니다.';
};

export default axiosInstance;
