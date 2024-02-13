import { createComponentInstance, setupComponent } from "./componet";
import { ShapeFlags } from "../shared/index";
import { Fragment, Text } from "./vnode";
import { createAppAPI } from "./createApp";
import { effect } from "../reactive/effect";
export function createRenderer(options: any) {
  const {
    createElement,
    patchProp,
    insert,
    remove,
    setElementText: hostSetElementText,
  } = options;

  function render(vnode: any, container: any) {
    //调用patch
    patch(null, vnode, container, null, null);
  }

  // n1->老的vnode 节点
  // n2->新的vnode 节点
  // n1没有代表初始化，反之代表更新操作
  function patch(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    if (n2.type === Fragment) {
      //Fragment -> 只渲染children
      //(使用插槽额情况组件实例children很可能是数组的情况，
      //所以需要 createn2("div", {}, slot(row))),现在通过fargment来处理
      processFragment(n1, n2, container, parentComponent, anchor);
    } else if (n2.type === Text) {
      processText(n1, n2, container);
    } else {
      //判断传进来的n2的类型，由createn2函数创建的n2类型是element还是component类型然后做不同的处理
      if (n2.shapeFlags & ShapeFlags.ELEMENT) {
        processElement(n1, n2, container, parentComponent, anchor);
      } else if (n2.shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(n1, n2, container, parentComponent, anchor);
      }
    }
  }

  //处理只为text文本的情况
  function processText(n1: any, n2: any, container: any) {
    const textVnode = (n2.el = document.createTextNode(n2.children));
    container.append(textVnode);
  }

  //processFragment
  function processFragment(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  //vnode 类型是element
  function processElement(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }
  //更新逻辑
  function patchElement(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    console.log("patchElement");

    console.log("n1:", n1);
    console.log("n2:", n2);
    //更新props
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    const el = (n2.el = n1.el);
    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
    //更新children
  }
  function patchChildren(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    const prevShapeFlags = n1.shapeFlags;
    const { shapeFlags } = n2;
    const c2 = n2.children;
    const c1 = n1.children;
    if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlags & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(n1.children);
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlags & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }
  function isSomeVNodeType(n1: any, n2: any) {
    return n1.type === n2.type && n1.key === n2.key;
  }
  function patchKeyedChildren(
    c1: any,
    c2: any,
    container: any,
    parentComponent: any,
    parentAnchor: any
  ) {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    debugger;
    //左侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }
    //右侧
    while (e1 >= i && e2 >= i) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        let nextPos = e2 + 1;
        let anchor = nextPos < c2.length ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        remove(c1[i].el);
        i++;
      }
    } else {
      //中间对比
      let s1 = i;
      let s2 = i;
      const keyToNewIndexMap = new Map();
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }
      for(let i=s1;i<=e1;i++){
        const prevChild = c1[i]
      }
    }
  }
  function unmountChildren(children: any) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      remove(el);
    }
  }
  // function patchChildren(
  //   el: any,
  //   oldChildren: any,
  //   newChildren: any,
  //   parentComponent: any
  // ) {
  //   if (oldChildren === newChildren) return;
  //   if (typeof newChildren === "string") {
  //     el.textContent = newChildren;
  //   }
  //   if (Array.isArray(newChildren) && typeof oldChildren === "string") {
  //     el.textContent = "";
  //     for (let item of newChildren) {
  //       patch(null, item, el, parentComponent);
  //     }
  //   }
  // }
  function patchProps(el: any, oldProps: any, newProps: any) {
    if (oldProps === newProps) return;
    for (let key in newProps) {
      const prevProp = oldProps[key];
      const nextProp = newProps[key];
      if (prevProp !== nextProp) {
        patchProp(el, key, prevProp, nextProp);
      }
    }

    for (let key in oldProps) {
      const prevProp = oldProps[key];
      if (!(key in newProps)) {
        patchProp(el, key, prevProp, null);
      }
    }
  }

  //对element类型传进来的props 和 children 做处理，children
  //有可能是文本也有可能是element 也有可能是component,所以需要再次patch
  function mountElement(
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    const el = createElement(n2.type);
    n2.el = el;
    const { children } = n2;
    if (n2.shapeFlags & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (n2.shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(n2.children, el, parentComponent, anchor);
    }
    let keys = Object.keys(n2.props);
    keys.forEach((key) => {
      const value = n2.props[key];
      patchProp(el, key, null, value);
    });
    insert(el, container, anchor);
  }

  //对于element 的子元素做处理
  function mountChildren(
    children: any,
    el: any,
    parentComponent: any,
    anchor: any
  ) {
    for (let item of children) {
      patch(null, item, el, parentComponent, anchor);
    }
  }
  function processComponent(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    mountComponent(n2, container, parentComponent, anchor);
  }
  function mountComponent(
    vnode: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    const instance = createComponentInstance(vnode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, container, anchor);
  }

  //对于组件类型调用render 拿到vnode 树然后patch 处理，render相当于打开了一个盒子
  function setupRenderEffect(instance: any, container: any, anchor: any) {
    effect(() => {
      if (!instance.isMounted) {
        // console.log(instance.render, "11111111");
        const subTree = (instance.subTree = instance?.render.call(
          instance.proxy
        ));
        console.log(container);
        //vnode树 -> patch
        patch(null, subTree, container, instance, anchor);
        // console.log(instance, subTree, "121221211212221212");
        instance.vnode.el = subTree.el;
        instance.isMounted = true;
      } else {
        const subTree = instance?.render.call(instance.proxy);
        const prevSubTree = instance.subTree;
        instance.subTree = subTree;
        patch(prevSubTree, subTree, container, instance, anchor);
      }
    });
  }

  return {
    createApp: createAppAPI(render),
  };
}
