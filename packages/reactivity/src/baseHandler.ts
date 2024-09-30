import { isObject } from "@vue/shared";
import { track, trigger } from "./reactiveEffect";
import { reactive } from "./reactive";
import { ReactiveFlags } from "./constants";

export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    track(target, key);
    let res = Reflect.get(target, key, receiver);
    if (isObject(res)) {
      return reactive(res);
    }
    //取值的时候应该让响应式属性和effect映射起来
    //这里为啥要使用Reflect.get
    // 主要的原因是 如 果有这么一个target obj = {name:'zhangsan',get alizeName(){return this.name+'12121'}}}
    // 这个使用使用proxy 访问alizeName ，如果不是使用Reflect.get的话，this的指向就不是proxy,也就说name的属性访问是不会收集依赖的，所以这个时候需要把this的指向改为proxy
    // Reflect 正好解决了这个问题，mdn 对于第三个参数的解释如下：如果target对象中指定了getter，receiver则为getter调用时的this值。
    return res;
  },
  set(target, key, value, receiver) {
    let oldValue = target[key];
    let result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key, value, oldValue);
      //如果新值和旧值不相等，则重新执行effect
    }
    //重新执行effect
    return result;
  },
};
