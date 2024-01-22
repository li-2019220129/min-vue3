import { effectActive } from "./effect";
import { reactive } from "./reactive";
import { isObject } from "./utils";

//vue3对于基本数据类型要实现响应式，需要使用ref包装，vue2不需要是因为本身就放在data对象里面
class RefClass {
  deps: Set<any>;
  _v_isRef = true;
  constructor(private _value: any) {
    this._value = _value;
    this.deps = new Set();
  }
  get value(): any {
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
    if (newVal === this._value) return;
    this._value = newVal;
    this.deps.forEach((dep) => dep.run());
  }
}

export function ref(value: any) {
  const ref = new RefClass(value);
  return ref;
}

export function isRef(value: any) {
  return !!value?._v_isRef;
}

export function unRef(value: any) {
  return isRef(value) ? value.value : value;
}

//代理对象本质上就是源对象的基础上做了一次代理
//不过你可以去操作源对象的字段做些其他处理然后返回处理好的代理对象，当然你修改值也会对源对象有影响
export function proxyRefs(value: any) {
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
