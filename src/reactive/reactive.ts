import { createGetter, createSetter } from "./utils";

const get = createGetter();
const readonlyGet = createGetter(true);
const mutableHandles = {
  get,
  set: createSetter(),
};

const readonlyHandles = {
  get: readonlyGet,
  set: () => {
    return true;
  },
};

export function reactive<T extends object>(obj: T): T {
  const proxy = new Proxy(obj, mutableHandles);
  return proxy as T;
}

export function readonly<T extends Object>(obj: T): T {
  return new Proxy(obj, readonlyHandles) as T;
}
