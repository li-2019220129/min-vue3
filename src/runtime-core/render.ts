import { isObject } from "../reactive/utils";
import { createComponentInstance, setupComponent } from "./componet";

export function render(vnode: any, container: any) {
  //调用patch
  patch(vnode, container);
}

function patch(vnode: any, container: any) {
  //判断传进来的vnode的类型，由createVNode函数创建的vnode类型是element还是component类型然后做不同的处理
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type);
  const { children } = vnode;
  el.textContent = children;
  let keys = Object.keys(vnode.props);
  keys.forEach((item) => {
    el.setAttribute(item, vnode.props[item]);
  });
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}
function mountComponent(vnode: any, container: any) {
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance: any, container: any) {
  console.log(instance.render, "11111111");

  const subTree = instance?.render();
  console.log(container);
  //vnode树 -> patch
  patch(subTree, container);
}
