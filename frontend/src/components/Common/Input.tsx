/**
 * Input Component
 *
 * 재사용 가능한 입력 필드 컴포넌트
 */

import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

// Material-UI TextFieldProps를 그대로 사용
type InputProps = TextFieldProps;

/**
 * 커스텀 Input 컴포넌트
 * Material-UI TextField를 래핑하여 프로젝트 전체에서 일관된 입력 필드 스타일 사용
 */
const Input: React.FC<InputProps> = (props) => {
  return <TextField fullWidth variant="outlined" {...props} />;
};

export default Input;
