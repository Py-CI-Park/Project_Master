/**
 * FileUpload Component
 *
 * 파일 업로드 컴포넌트로 드래그 앤 드롭, 진행 표시, 이미지 미리보기를 지원합니다.
 */

import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  LinearProgress,
  Typography,
  Paper,
  IconButton,
  Alert,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import axiosInstance from '../../api/axios';

// 허용된 파일 확장자 (백엔드와 동일)
const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'md',
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp',
  'zip', 'rar', '7z', 'tar', 'gz',
  'json', 'xml', 'yaml', 'yml',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface FileUploadProps {
  /** 연결된 엔티티 타입 (project, task, enabler) */
  entityType: string;
  /** 연결된 엔티티 ID */
  entityId: number;
  /** 파일 설명 (선택) */
  description?: string;
  /** 업로드 완료 콜백 */
  onUploadComplete?: (attachment: any) => void;
  /** 업로드 실패 콜백 */
  onUploadError?: (error: string) => void;
  /** 여러 파일 업로드 허용 여부 */
  multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  entityType,
  entityId,
  description,
  onUploadComplete,
  onUploadError,
  multiple = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  /**
   * 파일 확장자 검증
   */
  const validateFileExtension = (filename: string): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext ? ALLOWED_EXTENSIONS.includes(ext) : false;
  };

  /**
   * 파일 크기 검증
   */
  const validateFileSize = (size: number): boolean => {
    return size <= MAX_FILE_SIZE;
  };

  /**
   * 이미지 파일 여부 확인
   */
  const isImageFile = (file: File): boolean => {
    return file.type.startsWith('image/');
  };

  /**
   * 파일 선택 처리
   */
  const handleFileSelect = useCallback((file: File) => {
    setError(null);

    // 파일 확장자 검증
    if (!validateFileExtension(file.name)) {
      const errorMsg = `허용되지 않은 파일 형식입니다. (${file.name})`;
      setError(errorMsg);
      if (onUploadError) {
        onUploadError(errorMsg);
      }
      return;
    }

    // 파일 크기 검증
    if (!validateFileSize(file.size)) {
      const errorMsg = `파일 크기가 10MB를 초과합니다. (${(file.size / 1024 / 1024).toFixed(2)}MB)`;
      setError(errorMsg);
      if (onUploadError) {
        onUploadError(errorMsg);
      }
      return;
    }

    setSelectedFile(file);

    // 이미지 파일인 경우 미리보기 생성
    if (isImageFile(file)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [onUploadError]);

  /**
   * 파일 입력 변경 이벤트
   */
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  /**
   * 드래그 이벤트 처리
   */
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  /**
   * 드롭 이벤트 처리
   */
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  /**
   * 파일 업로드
   */
  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('entity_type', entityType);
      formData.append('entity_id', entityId.toString());
      if (description) {
        formData.append('description', description);
      }

      const response = await axiosInstance.post('/attachments/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (onUploadComplete) {
        onUploadComplete(response.data.attachment);
      }

      // 업로드 성공 후 초기화
      setSelectedFile(null);
      setPreview(null);
      setUploadProgress(0);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || '파일 업로드 중 오류가 발생했습니다.';
      setError(errorMsg);
      if (onUploadError) {
        onUploadError(errorMsg);
      }
    } finally {
      setUploading(false);
    }
  };

  /**
   * 선택 취소
   */
  const handleClearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  return (
    <Box>
      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 드래그 앤 드롭 영역 */}
      <Paper
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          backgroundColor: dragActive ? 'action.hover' : 'background.paper',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
      >
        <input
          type="file"
          id="file-upload-input"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
          accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
          multiple={multiple}
          disabled={uploading}
        />

        {!selectedFile ? (
          <>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              파일을 드래그하여 업로드하거나 클릭하세요
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              최대 파일 크기: 10MB
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              지원 형식: {ALLOWED_EXTENSIONS.join(', ')}
            </Typography>
            <label htmlFor="file-upload-input">
              <Button variant="contained" component="span" disabled={uploading}>
                파일 선택
              </Button>
            </label>
          </>
        ) : (
          <Box>
            {/* 이미지 미리보기 */}
            {preview && (
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <Box
                  component="img"
                  src={preview}
                  alt="Preview"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    borderRadius: 1,
                  }}
                />
              </Box>
            )}

            {/* 파일 정보 */}
            {!preview && (
              <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            )}
            <Typography variant="body1" gutterBottom>
              {selectedFile.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </Typography>

            {/* 업로드 진행 표시 */}
            {uploading && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {uploadProgress}% 업로드 중...
                </Typography>
              </Box>
            )}

            {/* 버튼 그룹 */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? '업로드 중...' : '업로드'}
              </Button>
              <IconButton
                onClick={handleClearSelection}
                disabled={uploading}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default FileUpload;
