import { effectActive } from "./effect";
import { reactive, readonly } from "./reactive";

const targetMap = new WeakMap();

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}
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

//isObject
export function isObject(val: any) {
  return val !== null && typeof val === "object";
}

export const createGetter = (readOnly = false, shallowReadonly = false) => {
  return function (target: object, key: string | symbol) {
    //通过枚举来key来判断是否是reactive和readonly
    if (key === ReactiveFlags.IS_READONLY) {
      return readOnly;
    } else if (key === ReactiveFlags.IS_REACTIVE) {
      return !readOnly;
    }
    let res = Reflect.get(target, key);
    //对于嵌套对象也要去执行reactive去给他转成Proxy对象
    if (isObject(res)) {
      if (!shallowReadonly) {
        res = readOnly ? readonly(res) : reactive(res);
      }
    }
    if (!readOnly) {
      //另一种判断stop后再调run方法不要收集依赖
      // console.log(effectActive?.active);
      if (effectActive?.active) return res;
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

export function isReadonly(target: any) {
  return !!target[ReactiveFlags.IS_READONLY];
}

export function isReactive(target: any) {
  return !!target[ReactiveFlags.IS_REACTIVE];
}

export function isProxy(target: any) {
  return isReactive(target) || isReadonly(target);
}
