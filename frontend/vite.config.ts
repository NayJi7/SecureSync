import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import flowbiteReact from "flowbite-react/plugin/vite"

export default defineConfig({
  base: "/static/", // <-- essentiel pour Django
  plugins: [react(), tailwindcss(), flowbiteReact()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../backend/static", // <-- où Django va chercher les fichiers
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          chart: ["chart.js", "react-chartjs-2"],
          radix: ["@radix-ui/react-avatar", "@radix-ui/react-dialog"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
