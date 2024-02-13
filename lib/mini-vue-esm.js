let effectActive;
class ReactiveEffect {
    constructor(fn, options) {
        this.fn = fn;
        this.options = options;
        this.fn = fn;
        this.options = options;
        this._deps = new Set();
        this.active = false; // 防止stop后直接调run还会重新收集依赖的问题
    }
    run() {
        //如果active为true代表已经调过stop方法了,这个时候应该不需要赋值effectActive
        if (this.active) {
            this.fn();
            return;
        }
        effectActive = this;
        const res = this.fn();
        effectActive = null;
        return res;
    }
    stop() {
        var _a;
        this.active = true;
        if (this._deps.size > 0) {
            this._deps.forEach((dep) => {
                dep.delete(this);
            });
            this._deps.clear();
        }
        if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.onStop)
            this.options.onStop();
    }
}
function effect(fn, options) {
    const effect = new ReactiveEffect(fn, options);
    effect.run();
    const runner = () => {
        return effect.run();
    };
    runner.effect = effect;
    return runner;
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
            //另一种判断stop后再调run方法不要收集依赖
            // console.log(effectActive?.active);
            if (effectActive === null || effectActive === void 0 ? void 0 : effectActive.active)
                return res;
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
    if (!effectActive)
        return;
    deps.add(effectActive);
    effectActive._deps.add(deps);
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

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        key: props === null || props === void 0 ? void 0 : props.key,
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
function createTextVNode(text) {
    return createVNode(Text, {}, text);
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

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, key, row) {
    const slot = slots[key];
    console.log(slot(row));
    //   const children = slots[key] ? slots[key](row) : [];
    if (slot) {
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(row));
        }
    }
}

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
        var _a, _b, _c;
        const mapObject = map[key];
        if (mapObject) {
            return mapObject(instance);
        }
        //这块不能用 || ,因为考虑到有0的情况,所以要使用空值运算符 ??，特殊的情况做特殊处理
        return (_b = (_a = instance.setupState) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : (_c = instance.props) === null || _c === void 0 ? void 0 : _c[key];
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

//vue3对于基本数据类型要实现响应式，需要使用ref包装，vue2不需要是因为本身就放在data对象里面
class RefClass {
    constructor(_value) {
        this._value = _value;
        this._v_isRef = true;
        this._value = _value;
        this.deps = new Set();
    }
    get value() {
        let res = this._value;
        if (effectActive) {
            this.deps.add(effectActive);
            effectActive._deps.add(this.deps);
        }
        if (isObject(res)) {
            res = reactive(res);
        }
        return res;
    }
    set value(newVal) {
        if (newVal === this._value)
            return;
        this._value = newVal;
        this.deps.forEach((dep) => dep.run());
    }
}
function ref(value) {
    const ref = new RefClass(value);
    return ref;
}
function isRef(value) {
    return !!(value === null || value === void 0 ? void 0 : value._v_isRef);
}
function unRef(value) {
    return isRef(value) ? value.value : value;
}
//代理对象本质上就是源对象的基础上做了一次代理
//不过你可以去操作源对象的字段做些其他处理然后返回处理好的代理对象，当然你修改值也会对源对象有影响
function proxyRefs(value) {
    return new Proxy(value, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, newVal) {
            if (isRef(Reflect.get(target, key))) {
                return (target[key].value = newVal);
            }
            return Reflect.set(target, key, newVal);
        },
    });
}

function createComponentInstance(vnode, parent) {
    const component = {
        type: vnode.type,
        vnode,
        props: {},
        emit: () => { },
        slots: {},
        isMounted: false,
        provides: parent ? parent.provides : {}, //获取 parent 的 provides 作为当前组件的初始化值 这样就可以继承 parent.provides 的属性了
        parent,
        subTree: {},
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
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "function") ;
    else if (isObject(setupResult)) {
        // 返回的是一个对象的话
        // 先存到 setupState 上
        // 先使用 @vue/reactivity 里面的 proxyRefs
        // 后面我们自己构建
        // proxyRefs 的作用就是把 setupResult 对象做一层代理
        // 方便用户直接访问 ref 类型的值
        // 比如 setupResult 里面有个 count 是个 ref 类型的对象，用户使用的时候就可以直接使用 count 了，而不需要在 count.value
        // 这里也就是官网里面说到的自动结构 Ref 类型
        instance.setupState = proxyRefs(setupResult);
    }
    else ;
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}

function provide(key, value) {
    var _a;
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = (_a = currentInstance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        // 这里要解决一个问题
        // 当父级 key 和 爷爷级别的 key 重复的时候，对于子组件来讲，需要取最近的父级别组件的值
        // 那这里的解决方案就是利用原型链来解决
        // provides 初始化的时候是在 createComponent 时处理的，当时是直接把 parent.provides 赋值给组件的 provides 的
        // 所以，如果说这里发现 provides 和 parentProvides 相等的话，那么就说明是第一次做 provide(对于当前组件来讲)
        // 我们就可以把 parent.provides 作为 currentInstance.provides 的原型重新赋值
        // 至于为什么不在 createComponent 的时候做这个处理，可能的好处是在这里初始化的话，是有个懒执行的效果（优化点，只有需要的时候在初始化）
        if (parentProvides === provides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    //方法一，利用getProvides 一直向上找
    // const instance = getCurrentInstance();
    // if (instance) {
    //   const { parent } = instance;
    //   if (parent) {
    //     if (getProvides(name, parent)) return getProvides(name, parent);
    //     return value();
    //   }
    // }
    var _a;
    //方法二，利用原型链 一直向上找（执行效率更高）！！
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const provides = (_a = currentInstance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        if (key in provides) {
            return provides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

// import { render } from "./render";
//createApp ,vue3 导出的方法，用于接收一个根组件然后用mount方法进行挂载到app元素上
function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootEl) {
                if (typeof rootEl === "string") {
                    rootEl = document.querySelector(rootEl);
                }
                const vnode = createVNode(rootComponent);
                render(vnode, rootEl);
            },
        };
    };
}
// export function createApp(rootComponent: any) {
//   return {
//     mount(rootEl: any) {
//       if (typeof rootEl === "string") {
//         rootEl = document.querySelector(rootEl);
//       }
//       const vnode = createVNode(rootComponent);
//       render(vnode, rootEl);
//     },
//   };
// }

function createRenderer(options) {
    const { createElement, patchProp, insert, remove, setElementText: hostSetElementText, } = options;
    function render(vnode, container) {
        //调用patch
        patch(null, vnode, container, null, null);
    }
    // n1->老的vnode 节点
    // n2->新的vnode 节点
    // n1没有代表初始化，反之代表更新操作
    function patch(n1, n2, container, parentComponent, anchor) {
        if (n2.type === Fragment) {
            //Fragment -> 只渲染children
            //(使用插槽额情况组件实例children很可能是数组的情况，
            //所以需要 createn2("div", {}, slot(row))),现在通过fargment来处理
            processFragment(n1, n2, container, parentComponent, anchor);
        }
        else if (n2.type === Text) {
            processText(n1, n2, container);
        }
        else {
            //判断传进来的n2的类型，由createn2函数创建的n2类型是element还是component类型然后做不同的处理
            if (n2.shapeFlags & ShapeFlags.ELEMENT) {
                processElement(n1, n2, container, parentComponent, anchor);
            }
            else if (n2.shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(n1, n2, container, parentComponent, anchor);
            }
        }
    }
    //处理只为text文本的情况
    function processText(n1, n2, container) {
        const textVnode = (n2.el = document.createTextNode(n2.children));
        container.append(textVnode);
    }
    //processFragment
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    //vnode 类型是element
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    //更新逻辑
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log("patchElement");
        console.log("n1:", n1);
        console.log("n2:", n2);
        //更新props
        const oldProps = n1.props || {};
        const newProps = n2.props || {};
        const el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent, anchor);
        patchProps(el, oldProps, newProps);
        //更新children
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const prevShapeFlags = n1.shapeFlags;
        const { shapeFlags } = n2;
        const c2 = n2.children;
        const c1 = n1.children;
        if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlags & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(n1.children);
            }
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        }
        else {
            if (prevShapeFlags & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, "");
                mountChildren(c2, container, parentComponent, anchor);
            }
            else {
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    function isSomeVNodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        debugger;
        //左侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        //右侧
        while (e1 >= i && e2 >= i) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        if (i > e1) {
            if (i <= e2) {
                let nextPos = e2 + 1;
                let anchor = nextPos < c2.length ? c2[nextPos].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            while (i <= e1) {
                remove(c1[i].el);
                i++;
            }
        }
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            remove(el);
        }
    }
    // function patchChildren(
    //   el: any,
    //   oldChildren: any,
    //   newChildren: any,
    //   parentComponent: any
    // ) {
    //   if (oldChildren === newChildren) return;
    //   if (typeof newChildren === "string") {
    //     el.textContent = newChildren;
    //   }
    //   if (Array.isArray(newChildren) && typeof oldChildren === "string") {
    //     el.textContent = "";
    //     for (let item of newChildren) {
    //       patch(null, item, el, parentComponent);
    //     }
    //   }
    // }
    function patchProps(el, oldProps, newProps) {
        if (oldProps === newProps)
            return;
        for (let key in newProps) {
            const prevProp = oldProps[key];
            const nextProp = newProps[key];
            if (prevProp !== nextProp) {
                patchProp(el, key, prevProp, nextProp);
            }
        }
        for (let key in oldProps) {
            const prevProp = oldProps[key];
            if (!(key in newProps)) {
                patchProp(el, key, prevProp, null);
            }
        }
    }
    //对element类型传进来的props 和 children 做处理，children
    //有可能是文本也有可能是element 也有可能是component,所以需要再次patch
    function mountElement(n2, container, parentComponent, anchor) {
        const el = createElement(n2.type);
        n2.el = el;
        const { children } = n2;
        if (n2.shapeFlags & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children;
        }
        else if (n2.shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(n2.children, el, parentComponent, anchor);
        }
        let keys = Object.keys(n2.props);
        keys.forEach((key) => {
            const value = n2.props[key];
            patchProp(el, key, null, value);
        });
        insert(el, container, anchor);
    }
    //对于element 的子元素做处理
    function mountChildren(children, el, parentComponent, anchor) {
        for (let item of children) {
            patch(null, item, el, parentComponent, anchor);
        }
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {
        mountComponent(n2, container, parentComponent, anchor);
    }
    function mountComponent(vnode, container, parentComponent, anchor) {
        const instance = createComponentInstance(vnode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, container, anchor);
    }
    //对于组件类型调用render 拿到vnode 树然后patch 处理，render相当于打开了一个盒子
    function setupRenderEffect(instance, container, anchor) {
        effect(() => {
            if (!instance.isMounted) {
                // console.log(instance.render, "11111111");
                const subTree = (instance.subTree = instance === null || instance === void 0 ? void 0 : instance.render.call(instance.proxy));
                console.log(container);
                //vnode树 -> patch
                patch(null, subTree, container, instance, anchor);
                // console.log(instance, subTree, "121221211212221212");
                instance.vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const subTree = instance === null || instance === void 0 ? void 0 : instance.render.call(instance.proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        });
    }
    return {
        createApp: createAppAPI(render),
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevValue, nextValue) {
    const isOn = /^on[A-Z]/.test(key);
    if (isOn) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextValue);
    }
    else {
        if (nextValue === undefined || nextValue === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextValue);
        }
    }
}
function insert(el, parent, anchor = null) {
    // parent.append(el);
    parent.insertBefore(el, anchor);
}
function remove(el) {
    const parent = el.parentNode;
    parent === null || parent === void 0 ? void 0 : parent.removeChild(el);
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

function add(a, b) {
    return a + b;
}

export { add, createApp, createRenderer, createTextVNode, getCurrentInstance, h, inject, provide, reactive, readonly, ref, renderSlots };
