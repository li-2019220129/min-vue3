import typescript from "@rollup/plugin-typescript";
export default {
  input: "./src/index.ts",
  output: [
    {
      file: "lib/mini-vue-cjs.js",
      format: "cjs",
    },
    {
      file: "lib/mini-vue-esm.js",
      format: "es",
    },
  ],
  plugins: [typescript()],
};
