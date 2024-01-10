// import { effect } from "./effect";
import { ReactiveEffect } from "./effect";
//计算属性原理关键还是dirty这个还有ReactiveEffect的scheduler
class Computed {
  private dirty = true;
  public _value: any;
  public effect: any;
  constructor(fn: any) {
    this.effect = new ReactiveEffect(fn, {
      scheduler: () => {
        this.dirty = true;
      },
    });
    // this._value = this.run();
  }
  run() {
    return this.effect.run();
  }
  get value() {
    if (this.dirty) {
      this._value = this.run();
      this.dirty = false;
    }
    return this._value;
  }
}

export function computed(fn: any) {
  return new Computed(fn);
}
