/**
 * DatePicker Component
 *
 * 재사용 가능한 날짜 선택기 컴포넌트
 */

import { TextField, TextFieldProps } from '@mui/material';

interface DatePickerProps extends Omit<TextFieldProps, 'type'> {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * 커스텀 DatePicker 컴포넌트
 * HTML5 date input을 Material-UI TextField로 래핑
 *
 * 참고: 향후 @mui/x-date-pickers 패키지로 업그레이드 가능
 */
const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, ...props }) => {
  return (
    <TextField
      type="date"
      fullWidth
      variant="outlined"
      value={value}
      onChange={onChange}
      InputLabelProps={{
        shrink: true,
      }}
      {...props}
    />
  );
};

export default DatePicker;
