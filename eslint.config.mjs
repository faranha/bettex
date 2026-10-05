import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['**/generated/**', '**/dist/**', '**/node_modules/**', '**/.local/**'] },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,mjs,js}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // Existing unused symbols are migration debt; security/syntax failures block.
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-debugger': 'error',
      'no-unsafe-finally': 'error',
    },
  },
);
