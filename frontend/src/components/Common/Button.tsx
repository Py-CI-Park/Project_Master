/**
 * Button Component
 *
 * 재사용 가능한 버튼 컴포넌트 (Material-UI Button 래퍼)
 */

import { Button as MuiButton } from '@mui/material';
import type { ButtonProps as MuiButtonProps } from '@mui/material';

// Material-UI ButtonProps를 그대로 사용
type ButtonProps = MuiButtonProps;

/**
 * 커스텀 버튼 컴포넌트
 * Material-UI Button을 래핑하여 프로젝트 전체에서 일관된 버튼 스타일 사용
 */
const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return <MuiButton {...props}>{children}</MuiButton>;
};

export default Button;
