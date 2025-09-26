import { resolve } from "node:path";

process.env.VITE_DATE = new Date().toISOString();

/** @type {import('vite').UserConfig} */
export default {
  base: "/oscilloscope",
  server: {
    port: 5174,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        changelog: resolve(__dirname, "pages/changelog/index.html"),
      },
    },
  },
};
