import { createComponentInstance, setupComponent } from "./componet";
import { ShapeFlags } from "../shared/index";
import { Fragment, Text } from "./vnode";
import { createAppAPI } from "./createApp";
export function createRenderer(options: any) {
  const { createElement, patchProp, insert } = options;

  function render(vnode: any, container: any) {
    //调用patch
    patch(vnode, container, null);
  }

  function patch(vnode: any, container: any, parentComponent: any) {
    if (vnode.type === Fragment) {
      //Fragment -> 只渲染children
      //(使用插槽额情况组件实例children很可能是数组的情况，
      //所以需要 createVNode("div", {}, slot(row))),现在通过fargment来处理
      processFragment(vnode, container, parentComponent);
    } else if (vnode.type === Text) {
      processText(vnode, container);
    } else {
      //判断传进来的vnode的类型，由createVNode函数创建的vnode类型是element还是component类型然后做不同的处理
      if (vnode.shapeFlags & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent);
      } else if (vnode.shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent);
      }
    }
  }

  //处理只为text文本的情况
  function processText(vnode: any, container: any) {
    const textVnode = (vnode.el = document.createTextNode(vnode.children));
    container.append(textVnode);
  }

  //processFragment
  function processFragment(vnode: any, container: any, parentComponent: any) {
    mountChildren(vnode, container, parentComponent);
  }

  //vnode 类型是element
  function processElement(vnode: any, container: any, parentComponent: any) {
    mountElement(vnode, container, parentComponent);
  }

  //对element类型传进来的props 和 children 做处理，children
  //有可能是文本也有可能是element 也有可能是component,所以需要再次patch
  function mountElement(vnode: any, container: any, parentComponent: any) {
    const el = createElement(vnode.type);
    vnode.el = el;
    const { children } = vnode;
    if (vnode.shapeFlags & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (vnode.shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent);
    }
    let keys = Object.keys(vnode.props);
    keys.forEach((key) => {
      const value = vnode.props[key];
      // const isOn = /^on[A-Z]/.test(key);
      // if (isOn) {
      //   const event = key.slice(2).toLowerCase();
      //   el.addEventListener(event, value);
      // } else {
      //   el.setAttribute(key, value);
      // }
      patchProp(el, key, value);
    });
    // container.append(el);
    insert(el, container);
  }

  //对于element 的子元素做处理
  function mountChildren(vnode: any, el: any, parentComponent: any) {
    for (let item of vnode.children) {
      patch(item, el, parentComponent);
    }
  }
  function processComponent(vnode: any, container: any, parentComponent: any) {
    mountComponent(vnode, container, parentComponent);
  }
  function mountComponent(vnode: any, container: any, parentComponent: any) {
    const instance = createComponentInstance(vnode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, container);
  }

  //对于组件类型调用render 拿到vnode 树然后patch 处理，render相当于打开了一个盒子
  function setupRenderEffect(instance: any, container: any) {
    // console.log(instance.render, "11111111");
    const subTree = instance?.render.call(instance.proxy);
    console.log(container);
    //vnode树 -> patch
    patch(subTree, container, instance);
    // console.log(instance, subTree, "121221211212221212");
    instance.vnode.el = subTree.el;
  }

  return {
    createApp: createAppAPI(render),
  };
}
