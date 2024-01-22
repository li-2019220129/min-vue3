import { createRenderer } from "../runtime-core/index";

function createElement(type: any) {
  return document.createElement(type);
}

function patchProp(el: any, key: any, value: any) {
  const isOn = /^on[A-Z]/.test(key);
  if (isOn) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, value);
  } else {
    el.setAttribute(key, value);
  }
}

function insert(el: any, parent: any) {
  parent.append(el);
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
});

export function createApp(...args: any[]) {
  return renderer.createApp(...args);
}
export * from "../runtime-core";
