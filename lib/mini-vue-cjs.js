'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
const shallowReadonlyHandles = Object.assign(Object.assign({}, readonlyHandles), { get: shallowReadonlyGet });
function reactive(obj) {
    const proxy = new Proxy(obj, mutableHandles);
    return proxy;
}
function readonly(obj) {
    return new Proxy(obj, readonlyHandles);
}
function shallowReadonly(obj) {
    if (!isObject(obj)) {
        console.warn(`target is not an object`);
        return obj;
    }
    return new Proxy(obj, shallowReadonlyHandles);
}

const targetMap = new WeakMap();
function createGetter(readOnly = false, shallowReadonly = false) {
    return function (target, key) {
        //通过枚举来key来判断是否是reactive和readonly
        if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return readOnly;
        }
        else if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
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
        if (Reflect.get(target, key) === val)
            return true;
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
                if ((_a = item.options) === null || _a === void 0 ? void 0 : _a.scheduler) {
                    (_b = item.options) === null || _b === void 0 ? void 0 : _b.scheduler();
                }
                else {
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

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOT_CHILDREN"] = 16] = "SLOT_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlags: getShapeFlag(type),
        el: null,
    };
    if (typeof children === "string") {
        vnode.shapeFlags |= ShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlags |= ShapeFlags.ARRAY_CHILDREN;
    }
    if (vnode.shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
        if (isObject(children)) {
            vnode.shapeFlags |= ShapeFlags.SLOT_CHILDREN;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? ShapeFlags.ELEMENT
        : ShapeFlags.STATEFUL_COMPONENT;
}
// type A = number | string | boolean | undefined | null;
// interface B {
//   a: number;
//   b: string;
//   c: boolean;
// }
// type Exclude<T, K> = T extends K[keyof K] ? never : T;
// let a: Exclude<A, B> = undefined;

function initProps(instance, props) {
    // console.log(typeof props, "00008888888");
    instance.props = props || {};
}

const map = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
};
const PublicInstanceProxyHandle = {
    get({ _: instance }, key) {
        var _a, _b;
        const mapObject = map[key];
        if (mapObject) {
            return mapObject(instance);
        }
        return ((_a = instance.setupState) === null || _a === void 0 ? void 0 : _a[key]) || ((_b = instance.props) === null || _b === void 0 ? void 0 : _b[key]);
    },
};

function emit(instance, event, ...args) {
    const { props } = instance;
    const capilalize = (str) => {
        return str.replace(/(?:^|-)(\w)/g, (_, group1) => group1.toUpperCase());
    };
    const toHandlerKey = (str) => {
        return str ? "on" + capilalize(str) : "";
    };
    const handleName = toHandlerKey(event);
    console.log(handleName, "toHandleey");
    const handler = props[handleName];
    handler && handler(...args);
}

// {
function initSlots(instance, children) {
    if (instance.vnode.shapeFlags & ShapeFlags.SLOT_CHILDREN) {
        const slots = {};
        for (const key in children) {
            const value = children[key];
            slots[key] = (props) => Array.isArray(value(props)) ? value(props) : [value(props)];
        }
        instance.slots = slots;
    }
    //   instance.slots = Array.isArray(children) ? children : [children];
}

function createComponentInstance(vnode) {
    const component = {
        type: vnode.type,
        vnode,
        props: {},
        emit: () => { },
        slots: {},
        setupState: {},
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
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
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "function") ;
    else if (isObject(setupResult)) {
        instance.setupState = setupResult;
    }
    else {
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
    //判断传进来的vnode的类型，由createVNode函数创建的vnode类型是element还是component类型然后做不同的处理
    if (vnode.shapeFlags & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
    }
    else if (vnode.shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container);
    }
}
//vnode 类型是element
function processElement(vnode, container) {
    mountElement(vnode, container);
}
//对element类型传进来的props 和 children 做处理，children
//有可能是文本也有可能是element 也有可能是component,所以需要再次patch
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    vnode.el = el;
    const { children } = vnode;
    if (vnode.shapeFlags & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children;
    }
    else if (vnode.shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, el);
    }
    let keys = Object.keys(vnode.props);
    keys.forEach((key) => {
        const value = vnode.props[key];
        const isOn = /^on[A-Z]/.test(key);
        if (isOn) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, value);
        }
        else {
            el.setAttribute(key, value);
        }
    });
    container.append(el);
}
//对于element 的子元素做处理
function mountChildren(vnode, el) {
    for (let item of vnode.children) {
        patch(item, el);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
//对于组件类型调用render 拿到vnode 树然后patch 处理，render相当于打开了一个盒子
function setupRenderEffect(instance, container) {
    console.log(instance.render, "11111111");
    const subTree = instance === null || instance === void 0 ? void 0 : instance.render.apply(instance.proxy);
    console.log(container);
    //vnode树 -> patch
    patch(subTree, container);
    console.log(instance, subTree, "121221211212221212");
    instance.vnode.el = subTree.el;
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

function renderSlots(slots, key, row) {
    const slot = slots[key];
    console.log(slot(row));
    //   const children = slots[key] ? slots[key](row) : [];
    if (slot) {
        if (typeof slot === "function") {
            return createVNode("div", {}, slot(row));
        }
    }
}

exports.createApp = createApp;
exports.h = h;
exports.renderSlots = renderSlots;
