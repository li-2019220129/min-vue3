import { h } from "../../lib/mini-vue-esm.js";
export const Foo = {
  render() {
    return h("div", {}, "Foo:" + this.count1);
  },
  setup(props) {
    props.count++;
    const count1 = 12;
    console.log(props, "Foo Props");
    return {
      count1,
    };
  },
};
