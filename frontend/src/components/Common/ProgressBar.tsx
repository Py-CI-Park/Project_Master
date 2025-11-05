/**
 * ProgressBar Component
 *
 * 진행률 표시 컴포넌트
 * 파일 업로드, 긴 작업 진행 상태 등을 시각화
 */

import { Box, LinearProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ProgressBarProps {
  /**
   * 진행률 (0-100)
   */
  value: number;

  /**
   * 진행률 텍스트 표시 여부 (기본값: true)
   */
  showLabel?: boolean;

  /**
   * 사용자 정의 라벨
   */
  label?: string;

  /**
   * 색상 (기본값: 'primary')
   */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

  /**
   * 높이 (기본값: 8)
   */
  height?: number;

  /**
   * 버퍼 값 (0-100, 선택사항)
   * buffer가 설정되면 버퍼 프로그레스 바로 표시됨
   */
  buffer?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  showLabel = true,
  label,
  color = 'primary',
  height = 8,
  buffer,
}) => {
  const { t } = useTranslation();

  // 진행률을 0-100 범위로 제한
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const normalizedBuffer = buffer !== undefined ? Math.min(Math.max(buffer, 0), 100) : undefined;

  // 기본 라벨 생성
  const displayLabel = label || `${Math.round(normalizedValue)}%`;

  return (
    <Box sx={{ width: '100%' }}>
      {showLabel && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {displayLabel}
          </Typography>
          {normalizedValue === 100 && (
            <Typography variant="body2" color="success.main">
              {t('common.success')}
            </Typography>
          )}
        </Box>
      )}

      {normalizedBuffer !== undefined ? (
        <LinearProgress
          variant="buffer"
          value={normalizedValue}
          valueBuffer={normalizedBuffer}
          color={color}
          sx={{ height, borderRadius: 1 }}
        />
      ) : (
        <LinearProgress
          variant="determinate"
          value={normalizedValue}
          color={color}
          sx={{ height, borderRadius: 1 }}
        />
      )}
    </Box>
  );
};

export default ProgressBar;
