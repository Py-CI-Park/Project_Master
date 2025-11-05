/**
 * i18n Configuration
 *
 * react-i18next 설정 및 초기화
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 한국어 번역
import ko from './locales/ko.json';
// 영어 번역
import en from './locales/en.json';

const resources = {
  ko: {
    translation: ko,
  },
  en: {
    translation: en,
  },
};

i18n
  // 브라우저 언어 감지
  .use(LanguageDetector)
  // react-i18next 연동
  .use(initReactI18next)
  // 초기화
  .init({
    resources,
    fallbackLng: 'ko', // 기본 언어
    lng: 'ko', // 초기 언어

    detection: {
      // 언어 감지 순서
      order: ['localStorage', 'navigator'],
      // localStorage 키
      lookupLocalStorage: 'i18nextLng',
      // 캐싱 설정
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false, // Suspense 비활성화 (선택적)
    },
  });

export default i18n;
