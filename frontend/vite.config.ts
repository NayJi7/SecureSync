import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import flowbiteReact from "flowbite-react/plugin/vite"

export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Tu peux adapter ces groupes selon tes libs
          react: ['react', 'react-dom'],
          chart: ['chart.js', 'react-chartjs-2'],
          radix: ['@radix-ui/react-avatar', '@radix-ui/react-dialog'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // optionnel : désactive l’avertissement à 1 Mo
  },
})
