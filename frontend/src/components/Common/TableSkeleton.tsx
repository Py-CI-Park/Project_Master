/**
 * TableSkeleton Component
 *
 * 테이블 로딩 시 표시되는 스켈레톤 UI
 * 프로젝트 목록, 작업 목록 등 테이블 형태의 데이터 로딩 시 사용
 */

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Paper,
} from '@mui/material';

interface TableSkeletonProps {
  /**
   * 표시할 행 개수 (기본값: 5)
   */
  rows?: number;

  /**
   * 표시할 열 개수 (기본값: 4)
   */
  columns?: number;

  /**
   * 헤더 표시 여부 (기본값: true)
   */
  showHeader?: boolean;

  /**
   * Paper elevation (기본값: 1)
   */
  elevation?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  elevation = 1,
}) => {
  return (
    <TableContainer component={Paper} elevation={elevation}>
      <Table>
        {showHeader && (
          <TableHead>
            <TableRow>
              {Array.from({ length: columns }).map((_, index) => (
                <TableCell key={`header-${index}`}>
                  <Skeleton variant="text" width="80%" height={24} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={`row-${rowIndex}`}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                  <Skeleton
                    variant="text"
                    width={colIndex === 0 ? '60%' : '80%'}
                    height={20}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableSkeleton;
