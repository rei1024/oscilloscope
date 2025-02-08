process.env.VITE_DATE = new Date().toISOString();

export default {
  base: "/oscilloscope",
  server: {
    port: 5174,
  },
};
