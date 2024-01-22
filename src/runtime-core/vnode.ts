import { isObject } from "../reactive/utils";
import { ShapeFlags } from "../shared/index";

export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");

export function createVNode(type: any, props?: any, children?: any) {
  const vnode = {
    type,
    props,
    children,
    shapeFlags: getShapeFlag(type),
    el: null,
  };
  if (typeof children === "string") {
    vnode.shapeFlags |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlags |= ShapeFlags.ARRAY_CHILDREN;
  }
  if (vnode.shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
    if (isObject(children)) {
      vnode.shapeFlags |= ShapeFlags.SLOT_CHILDREN;
    }
  }
  return vnode;
}

export function createTextVNode(text: string) {
  return createVNode(Text, {}, text);
}

function getShapeFlag(type: any) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
// type A = number | string | boolean | undefined | null;
// interface B {
//   a: number;
//   b: string;
//   c: boolean;
// }
// type Exclude<T, K> = T extends K[keyof K] ? never : T;
// let a: Exclude<A, B> = undefined;
