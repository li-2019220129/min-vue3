export function createVNode(type: any, props?: any, children?: any) {
  const vnode = {
    type,
    props,
    children,
  };
  return vnode;
}

// type A = number | string | boolean | undefined | null;
// interface B {
//   a: number;
//   b: string;
//   c: boolean;
// }
// type Exclude<T, K> = T extends K[keyof K] ? never : T;
// let a: Exclude<A, B> = undefined;
