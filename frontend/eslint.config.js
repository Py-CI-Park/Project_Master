import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettierConfig from 'eslint-config-prettier'

export default defineConfig([
  globalIgnores(['dist', 'build', 'node_modules']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      prettierConfig,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // 추가 규칙 (필요시 커스터마이징)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react-hooks/exhaustive-deps': 'warn',
      // any 타입 사용을 경고로 완화 (필요한 경우 사용 가능)
      '@typescript-eslint/no-explicit-any': 'warn',
      // Context, utils 등 컴포넌트 외 export를 허용
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true, allowExportNames: ['loader', 'action'] },
      ],
      // 빈 인터페이스 허용 (타입 확장용)
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
])
