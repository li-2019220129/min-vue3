import { h } from "../../lib/mini-vue-esm.js";
export const App = {
  render() {
    return h("div", { class: "name", id: "root" }, "hi lzy" + this.msg);
  },
  setup() {
    return {
      msg: "min-vue",
    };
  },
};
