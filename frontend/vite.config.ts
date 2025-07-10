import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    outDir: 'build',
    // Optimize for PlayCanvas
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate PlayCanvas into its own chunk
          'playcanvas-core': ['playcanvas'],
          // Keep React separate
          'react-vendor': ['react', 'react-dom'],
          // Separate large UI libraries
          'ui-vendor': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    },
    // Optimize chunk size for better loading
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging
    sourcemap: mode === 'development',
    // Minify for production
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    }
  },
  
  // Server configuration
  server: {
    port: 3000,
    host: '0.0.0.0', // Explicitly bind to all interfaces
    allowedHosts: true
  },
  
  plugins: [
    react(),
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Optimize dependencies for PlayCanvas
  optimizeDeps: {
    include: ['playcanvas'],
    exclude: [] // Let Vite handle PlayCanvas optimization
  },
  
  // Configure module preloading
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return `/${filename}`;
      }
      return { relative: true };
    }
  }
}));
