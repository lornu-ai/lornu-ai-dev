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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for better caching and code splitting
          if (id.includes('node_modules')) {
            // React core libraries
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Radix UI components - group all together
            if (id.includes('@radix-ui')) {
              return 'vendor-radix-ui';
            }
            // Chart libraries (lazy load if not used on initial page)
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            // Animation library (framer-motion)
            if (id.includes('framer-motion')) {
              return 'vendor-animations';
            }
            // Icon libraries
            if (id.includes('@phosphor-icons') || id.includes('@heroicons') || id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Other vendor libraries
            return 'vendor-misc';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600, // Temporarily increased while optimizing
  },
});
