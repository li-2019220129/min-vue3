import { isFunction, isObject } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";
import { isRef } from "./ref";

export function watch(source, cb, options) {
  //watchEffect 也是基于这个来实现的
  return doWatch(source, cb, options);
}
export function watchEffect(getter, options = {}) {
  doWatch(getter, null, options as any);
}
function traverse(source, depth, currentDepth = 0, seen = new Set()) {
  if (isObject(source)) {
    return source;
  }

  if (seen.has(source)) return source;
  if (depth) {
    if (currentDepth >= depth) {
      return source;
    }
  }
  currentDepth++;
  for (let key in source) {
    traverse(source[key], depth, currentDepth, seen);
  }
  return source;
}
function doWatch(
  source,
  cb,
  { deep, immediate } = { deep: false, immediate: false }
) {
  // source ? -> getter
  const reactiveGetter = (source) =>
    traverse(source, deep === false ? 1 : undefined);

  let getter;
  if (isReactive(source)) {
    getter = () => reactiveGetter(source);
  } else if (isRef(source)) {
    getter = () => source.value;
  } else if (isFunction(source)) {
    getter = source;
  }
  let oldValue;
  let clean;
  const onCleanup = (fn) => {
    clean = () => {
      fn();
      clean = undefined;
    };
  };
  let job = () => {
    if (cb) {
      let newValue = effect.run();
      if (clean) {
        clean();
      }
      cb(newValue, oldValue, onCleanup);
      oldValue = newValue;
    } else {
      effect.run();
    }
  };

  let effect = new ReactiveEffect(getter, job);
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect.run();
    }
  } else {
    effect.run();
  }
  const unwatch = () => {
    effect.stop();
  };
  return unwatch;
}
