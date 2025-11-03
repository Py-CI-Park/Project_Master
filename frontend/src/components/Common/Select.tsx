/**
 * Select Component
 *
 * 재사용 가능한 선택 상자 컴포넌트
 */

import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import type { SelectProps as MuiSelectProps } from '@mui/material';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends Omit<MuiSelectProps, 'label'> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: boolean;
}

/**
 * 커스텀 Select 컴포넌트
 * Material-UI Select를 래핑하여 사용하기 쉬운 인터페이스 제공
 */
const Select: React.FC<SelectProps> = ({
  label,
  options,
  helperText,
  error = false,
  ...props
}) => {
  const labelId = `select-label-${label?.replace(/\s+/g, '-')}`;

  return (
    <FormControl fullWidth error={error}>
      {label && <InputLabel id={labelId}>{label}</InputLabel>}
      <MuiSelect labelId={labelId} label={label} {...props}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default Select;
