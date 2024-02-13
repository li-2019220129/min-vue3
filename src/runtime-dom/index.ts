import { createRenderer } from "../runtime-core/index";

function createElement(type: any) {
  return document.createElement(type);
}

function patchProp(el: any, key: any, prevValue: any, nextValue: any) {
  const isOn = /^on[A-Z]/.test(key);
  if (isOn) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, nextValue);
  } else {
    if (nextValue === undefined || nextValue === null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, nextValue);
    }
  }
}

function insert(el: any, parent: any, anchor: any = null) {
  // parent.append(el);
  parent.insertBefore(el, anchor);
}
function remove(el: any) {
  const parent = el.parentNode;
  parent?.removeChild(el);
}
function setElementText(el: any, text: any) {
  el.textContent = text;
}
const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
});

export function createApp(...args: any[]) {
  return renderer.createApp(...args);
}
export * from "../runtime-core";
