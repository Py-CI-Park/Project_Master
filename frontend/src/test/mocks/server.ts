/**
 * MSW Server Setup
 *
 * 테스트용 MSW 서버 설정
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup requests interception using the given handlers
export const server = setupServer(...handlers);
