import { createGetter, createSetter } from "./utils";

const get = createGetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const mutableHandles = {
  get,
  set: createSetter(),
};

const readonlyHandles = {
  get: readonlyGet,
  set: (target: Object, key: string | symbol, val: any) => {
    console.warn(`Cannot set ${key as string} on readonly object`);
    return true;
  },
};

const shallowReadonlyHandles = {
  ...readonlyHandles,
  get: shallowReadonlyGet,
};

export function reactive<T extends object>(obj: T): T {
  const proxy = new Proxy(obj, mutableHandles);
  return proxy as T;
}

export function readonly<T extends Object>(obj: T): T {
  return new Proxy(obj, readonlyHandles) as T;
}

export function shallowReadonly<T extends Object>(obj: T): T {
  return new Proxy(obj, shallowReadonlyHandles) as T;
}
