export let effectActive: InstanceType<typeof ReactiveEffect> | null;

class ReactiveEffect {
  public _deps: Set<Set<InstanceType<typeof ReactiveEffect>>>;
  constructor(public fn: Function, public options?: any) {
    this.fn = fn;
    this.options = options;
    this._deps = new Set();
  }
  run() {
    effectActive = this;
    const res = this.fn();
    effectActive = null;
    return res;
  }
  stop() {
    if (this._deps.size > 0) {
      this._deps.forEach((dep) => {
        dep.delete(this);
      });
      this._deps.clear();
    }
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
