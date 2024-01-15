import { h } from "../../lib/mini-vue-esm.js";
export const Foo = {
  render() {
    return h("div", {}, "Foo:" + this.count);
  },
  setup(props) {
    props.count++;
    console.log(props, "Foo Props");
  },
};
