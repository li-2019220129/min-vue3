import { shallowReadonly } from "../reactive/reactive";
import { isObject } from "../reactive/utils";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandle } from "./componentPublicInstance";
import { emit } from "./componentEmit";
import { initSlots } from "./componentSlots";
export function createComponentInstance(vnode: any) {
  const component = {
    type: vnode.type,
    vnode,
    props: {},
    emit: () => {},
    slots: {},
    setupState: {},
  };
  component.emit = emit.bind(null, component) as any;
  return component;
}

export function setupComponent(instance: any) {
  initProps(instance, instance.vnode.props);
  initSlots(instance, instance.vnode.children);
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type;
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandle);
  const { setup } = Component;
  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance: any, setupResult: any) {
  if (typeof setupResult === "function") {
    // setupResult(setupResult.context);
  } else if (isObject(setupResult)) {
    instance.setupState = setupResult;
  } else {
    console.warn("setup函数返回值不合法");
  }
  finishComponentSetup(instance);
}
function finishComponentSetup(instance: any) {
  const Component = instance.type;
  if (Component.render) {
    instance.render = Component.render;
  }
}
