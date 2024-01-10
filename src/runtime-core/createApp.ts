import { createVNode } from "./vnode";
import { render } from "./render";
//createApp ,vue3 导出的方法，用于接收一个根组件然后用mount方法进行挂载到app元素上
export function createApp(rootComponent: any) {
  return {
    mount(rootEl: any) {
      if (typeof rootEl === "string") {
        rootEl = document.querySelector(rootEl);
      }
      const vnode = createVNode(rootComponent);
      render(vnode, rootEl);
    },
  };
}
