import { isObject } from "../reactive/utils";
import { createComponentInstance, setupComponent } from "./componet";
import { ShapeFlags } from "../shared/index";
export function render(vnode: any, container: any) {
  //调用patch
  patch(vnode, container);
}

function patch(vnode: any, container: any) {
  //判断传进来的vnode的类型，由createVNode函数创建的vnode类型是element还是component类型然后做不同的处理
  if (vnode.shapeFlags & ShapeFlags.ELEMENT) {
    processElement(vnode, container);
  } else if (vnode.shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container);
  }
}

//vnode 类型是element
function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

//对element类型传进来的props 和 children 做处理，children
//有可能是文本也有可能是element 也有可能是component,所以需要再次patch
function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type);
  vnode.el = el;
  const { children } = vnode;
  if (vnode.shapeFlags & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (vnode.shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el);
  }
  let keys = Object.keys(vnode.props);
  keys.forEach((key) => {
    const value = vnode.props[key];
    const isOn = /^on[A-Z]/.test(key);
    if (isOn) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, value);
    } else {
      el.setAttribute(key, value);
    }
  });
  container.append(el);
}

//对于element 的子元素做处理
function mountChildren(vnode: any, el: any) {
  for (let item of vnode.children) {
    patch(item, el);
  }
}
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}
function mountComponent(vnode: any, container: any) {
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, container);
}

//对于组件类型调用render 拿到vnode 树然后patch 处理，render相当于打开了一个盒子
function setupRenderEffect(instance: any, container: any) {
  console.log(instance.render, "11111111");
  const subTree = instance?.render.apply(instance.proxy);
  console.log(container);
  //vnode树 -> patch
  patch(subTree, container);
  console.log(instance, subTree, "121221211212221212");

  instance.vnode.el = subTree.el;
}
