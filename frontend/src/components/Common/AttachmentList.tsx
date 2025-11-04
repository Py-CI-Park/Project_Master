/**
 * AttachmentList Component
 *
 * 첨부파일 목록을 표시하고 다운로드/삭제 기능을 제공하는 컴포넌트입니다.
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  Archive as ArchiveIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosInstance';
import { getFileIcon, formatFileSize } from '../../utils/fileUtils';

export interface Attachment {
  id: number;
  filename: string;
  file_size: number;
  content_type: string;
  entity_type: string;
  entity_id: number;
  uploaded_by: number | null;
  created_at: string;
  description: string | null;
}

export interface AttachmentListProps {
  /** 연결된 엔티티 타입 (project, task, enabler) */
  entityType: string;
  /** 연결된 엔티티 ID */
  entityId: number;
  /** 목록 새로고침 트리거 */
  refreshTrigger?: number;
  /** 삭제 완료 콜백 */
  onDeleteComplete?: () => void;
  /** 에러 콜백 */
  onError?: (error: string) => void;
}

const AttachmentList: React.FC<AttachmentListProps> = ({
  entityType,
  entityId,
  refreshTrigger,
  onDeleteComplete,
  onError,
}) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /**
   * 첨부파일 목록 조회
   */
  const fetchAttachments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get('/attachments', {
        params: {
          entity_type: entityType,
          entity_id: entityId,
        },
      });

      setAttachments(response.data.attachments || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || '첨부파일 목록을 불러오는 중 오류가 발생했습니다.';
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 파일 다운로드
   */
  const handleDownload = async (attachmentId: number, filename: string) => {
    try {
      const response = await axiosInstance.get(`/attachments/${attachmentId}/download`, {
        responseType: 'blob',
      });

      // Blob URL 생성 및 다운로드
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || '파일 다운로드 중 오류가 발생했습니다.';
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    }
  };

  /**
   * 파일 삭제
   */
  const handleDelete = async (attachmentId: number) => {
    if (!window.confirm('이 파일을 삭제하시겠습니까?')) {
      return;
    }

    setDeletingId(attachmentId);
    setError(null);

    try {
      await axiosInstance.delete(`/attachments/${attachmentId}`);

      // 목록에서 제거
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));

      if (onDeleteComplete) {
        onDeleteComplete();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || '파일 삭제 중 오류가 발생했습니다.';
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * 파일 아이콘 렌더링
   */
  const renderFileIcon = (filename: string, contentType: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const iconProps = { fontSize: 'medium' as const, color: 'action' as const };

    // 이미지 파일
    if (contentType.startsWith('image/')) {
      return <ImageIcon {...iconProps} />;
    }

    // PDF
    if (ext === 'pdf') {
      return <PdfIcon {...iconProps} />;
    }

    // 압축 파일
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <ArchiveIcon {...iconProps} />;
    }

    // 코드 파일
    if (['json', 'xml', 'yaml', 'yml', 'md'].includes(ext)) {
      return <CodeIcon {...iconProps} />;
    }

    // 문서 파일
    if (['doc', 'docx', 'txt', 'csv'].includes(ext)) {
      return <DescriptionIcon {...iconProps} />;
    }

    // 기본 파일 아이콘
    return <FileIcon {...iconProps} />;
  };

  /**
   * 날짜 포맷팅
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 컴포넌트 마운트 및 refreshTrigger 변경 시 목록 조회
  useEffect(() => {
    fetchAttachments();
  }, [entityType, entityId, refreshTrigger]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (attachments.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          첨부된 파일이 없습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="50px">타입</TableCell>
              <TableCell>파일명</TableCell>
              <TableCell width="120px">크기</TableCell>
              <TableCell width="180px">업로드 일시</TableCell>
              <TableCell width="120px" align="center">
                작업
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attachments.map((attachment) => (
              <TableRow key={attachment.id} hover>
                {/* 파일 아이콘 */}
                <TableCell>
                  {renderFileIcon(attachment.filename, attachment.content_type)}
                </TableCell>

                {/* 파일명 및 설명 */}
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {attachment.filename}
                  </Typography>
                  {attachment.description && (
                    <Typography variant="caption" color="text.secondary">
                      {attachment.description}
                    </Typography>
                  )}
                </TableCell>

                {/* 파일 크기 */}
                <TableCell>
                  <Typography variant="body2">
                    {formatFileSize(attachment.file_size)}
                  </Typography>
                </TableCell>

                {/* 업로드 일시 */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(attachment.created_at)}
                  </Typography>
                </TableCell>

                {/* 작업 버튼 */}
                <TableCell align="center">
                  <Tooltip title="다운로드">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleDownload(attachment.id, attachment.filename)}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="삭제">
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(attachment.id)}
                        disabled={deletingId === attachment.id}
                      >
                        {deletingId === attachment.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <DeleteIcon fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttachmentList;
