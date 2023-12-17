import { effectActive } from "./effect";

const targetMap = new WeakMap();
function track(target: any, key: string | symbol) {
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

function trigger<T>(target: T, key: string | symbol) {
  let depsMap = targetMap.get(target as object);
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

export function reactive<T extends object>(obj: T): T {
  const proxy = new Proxy(obj, {
    get(target, key) {
      const res = Reflect.get(target, key);

      //收集依赖
      track(target, key);

      return res;
    },
    set(target, key, val) {
      if (Reflect.get(target, key) === val) return true;
      Reflect.set(target, key, val);
      //触发依赖
      trigger<T>(target, key);
      return true;
    },
  });
  return proxy;
}
