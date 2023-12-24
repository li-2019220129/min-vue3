export let effectActive: InstanceType<typeof ReactiveEffect> | null;

class ReactiveEffect {
  public _deps: Set<Set<InstanceType<typeof ReactiveEffect>>>;
  public active: Boolean;
  constructor(public fn: Function, public options?: any) {
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
    this.active = true;
    if (this._deps.size > 0) {
      this._deps.forEach((dep) => {
        dep.delete(this);
      });
      this._deps.clear();
    }
    if (this.options?.onStop) this.options.onStop();
  }
}

export function effect(fn: Function, options?: any) {
  const effect = new ReactiveEffect(fn, options);
  effect.run();
  const runner = () => {
    return effect.run();
  };
  runner.effect = effect;
  return runner;
}

export function stop(runner: Function) {
  if ((runner as any).effect) {
    (runner as any).effect.stop();
  }
}
