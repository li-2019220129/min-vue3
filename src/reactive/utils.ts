import { effectActive } from "./effect";

const targetMap = new WeakMap();
export function track(target: object, key: string | symbol) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }
  if (!effectActive) return;
  deps.add(effectActive);
  effectActive._deps.add(deps);
}

export function trigger(target: object, key: string | symbol) {
  let depsMap = targetMap.get(target);
  if (depsMap) {
    let deps = depsMap.get(key);
    if (deps) {
      deps.forEach((item: any) => {
        if (item.options?.scheduler) {
          item.options?.scheduler();
        } else {
          item.run();
        }
      });
    }
  }
}

export const createGetter = (readOnly = false) => {
  return function (target: object, key: string | symbol) {
    const res = Reflect.get(target, key);
    if (!readOnly) {
      //收集依赖
      track(target, key);
    }
    return res;
  };
};

export const createSetter = () => {
  return function (target: object, key: string | symbol, val: any) {
    if (Reflect.get(target, key) === val) return true;
    Reflect.set(target, key, val);
    //触发依赖
    trigger(target, key);
    return true;
  };
};
