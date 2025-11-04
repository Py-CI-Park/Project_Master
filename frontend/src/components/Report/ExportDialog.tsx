/**
 * Export Dialog Component
 *
 * 리포트 익스포트 다이얼로그 컴포넌트
 */

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox,
  Box,
  Alert,
} from '@mui/material';
import type { Task } from '../../types';

export interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
}

const ExportDialog = ({ open, onClose, tasks }: ExportDialogProps) => {
  const [format, setFormat] = useState<'csv'>('csv');
  const [includeSections, setIncludeSections] = useState({
    tasks: true,
    progress: true,
    delays: true,
  });

  const handleExport = () => {
    if (format === 'csv') {
      exportToCSV();
    }
    onClose();
  };

  const exportToCSV = () => {
    // CSV 헤더
    const headers = [
      'ID',
      '태스크명',
      '상태',
      '우선순위',
      '진행률',
      '시작일',
      '종료일',
      '설명',
    ];

    // CSV 데이터 행
    const rows = tasks.map((task) => [
      task.id,
      `"${task.name}"`,
      task.status,
      task.priority,
      task.progress,
      task.start_date,
      task.end_date,
      `"${task.description || ''}"`,
    ]);

    // CSV 문자열 생성
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // BOM 추가 (엑셀에서 한글 깨짐 방지)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // 다운로드
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>리포트 익스포트</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          {/* 포맷 선택 */}
          <FormControl component="fieldset">
            <FormLabel component="legend">익스포트 포맷</FormLabel>
            <RadioGroup
              value={format}
              onChange={(e) => setFormat(e.target.value as 'csv')}
            >
              <FormControlLabel value="csv" control={<Radio />} label="CSV" />
              <FormControlLabel
                value="excel"
                control={<Radio />}
                label="Excel (예정)"
                disabled
              />
              <FormControlLabel
                value="pdf"
                control={<Radio />}
                label="PDF (예정)"
                disabled
              />
            </RadioGroup>
          </FormControl>

          {/* 포함할 섹션 */}
          <FormControl component="fieldset">
            <FormLabel component="legend">포함할 내용</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeSections.tasks}
                    onChange={(e) =>
                      setIncludeSections({
                        ...includeSections,
                        tasks: e.target.checked,
                      })
                    }
                  />
                }
                label="태스크 목록"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeSections.progress}
                    onChange={(e) =>
                      setIncludeSections({
                        ...includeSections,
                        progress: e.target.checked,
                      })
                    }
                    disabled
                  />
                }
                label="진행 현황 (예정)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeSections.delays}
                    onChange={(e) =>
                      setIncludeSections({
                        ...includeSections,
                        delays: e.target.checked,
                      })
                    }
                    disabled
                  />
                }
                label="지연 분석 (예정)"
              />
            </FormGroup>
          </FormControl>

          <Alert severity="info">
            현재 CSV 형식의 태스크 목록만 익스포트 가능합니다.
            Excel 및 PDF는 향후 지원 예정입니다.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleExport} variant="contained">
          익스포트
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
