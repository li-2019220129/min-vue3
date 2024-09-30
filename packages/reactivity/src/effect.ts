import { DirtyLevels } from "./constants";

export function effect(fn, options?) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();

  if (options?.scheduler) {
    Object.assign(_effect, options);
  }
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
export let activeEffect;
export class ReactiveEffect {
  _dirtyLevel = DirtyLevels.Dirty;
  _trackId = 0; // 记录当前effect 执行了几次
  deps = [];
  _depsLength = 0;
  _running = 0; //在effect 内部更改依赖的数据的值会造成死循环，所以加个这变量来控制
  public active = true;
  constructor(public fn, public scheduler) {}
  get dirty() {
    return this._dirtyLevel === DirtyLevels.Dirty;
  }
  set dirty(value) {
    this._dirtyLevel = value ? DirtyLevels.Dirty : DirtyLevels.NoDirty;
  }
  run() {
    this._dirtyLevel = DirtyLevels.NoDirty;
    if (!this.active) {
      return this.fn();
    }
    //类似于vue2 的pushTarget
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      preCleanEffect(this);
      this._running++;
      return this.fn();
    } finally {
      this._running--;
      postCleanEffect(this);
      activeEffect = lastEffect;
    }
  }
  stop() {
    if (this.active) {
      this.active = false;
      preCleanEffect(this);
      postCleanEffect(this);
    }
  }
}
function postCleanEffect(effect) {
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect); //删除映射表中的effect
    }
    effect.deps.length = effect._depsLength;
  }
}
function preCleanEffect(effect) {
  effect._depsLength = 0;
  effect._trackId++;
}
function cleanDepEffect(dep, effect) {
  dep.delete(effect);
  if (dep.size === 0) {
    dep.cleanup();
  }
}
export function tarckEffect(effect, dep) {
  //effect里面属性多次使用，不需要多次set，所以通过_trackId来判断
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId);
    //这块做个类似diff的比较
    //{flag， name ，a}   {flag}
    //effect里面可能会出现条件判断，所以有的属性的收集的依赖应该清除，所以需要先执行precleanEffect

    //dep 会收集effect ，同时也要让effect 收集dep
    const oldDep = effect.deps[effect._depsLength];
    if (oldDep !== dep) {
      if (oldDep) {
        // oldDep.cleanup();
        cleanDepEffect(oldDep, effect);
      }
      effect.deps[effect._depsLength++] = dep;
    } else {
      effect._depsLength++;
    }
  }
}

export function triggerEffects(dep) {
  for (const effect of dep.keys()) {
    if (effect._dirtyLevel < DirtyLevels.Dirty) {
      effect._dirtyLevel = DirtyLevels.Dirty;
    }
    if (effect._running === 0) {
      if (effect.scheduler) {
        effect.scheduler();
      }
    }
  }
}
