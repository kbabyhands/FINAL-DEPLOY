import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    outDir: 'build',
    // Optimize for SparkJS
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate SparkJS into its own chunk
          'sparkjs-core': ['three', '@sparkjsdev/spark', 'three-stdlib'],
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
  
  // Optimize dependencies for SparkJS
  optimizeDeps: {
    include: ['three', '@sparkjsdev/spark', 'three-stdlib'],
    exclude: ['@sparkjsdev/spark/dist/spark.module.js'] // Let Vite handle this
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
