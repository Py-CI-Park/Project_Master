/**
 * File Utilities
 *
 * 파일 관련 유틸리티 함수를 제공합니다.
 */

/**
 * 파일 확장자 추출
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 변환
 *
 * @param bytes - 바이트 단위 파일 크기
 * @param decimals - 소수점 자릿수 (기본값: 2)
 * @returns 포맷팅된 파일 크기 문자열 (예: "1.23 MB")
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * 파일 확장자를 기반으로 아이콘 이름 반환
 *
 * @param filename - 파일명
 * @param contentType - MIME 타입 (선택)
 * @returns 아이콘 타입 문자열
 */
export const getFileIcon = (filename: string, contentType?: string): string => {
  const ext = getFileExtension(filename);

  // MIME 타입 기반 판단 (우선순위)
  if (contentType) {
    if (contentType.startsWith('image/')) return 'image';
    if (contentType.startsWith('video/')) return 'video';
    if (contentType.startsWith('audio/')) return 'audio';
    if (contentType === 'application/pdf') return 'pdf';
  }

  // 확장자 기반 판단
  // 이미지 파일
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) {
    return 'image';
  }

  // PDF 파일
  if (ext === 'pdf') {
    return 'pdf';
  }

  // 문서 파일
  if (['doc', 'docx', 'odt', 'txt', 'rtf'].includes(ext)) {
    return 'document';
  }

  // 스프레드시트 파일
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
    return 'spreadsheet';
  }

  // 프레젠테이션 파일
  if (['ppt', 'pptx', 'odp'].includes(ext)) {
    return 'presentation';
  }

  // 압축 파일
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) {
    return 'archive';
  }

  // 코드 파일
  if ([
    'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'go',
    'php', 'rb', 'swift', 'kt', 'rs', 'html', 'css', 'scss', 'sass',
    'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'conf', 'sh', 'bash',
  ].includes(ext)) {
    return 'code';
  }

  // 비디오 파일
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext)) {
    return 'video';
  }

  // 오디오 파일
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'].includes(ext)) {
    return 'audio';
  }

  // 마크다운 파일
  if (['md', 'markdown'].includes(ext)) {
    return 'markdown';
  }

  // 기본 파일 아이콘
  return 'file';
};

/**
 * 이미지 파일 여부 확인
 */
export const isImageFile = (filename: string, contentType?: string): boolean => {
  if (contentType && contentType.startsWith('image/')) {
    return true;
  }
  const ext = getFileExtension(filename);
  return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext);
};

/**
 * 비디오 파일 여부 확인
 */
export const isVideoFile = (filename: string, contentType?: string): boolean => {
  if (contentType && contentType.startsWith('video/')) {
    return true;
  }
  const ext = getFileExtension(filename);
  return ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext);
};

/**
 * 오디오 파일 여부 확인
 */
export const isAudioFile = (filename: string, contentType?: string): boolean => {
  if (contentType && contentType.startsWith('audio/')) {
    return true;
  }
  const ext = getFileExtension(filename);
  return ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'].includes(ext);
};

/**
 * 파일 확장자 검증 (백엔드와 동일)
 */
export const isAllowedFileExtension = (filename: string): boolean => {
  const allowedExtensions = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'md',
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp',
    'zip', 'rar', '7z', 'tar', 'gz',
    'json', 'xml', 'yaml', 'yml',
  ];

  const ext = getFileExtension(filename);
  return allowedExtensions.includes(ext);
};

/**
 * 파일 크기 검증 (10MB 제한)
 */
export const isAllowedFileSize = (bytes: number): boolean => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return bytes <= maxSize;
};

/**
 * MIME 타입에서 확장자 추출
 */
export const getMimeExtension = (mimeType: string): string => {
  const mimeMap: { [key: string]: string } = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'text/plain': 'txt',
    'text/csv': 'csv',
    'text/markdown': 'md',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/webp': 'webp',
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
    'application/x-7z-compressed': '7z',
    'application/json': 'json',
    'application/xml': 'xml',
    'text/yaml': 'yaml',
  };

  return mimeMap[mimeType] || '';
};
