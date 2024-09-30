import { isFunction } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { trackRefValue, triggerRefValue } from "./ref";

class ComputedRefImpl {
  public _value;
  public effect;
  public dep;
  constructor(public getter, public setter) {
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => {
        triggerRefValue(this);
      }
    );
  }

  get value() {
    if (this.effect.dirty) {
      this._value = this.effect.run();
      trackRefValue(this);
    }

    return this._value;
  }
  set value(newValue) {
    this.setter(newValue);
  }
}

export function computed(getterOptions) {
  let onlyGetter = isFunction(getterOptions);
  let getter;
  let setter;
  if (onlyGetter) {
    getter = getterOptions;
    setter = () => {};
  } else {
    getter = getterOptions.get;
    setter = getterOptions.set || (() => {});
  }
  return new ComputedRefImpl(getter, setter);
}
