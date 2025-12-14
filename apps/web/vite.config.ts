import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
    {
      name: 'force-port',
      config: () => ({ server: { port: 5174, strictPort: true } }),
    }
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  build: {
    // Optimize build performance and output
    target: 'esnext', // Use modern ES features for smaller bundle
    minify: 'esbuild', // Faster than terser (default), good compression
    cssCodeSplit: true, // Split CSS into separate files for better caching
    sourcemap: false, // Disable sourcemaps in production (faster builds, smaller output)
    // Enable aggressive tree shaking to remove unused code
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false, // Assume no side effects unless marked
      },
    },
    chunkSizeWarningLimit: 600, // Keep reasonable limit for bundle size warnings
  },
});
