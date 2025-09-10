import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    return {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        fs: {
          // للسماح بمحاكاة الوصول إلى الملفات خارج مجلد العمل
          strict: false
        }
      }
    };
});
