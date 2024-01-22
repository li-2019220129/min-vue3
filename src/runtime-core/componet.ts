import { shallowReadonly } from "../reactive/reactive";
import { isObject } from "../reactive/utils";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandle } from "./componentPublicInstance";
import { emit } from "./componentEmit";
import { initSlots } from "./componentSlots";
import { proxyRefs } from "../reactive/ref";
export function createComponentInstance(vnode: any, parent: any) {
  const component = {
    type: vnode.type,
    vnode,
    props: {},
    emit: () => {},
    slots: {},
    provides: parent ? parent.provides : {}, //获取 parent 的 provides 作为当前组件的初始化值 这样就可以继承 parent.provides 的属性了
    parent,
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
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });
    setCurrentInstance(null);
    handleSetupResult(instance, setupResult);
  }
}

function setCurrentInstance(instance: any) {
  currentInstance = instance;
}
function handleSetupResult(instance: any, setupResult: any) {
  if (typeof setupResult === "function") {
    // setupResult(setupResult.context);
  } else if (isObject(setupResult)) {
    // 返回的是一个对象的话
    // 先存到 setupState 上
    // 先使用 @vue/reactivity 里面的 proxyRefs
    // 后面我们自己构建
    // proxyRefs 的作用就是把 setupResult 对象做一层代理
    // 方便用户直接访问 ref 类型的值
    // 比如 setupResult 里面有个 count 是个 ref 类型的对象，用户使用的时候就可以直接使用 count 了，而不需要在 count.value
    // 这里也就是官网里面说到的自动结构 Ref 类型
    instance.setupState = proxyRefs(setupResult);
  } else {
    // console.warn("setup函数返回值不合法");
  }
  finishComponentSetup(instance);
}
function finishComponentSetup(instance: any) {
  const Component = instance.type;
  if (Component.render) {
    instance.render = Component.render;
  }
}

let currentInstance: any = null;
export function getCurrentInstance() {
  return currentInstance;
}
