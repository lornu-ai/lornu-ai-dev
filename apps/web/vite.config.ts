import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";
import svgr from "vite-plugin-svgr";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
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
    target: 'es2020', // Match TypeScript target for broader browser compatibility
    sourcemap: false, // Disable sourcemaps in production (faster builds, smaller output)
    // Note: minify: 'esbuild' and cssCodeSplit: true are already defaults in Vite 5+
    chunkSizeWarningLimit: 600, // TODO: Temporarily increased while optimizing. Revisit and reduce to 500 (default) or lower once bundle optimizations are complete.
  },
});
