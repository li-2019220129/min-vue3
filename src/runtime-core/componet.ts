import { isObject } from "../reactive/utils";
export function createComponentInstance(vnode: any) {
  const component = {
    type: vnode.type,
    vnode,
  };
  return component;
}

export function setupComponent(instance: any) {
  //initProps(component);
  //initSlots(component);
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type;
  const { setup } = Component;
  if (setup) {
    const setupResult = setup(instance.vnode.props, instance.vnode.context);
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
