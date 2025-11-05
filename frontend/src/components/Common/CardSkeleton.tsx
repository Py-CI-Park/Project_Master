/**
 * CardSkeleton Component
 *
 * 카드 로딩 시 표시되는 스켈레톤 UI
 * 대시보드, 프로젝트 카드 뷰 등에서 사용
 */

import { Card, CardContent, CardHeader, Skeleton, Box, Grid } from '@mui/material';

interface CardSkeletonProps {
  /**
   * 표시할 카드 개수 (기본값: 3)
   */
  count?: number;

  /**
   * Grid 열 크기 (기본값: 4)
   * xs, sm, md에서 사용 (12를 기준으로)
   */
  gridSize?: number;

  /**
   * 헤더 표시 여부 (기본값: true)
   */
  showHeader?: boolean;

  /**
   * 이미지 영역 표시 여부 (기본값: false)
   */
  showImage?: boolean;

  /**
   * Card elevation (기본값: 1)
   */
  elevation?: number;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({
  count = 3,
  gridSize = 4,
  showHeader = true,
  showImage = false,
  elevation = 1,
}) => {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={gridSize} key={`card-skeleton-${index}`}>
          <Card elevation={elevation}>
            {showHeader && (
              <CardHeader
                avatar={<Skeleton variant="circular" width={40} height={40} />}
                title={<Skeleton variant="text" width="60%" height={24} />}
                subheader={<Skeleton variant="text" width="40%" height={20} />}
              />
            )}

            {showImage && (
              <Skeleton variant="rectangular" height={140} sx={{ mx: 2, mb: 2 }} />
            )}

            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="90%" height={20} />
                <Skeleton variant="text" width="70%" height={20} />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="30%" height={20} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default CardSkeleton;
