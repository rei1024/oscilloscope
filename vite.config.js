process.env.VITE_DATE = new Date().toISOString();

/** @type {import('vite').UserConfig} */
export default {
  base: "/oscilloscope",
  server: {
    port: 5174,
  },
};
