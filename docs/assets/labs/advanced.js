/* advanced.html 实验室引擎 */
"use strict";
(function initComputed() {
  var consoleEl = $("compConsole");
  if (!consoleEl) return;
  var log = mkLog(consoleEl);
  var valEl = $("compVal"), runsEl = $("compRuns"), countEl = $("compCount");
  var lampD = $("compLamp"), lampC = $("compLamp2");
  var world, count, getterRuns, double;

  function ui() {
    var dirty = double.effect._dirtyLevel === DIRTY;
    valEl.querySelector(".v").textContent = dirty ? "？（脏）" : double.value;
    runsEl.querySelector(".v").textContent = getterRuns;
    countEl.querySelector(".v").textContent = count.value;
    lampD.style.display = dirty ? "" : "none";
    lampC.style.display = dirty ? "none" : "";
    bump(runsEl);
  }

  function reset() {
    getterRuns = 0;
    consoleEl.innerHTML = "";
    log("sys", "const count = ref(1)");
    log("sys", "const double = computed(() => count.value * 2)  // getter 里带计数器");
    world = createWorld({
      onRefTrigger: function (label) { log("trig", label + ".value 被修改 → 找到订阅者：computed 内部的 effect"); }
    });
    count = world.ref(1, "count");
    double = world.computed(function () {
      getterRuns++;
      var r = count.value * 2;
      log("run", "getter 第 " + getterRuns + " 次执行 → count.value * 2 = " + r);
      return r;
    }, "double");
    ui();
  }

  document.querySelectorAll("[data-comp]").forEach(function (b) {
    b.addEventListener("click", function () {
      var v = b.getAttribute("data-comp");
      if (v === "reset") { reset(); return; }
      if (v === "1") {
        log("sys", "── ① 首次读取 double.value ──");
        log("info", "dirty 检查：脏 → 必须执行 getter");
        log("out", "double.value = " + double.value + "（结果已缓存）");
      } else if (v === "2") {
        log("sys", "── ② 再读一次 double.value ──");
        log("info", "dirty 检查：干净 → 直接返回缓存，getter 不执行");
        log("out", "double.value = " + double.value + "（注意 getter 执行次数没变！）");
      } else if (v === "3") {
        log("sys", "── ③ count.value = 10 ──");
        count.value = 10;
        log("info", "computed 的 scheduler：只做「标脏 + 通知下游」，并不执行 getter（偷懒成功）");
      } else if (v === "4") {
        log("sys", "── ④ 再读 double.value ──");
        log("info", "dirty 检查：脏（上一步标的）→ 这才执行 getter");
        log("out", "double.value = " + double.value + "（新结果，重新缓存）");
      }
      ui();
    });
  });
  reset();
})();

(function initNested() {
  var consoleEl = $("nestedConsole");
  if (!consoleEl) return;
  var log = mkLog(consoleEl);
  var world, outerDep, innerDep, step = 0;

  function reset() {
    step = 0;
    consoleEl.innerHTML = "";
    world = createWorld({
      onTrack: function (m, e) { log("track", "登记 " + e + " → " + m.label + "." + m.key); },
      onTrigger: function (l, k, s) { log("trig", l + "." + k + " 变化 → 通知 " + s + " 个 effect"); }
    });
    log("sys", "outer 数据 = reactive({a:1})，inner 数据 = reactive({b:1})");
    outerDep = world.reactive({ a: 1 }, "outerData");
    innerDep = world.reactive({ b: 1 }, "innerData");
  }

  function step1() {
    log("sys", "── ① effect(outer) 内部再创建 effect(inner) ──");
    world.effect(function () {
      log("run", "【outer】开始 → 暂存 lastEffect(null)，activeEffect = outer");
      log("track", "outer 读 outerData.a");
      void outerDep.a;
      // 在 outer 执行期间创建 inner effect（组件嵌套的真实场景）
      world.effect(function () {
        log("run", "【inner】开始 → 暂存 lastEffect(outer)，activeEffect = inner");
        void innerDep.b;
        log("run", "【inner】结束 → 还原 activeEffect = outer ✓");
      }, "inner");
      log("run", "【outer】继续执行剩余代码（依赖仍正确登记在 outer 名下）");
      log("run", "【outer】结束 → 还原 activeEffect = null ✓");
    }, "outer");
    log("info", "看依赖地图：outerData.a 属于 outer，innerData.b 属于 inner —— 零错乱");
  }

  function step2() {
    log("sys", "── ② innerData.b = 2 ──");
    innerDep.b = 2;
    log("out", "只有 inner 重跑，outer 纹丝不动 ✓");
  }

  function step3() {
    log("sys", "── ③ outerData.a = 2 ──");
    outerDep.a = 2;
    log("out", "outer 重跑 → inner 作为「outer 期间创建的 effect」也执行了一遍（同真实组件：父渲染会重走子创建）");
    log("info", "注意：inner 是在 outer 的 fn 里创建的，outer 每次重跑都会重新创建 inner —— 这正是组件渲染函数里创建子组件 effect 的行为模型");
  }

  $("nestedSteps").addEventListener("click", function (e) {
    var b = e.target.closest(".step-btn");
    if (!b) return;
    var v = b.getAttribute("data-nested");
    if (v === "reset") { reset(); return; }
    if (v === "1" && step < 1) { step = 1; step1(); }
    else if (v === "2" && step === 1) { step = 2; step2(); }
    else if (v === "3" && step === 2) { step = 3; step3(); }
  });
  reset();
})();

(function initCustomRef() {
  var input = $("crInput"), consoleEl = $("crConsole");
  if (!input) return;
  var log = mkLog(consoleEl);
  var viewEl = $("crView"), trigEl = $("crTrig"), inEl = $("crInput2");
  var inner = "", inputs = 0, triggers = 0, timer = null;

  function update() {
    viewEl.querySelector(".v").textContent = inner || "（空）";
    trigEl.querySelector(".v").textContent = triggers;
    inEl.querySelector(".v").textContent = inputs;
  }
  input.addEventListener("input", function () {
    inputs++;
    var val = input.value;
    log("info", "set('" + (val || "") + "') → clearTimeout + 600ms 后才 trigger");
    clearTimeout(timer);
    timer = setTimeout(function () {
      inner = val;
      triggers++;
      log("trig", "600ms 到 → trigger() → 界面更新为「" + (inner || "（空）") + "」");
      update();
    }, 600);
    update();
  });
  log("sys", "customRef 防抖逻辑已就绪：快速连续输入，trigger 会被不断推迟");
  update();
})();
