import { nodeOps } from "./nodeOps";

import patchProp from "./patchProp";
import { createRenderer } from "@vue/runtime-core";
export const renderOptions = Object.assign(nodeOps, { patchProp });

export const render = (vnode, container) => {
  createRenderer(renderOptions).render(vnode, container);
};
export * from "@vue/runtime-core";
