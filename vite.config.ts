import { defineConfig } from 'vite';

export default defineConfig({
  base: '/games/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        library: 'library.html',
        retro: 'retro.html'
      }
    }
  }
});
