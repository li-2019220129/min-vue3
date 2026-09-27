/* ============================================================
   实验室共享工具：$ / mkLog / bump + 带探针的 mini 响应式引擎
   ============================================================ */
"use strict";
"use strict";

/* ---------------- 小工具 ---------------- */
function $(id) { return document.getElementById(id); }
function mkLog(el) {
  return function (type, msg) {
    var line = document.createElement("span");
    line.className = "line l-" + type;
    var badgeCls = { sys: "b-sys", run: "b-run", track: "b-track", trig: "b-trig",
                     clean: "b-clean", out: "b-out", info: "b-info" }[type] || "b-info";
    var badgeName = { sys: "系统", run: "执行", track: "track", trig: "trigger",
                      clean: "cleanup", out: "输出", info: "解说" }[type] || type;
    line.innerHTML = '<span class="badge ' + badgeCls + '">' + badgeName + '</span>' + msg;
    el.appendChild(line);
    el.scrollTop = el.scrollHeight;
  };
}
function bump(el) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }

/* ============================================================
   带探针的 mini 响应式引擎（与 packages/reactivity 源码同构）
   ============================================================ */
var DIRTY = 4;
function createWorld(hooks) {
  hooks = hooks || {};
  var targetMap = new WeakMap();   // raw -> depsMap(key -> dep)
  var registry = new Map();        // raw -> {label, depsMap}（仅供可视化）
  var proxyCache = new Map();      // raw -> proxy
  var activeEffect = null;

  function cleanupDep(dep, eff) {
    dep.delete(eff);
    if (dep.size === 0) dep.meta.depsMap.delete(dep.meta.key);
    if (hooks.onCleanup) hooks.onCleanup(dep.meta, eff.label);
  }

  function trackEffect(effect, dep) {
    if (dep.get(effect) !== effect._trackId) {
      dep.set(effect, effect._trackId);
      var oldDep = effect.deps[effect._depsLength];
      if (oldDep && oldDep !== dep) cleanupDep(oldDep, effect);
      effect.deps[effect._depsLength++] = dep;
      if (hooks.onTrack) hooks.onTrack(dep.meta, effect.label);
    }
  }

  function track(target, key) {
    if (!activeEffect) return;
    var depsMap = targetMap.get(target);
    var dep = depsMap.get(key);
    if (!dep) {
      dep = new Map();
      dep.meta = { depsMap: depsMap, key: key, label: registry.get(target).label };
      depsMap.set(key, dep);
    }
    trackEffect(activeEffect, dep);
  }

  function triggerEffects(dep) {
    var list = [];
    dep.forEach(function (_, eff) {
      if (eff._dirtyLevel < DIRTY) eff._dirtyLevel = DIRTY;
      if (eff._running === 0 && eff.scheduler) list.push(eff);
    });
    return list;
  }

  function trigger(target, key) {
    var depsMap = targetMap.get(target);
    if (!depsMap || !depsMap.has(key)) {
      if (hooks.onTriggerMiss) hooks.onTriggerMiss(registry.get(target).label, key);
      return;
    }
    var dep = depsMap.get(key);
    if (hooks.onTrigger) hooks.onTrigger(registry.get(target).label, key, dep.size);
    triggerEffects(dep).forEach(function (eff) { eff.scheduler(); });
  }

  function reactive(raw, label) {
    label = label || "obj";
    if (proxyCache.has(raw)) return proxyCache.get(raw);
    var depsMap = new Map();
    targetMap.set(raw, depsMap);
    registry.set(raw, { label: label, depsMap: depsMap });
    var proxy = new Proxy(raw, {
      get: function (target, key, receiver) {
        if (key === "__v_isReactive") return true;
        track(target, key);
        var res = Reflect.get(target, key, receiver);
        if (res && typeof res === "object") return reactive(res, label + "." + key);
        return res;
      },
      set: function (target, key, value, receiver) {
        var old = target[key];
        var r = Reflect.set(target, key, value, receiver);
        if (old !== value) trigger(target, key);
        return r;
      }
    });
    proxyCache.set(raw, proxy);
    return proxy;
  }

  function RE(fn, scheduler, label) {
    this.fn = fn; this.scheduler = scheduler; this.label = label;
    this._trackId = 0; this.deps = []; this._depsLength = 0;
    this._running = 0; this._dirtyLevel = DIRTY;
  }
  RE.prototype.run = function () {
    var last = activeEffect;
    this._dirtyLevel = 0;
    activeEffect = this;
    this._trackId++; this._depsLength = 0; this._running++;
    try { return this.fn(); }
    finally {
      this._running--;
      for (var i = this._depsLength; i < this.deps.length; i++) cleanupDep(this.deps[i], this);
      this.deps.length = this._depsLength;
      activeEffect = last;
    }
  };
  Object.defineProperty(RE.prototype, "dirty", {
    get: function () { return this._dirtyLevel === DIRTY; }
  });

  function effect(fn, label) {
    var e = new RE(fn, function () { e.run(); }, label || ("effect#" + (++effectSeq)));
    e.run();
    return e;
  }
  var effectSeq = 0;

  /* ---- ref ---- */
  function ref(value, label) { return new RefImpl(value, label); }
  function RefImpl(value, label) {
    this.__v_isRef = true;
    this.label = label || "ref";
    this.rawValue = value;
    this._value = (value && typeof value === "object") ? reactive(value, this.label) : value;
    this.dep = null;
  }
  RefImpl.prototype.trackSelf = function () {
    if (!activeEffect) return;
    if (!this.dep) {
      this.dep = new Map();
      this.dep.meta = { label: this.label, key: "value", depsMap: null, isRef: true };
    }
    trackEffect(activeEffect, this.dep);
  };
  RefImpl.prototype.triggerSelf = function () {
    if (!this.dep) return;
    if (hooks.onRefTrigger) hooks.onRefTrigger(this.label);
    triggerEffects(this.dep).forEach(function (eff) { eff.scheduler(); });
  };
  Object.defineProperty(RefImpl.prototype, "value", {
    get: function () { this.trackSelf(); return this._value; },
    set: function (v) {
      if (v !== this.rawValue) {
        this.rawValue = v;
        this._value = v;
        this.triggerSelf();
      }
    }
  });

  /* ---- computed ---- */
  function computed(getter, label) { return new ComputedRefImpl(getter, label); }
  function ComputedRefImpl(getter, label) {
    this.label = label || "computed";
    this.dep = null;
    this._value = undefined;
    var self = this;
    this.effect = new RE(
      function () { return getter(self._value); },
      function () {
        if (hooks.onSchedule) hooks.onSchedule(self.label);
        if (self.dep) triggerEffects(self.dep).forEach(function (eff) { eff.scheduler(); });
      },
      label || "computed.effect"
    );
  }
  Object.defineProperty(ComputedRefImpl.prototype, "dirty", {
    get: function () { return this.effect._dirtyLevel === DIRTY; }
  });
  Object.defineProperty(ComputedRefImpl.prototype, "value", {
    get: function () {
      if (this.effect.dirty) this._value = this.effect.run();
      if (activeEffect) {
        if (!this.dep) {
          this.dep = new Map();
          this.dep.meta = { label: this.label, key: "value", depsMap: null, isRef: true };
        }
        trackEffect(activeEffect, this.dep);
      }
      return this._value;
    }
  });

  return { reactive: reactive, effect: effect, ref: ref, computed: computed,
           registry: registry, RE: RE };
}

/* ============================================================
   演示一：响应式实验室（track / trigger / cleanup 全流程）
   ============================================================ */
