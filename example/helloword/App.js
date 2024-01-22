import { h } from "../../lib/mini-vue-esm.js";
import { Foo } from "./Foo.js";
export const App = {
  render() {
    window.self = this;
    return h(
      "div",
      {
        class: ["name", "hard"],
        id: "root",
        onClick() {
          console.log("click事件");
        },
        onMouseDown() {
          console.log("mousedown事件");
        },
      },
      [
        h("p", { class: "blue" }, "min-vue"),
        h(Foo, {
          count: 1,
        }),
        h("span", {}, "888888"),
      ]
    );
  },
  setup() {
    return {
      msg: "min-vue-hhahah",
    };
  },
};
