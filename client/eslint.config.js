import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import eslintPluginPrettier from 'eslint-plugin-prettier'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}']
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    plugins: {
      prettier: eslintPluginPrettier
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'prettier/prettier': 'warn',
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'prefer-const': 'warn',
      eqeqeq: ['warn', 'always'],
      'no-var': 'warn'
    }
  }
])
