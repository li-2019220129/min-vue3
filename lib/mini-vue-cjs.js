"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

function createVNode(type, props, children) {
  const vnode = {
    type,
    props,
    children,
  };
  return vnode;
}

const get = createGetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const mutableHandles = {
  get,
  set: createSetter(),
};
const readonlyHandles = {
  get: readonlyGet,
  set: (target, key, val) => {
    console.warn(`Cannot set ${key} on readonly object`);
    return true;
  },
};
Object.assign(Object.assign({}, readonlyHandles), { get: shallowReadonlyGet });
function reactive(obj) {
  const proxy = new Proxy(obj, mutableHandles);
  return proxy;
}
function readonly(obj) {
  return new Proxy(obj, readonlyHandles);
}

const targetMap = new WeakMap();
function createGetter(readOnly = false, shallowReadonly = false) {
  return function (target, key) {
    //通过枚举来key来判断是否是reactive和readonly
    if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
      return readOnly;
    } else if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
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
      //收集依赖
      track(target, key);
    }
    return res;
  };
}
function createSetter() {
  return function (target, key, val) {
    if (Reflect.get(target, key) === val) return true;
    Reflect.set(target, key, val);
    //触发依赖
    trigger(target, key);
    return true;
  };
}
function track(target, key) {
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
  return;
}
function trigger(target, key) {
  let depsMap = targetMap.get(target);
  if (depsMap) {
    let deps = depsMap.get(key);
    if (deps) {
      deps.forEach((item) => {
        var _a, _b;
        if (
          (_a = item.options) === null || _a === void 0 ? void 0 : _a.scheduler
        ) {
          (_b = item.options) === null || _b === void 0
            ? void 0
            : _b.scheduler();
        } else {
          item.run();
        }
      });
    }
  }
}
//isObject
function isObject(val) {
  return val !== null && typeof val === "object";
}

function createComponentInstance(vnode) {
  const component = {
    type: vnode.type,
    vnode,
  };
  return component;
}
function setupComponent(instance) {
  //initProps(component);
  //initSlots(component);
  setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
  const Component = instance.type;
  const { setup } = Component;
  if (setup) {
    const setupResult = setup(instance.vnode.props, instance.vnode.context);
    handleSetupResult(instance, setupResult);
  }
}
function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === "function");
  else if (isObject(setupResult)) {
    instance.setupState = setupResult;
  } else {
    console.warn("setup函数返回值不合法");
  }
  finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
  const Component = instance.type;
  if (Component.render) {
    instance.render = Component.render;
  }
}

function render(vnode, container) {
  //调用patch
  patch(vnode, container);
}
function patch(vnode, container) {
  processComponent(vnode, container);
}
function processComponent(vnode, container) {
  mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
  console.log(instance.render, "11111111");
  const subTree =
    instance === null || instance === void 0 ? void 0 : instance.render();
  console.log(container);
  //vnode树 -> patch
  patch(subTree, container);
}

//createApp ,vue3 导出的方法，用于接收一个根组件然后用mount方法进行挂载到app元素上
function createApp(rootComponent) {
  return {
    mount(rootEl) {
      if (typeof rootEl === "string") {
        rootEl = document.querySelector(rootEl);
      }
      const vnode = createVNode(rootComponent);
      render(vnode, rootEl);
    },
  };
}

function h(type, props, children) {
  return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
