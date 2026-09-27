/* reactivity.html 实验室引擎 */
"use strict";
(function initLab() {
  var consoleEl = $("labConsole"), mapEl = $("labMap");
  var viewEl = $("labView"), runsEl = $("labRuns"), tipEl = $("labTip");
  if (!consoleEl) return;
  var log = mkLog(consoleEl);
  var world, state, view = "（未渲染）", runs = 0, stepDone = 0;
  var flashKey = null, flashTarget = null;

  function renderMap() {
    var html = '<div class="map-root">🗂 targetMap（WeakMap）';
    world.registry.forEach(function (entry) {
      var tCls = flashTarget === entry.label ? "flash-del" : "";
      html += '<div class="map-target ' + tCls + '"><div class="t-label">📦 ' + entry.label + "（reactive 对象）</div>";
      if (entry.depsMap.size === 0) html += '<div class="map-empty">（还没有任何依赖登记）</div>';
      entry.depsMap.forEach(function (dep, key) {
        var fx = "";
        dep.forEach(function (_, eff) { fx += '<span class="fx">' + eff.label + "</span>"; });
        var kCls = flashKey === key ? "flash" : "";
        html += '<div class="map-key ' + kCls + '"><span class="k-label">🔑 "' + key + '"</span>' +
                '<span class="k-count">' + dep.size + " 个关注者</span>" +
                '<div class="map-dep">' + (fx || '<span style="opacity:.55">（空）</span>') + "</div></div>";
      });
      html += "</div>";
    });
    html += "</div>";
    mapEl.innerHTML = html;
    flashKey = null; flashTarget = null;
  }

  function updateUI() {
    viewEl.querySelector(".v").textContent = view;
    runsEl.querySelector(".v").textContent = runs;
    bump(runsEl);
    var btns = $("labSteps").querySelectorAll(".step-btn[data-lab]");
    btns.forEach(function (b) {
      var n = +b.getAttribute("data-lab");
      if (n <= stepDone) { b.disabled = true; b.classList.add("done-btn"); }
      else { b.disabled = false; b.classList.remove("done-btn"); }
    });
    var tips = {
      1: "看右侧地图：flag、name 两条登记长出来了（黄色一闪）。",
      2: "trigger 找到 name 名册里的 effect → 重新执行 → 页面更新为「李四」。",
      3: "age 的名册根本不存在 → 静默返回。改没人看的数据，零成本。",
      4: "重跑时只读 flag、age —— name 的登记被当场注销（橙色日志），地图瘦身！",
      5: "name 名册已空（上一步被清理）→ 这次修改石沉大海，页面纹丝不动。这就是依赖清理的意义。"
    };
    if (tips[stepDone]) tipEl.textContent = "💡 " + tips[stepDone];
  }

  function reset() {
    world = createWorld({
      onTrack: function (meta, effLabel) {
        flashKey = meta.key; flashTarget = null;
        log("track", "登记 " + effLabel + " → " + meta.label + "." + meta.key);
        renderMap();
      },
      onTrigger: function (label, key, size) {
        log("trig", label + "." + key + " 被修改 → 名册里有 " + size + " 个 effect → 派发通知");
      },
      onTriggerMiss: function (label, key) {
        log("info", label + "." + key + " 被修改 → 名册里没有登记 → 静默返回（什么都不发生）");
      },
      onCleanup: function (meta, effLabel) {
        flashTarget = meta.label;
        log("clean", "注销 " + effLabel + " ← " + meta.label + "." + meta.key + "（这条依赖过期了）");
        renderMap();
      }
    });
    state = world.reactive({ flag: true, name: "张三", age: 18 }, "state");
    view = "（未渲染）"; runs = 0; stepDone = 0;
    consoleEl.innerHTML = "";
    log("sys", "实验室已就绪：state = reactive({ flag: true, name: '张三', age: 18 })");
    log("sys", "按顺序点击上方按钮，观察日志与依赖地图的变化 →");
    updateUI();
    renderMap();
  }

  function doStep(n) {
    if (n <= stepDone) return;
    stepDone = n;
    if (n === 1) {
      log("sys", "── ① effect(() => 页面 = flag ? name : age) ──");
      world.effect(function () {
        runs++;
        view = state.flag ? "姓名：" + state.name : "年龄：" + state.age;
        log("run", "effect#1 执行 → 渲染页面：「" + view + "」");
      }, "effect#1");
    } else if (n === 2) {
      log("sys", "── ② state.name = '李四' ──");
      state.name = "李四";
    } else if (n === 3) {
      log("sys", "── ③ state.age = 19（没有 effect 读过它）──");
      state.age = 19;
    } else if (n === 4) {
      log("sys", "── ④ state.flag = false（分支切换！）──");
      state.flag = false;
    } else if (n === 5) {
      log("sys", "── ⑤ state.name = '王五'（name 已无人关注）──");
      state.name = "王五";
    }
    updateUI();
  }

  $("labSteps").addEventListener("click", function (e) {
    var b = e.target.closest(".step-btn");
    if (!b) return;
    if (b.getAttribute("data-lab") === "reset") reset();
    else doStep(+b.getAttribute("data-lab"));
  });
  reset();
})();

(function initReflect() {
  var c1 = $("reflConsole1"), c2 = $("reflConsole2");
  if (!c1) return;
  var log1 = mkLog(c1), log2 = mkLog(c2);
  var w1, w2, title1, title2;

  function makeSide(useReflect, log) {
    var raw = {
      name: "张三",
      get aliasName() { return this.name + "（别名）"; }
    };
    var deps = new Map();
    var current = null;
    var proxy = new Proxy(raw, {
      get: function (target, key, receiver) {
        if (key === "__deps") return deps;
        if (current) {
          if (!deps.has(key)) deps.set(key, new Set());
          deps.get(key).add(current);
          log("track", "登记依赖：" + key);
        }
        return useReflect ? Reflect.get(target, key, receiver) : target[key];
      },
      set: function (target, key, value) {
        target[key] = value;
        var s = deps.get(key);
        if (s) s.forEach(function (fn) { fn(); });
        return true;
      }
    });
    return { proxy: proxy, deps: deps, setCurrent: function (f) { current = f; } };
  }

  function reset() {
    title1 = title2 = null;
    c1.innerHTML = ""; c2.innerHTML = "";
    log1("sys", "代理 A：get 里用 Reflect.get(target, key, receiver)");
    log2("sys", "代理 B：get 里用 target[key]");
    w1 = makeSide(true, log1);
    w2 = makeSide(false, log2);
  }

  function step1() {
    log1("sys", "── 运行 effect：读 aliasName ──");
    log2("sys", "── 运行 effect：读 aliasName ──");
    var fn1 = function () {
      title1 = w1.proxy.aliasName;
      log1("run", "effect 执行 → 页面标题：「" + title1 + "」");
    };
    var fn2 = function () {
      title2 = w2.proxy.aliasName;
      log2("run", "effect 执行 → 页面标题：「" + title2 + "」");
    };
    w1.setCurrent(fn1); fn1(); w1.setCurrent(null);
    w2.setCurrent(fn2); fn2(); w2.setCurrent(null);
    if (w1.deps.has("name")) log1("info", "✅ getter 里读 name 时 this 指向代理 → name 也被登记了");
    if (!w2.deps.has("name")) log2("info", "⚠️ getter 里读 name 时 this 指向原始对象 → 没经过代理 → name 未被登记！");
  }

  function step2() {
    log1("sys", "── 修改 name = '李四' ──");
    log2("sys", "── 修改 name = '李四' ──");
    log1("trig", "name 名册中找到 effect → 派发执行");
    w1.proxy.name = "李四";
    log1("out", "✅ 页面标题已更新：「" + title1 + "」");
    log2("trig", "name 名册是空的 → 无人可通知");
    w2.proxy.name = "李四";
    log2("out", "❌ effect 没有重新执行，页面标题还是：「" + title2 + "」");
  }

  document.querySelectorAll("[data-reflect]").forEach(function (b) {
    b.addEventListener("click", function () {
      var v = b.getAttribute("data-reflect");
      if (v === "reset") { reset(); return; }
      if (v === "1" && !w1.deps.size) step1();
      if (v === "2" && w1.deps.size && title1 === "张三（别名）") step2();
    });
  });
  reset();
})();

(function initHeartbeatLab() {
  var consoleEl = $("hbConsole");
  if (!consoleEl) return;
  var log = mkLog(consoleEl);
  var effEl = $("hbEffect"), mapEl = $("hbMap");
  var stT = $("hbTrackId"), stL = $("hbDepsLen"), stD = $("hbDirty"), stS = $("hbStep");
  var step = 0, timer = null;

  function slot(txt, cls) { return '<span class="hb-slot ' + (cls || "") + '">' + txt + "</span>"; }
  function keyRow(k, entries, cls) {
    return '<div class="hb-key ' + (cls || "") + '">' + k + " → " + (entries || "（无人登记）") + "</div>";
  }

  var STEPS = [
    { // 0
      st: ["—", "—", "—"],
      eff: "activeEffect：<b>—</b>（effect 未创建）<br>_trackId：— ｜ _running：—<br>" +
           'deps 数组：' + slot("空") + slot("空") + slot("空") + slot("空"),
      map: keyRow("flag", null) + keyRow("name", null) + keyRow("age", null),
      logs: [
        ["sys", "实验室就绪：state = { flag: true, name: '张三', age: 18 }"],
        ["info", "目标代码：view = flag ? name : age —— 点「下一步」看它的心跳"]
      ]
    },
    { // 1 run#1 进入
      st: ["1", "0", "干净"],
      eff: "activeEffect：<b>effect#1</b>（running=1）<br>_trackId：<b>1</b> ｜ dirty：干净<br>" +
           'deps 数组：' + slot("空") + slot("空") + slot("空") + slot("空") +
           '<span class="hb-ptr">▲ 写指针=0</span>',
      map: keyRow("flag", null) + keyRow("name", null) + keyRow("age", null),
      logs: [
        ["sys", "── ① run() 进入 ──"],
        ["info", "版本号 _trackId → 1（开放新场次）；写指针归零；activeEffect = effect#1（特工别上追踪器）"]
      ]
    },
    { // 2 读 flag
      st: ["1", "1", "干净"],
      eff: "activeEffect：<b>effect#1</b><br>_trackId：1 ｜ dirty：干净<br>" +
           'deps 数组：' + slot("dep·flag", "filled") + slot("空") + slot("空") + slot("空") +
           '<span class="hb-ptr">▲ 写指针=1</span>',
      map: keyRow("flag", "[ effect#1 @trackId 1 ]", "hot") + keyRow("name", null) + "age（尚未建档）",
      logs: [
        ["sys", "── ② fn 读 state.flag ──"],
        ["run", "get 拦截 → track(state, 'flag')：名册无 flag → 建档 createDep"],
        ["track", "trackEffect：dep 登记 effect#1 @trackId=1；反向 deps[0]=dep·flag，写指针 0→1"]
      ]
    },
    { // 3 读 name
      st: ["1", "2", "干净"],
      eff: "activeEffect：<b>effect#1</b><br>_trackId：1 ｜ dirty：干净<br>" +
           'deps 数组：' + slot("dep·flag", "filled") + slot("dep·name", "filled") + slot("空") + slot("空") +
           '<span class="hb-ptr">▲ 写指针=2</span>',
      map: keyRow("flag", "[ effect#1 @1 ]") + keyRow("name", "[ effect#1 @1 ]", "hot") + "age（尚未建档）",
      logs: [
        ["sys", "── ③ fn 读 state.name ──"],
        ["track", "同款流程：name 建档 → 登记 e1@1 → deps[1]=dep·name，写指针 2"]
      ]
    },
    { // 4 第一轮结束
      st: ["1", "2", "干净"],
      eff: "activeEffect：<b>null（已还原）</b><br>_trackId：1 ｜ _running：0 ｜ 待命<br>" +
           'deps 数组：' + slot("dep·flag", "filled") + slot("dep·name", "filled") + slot("空") + slot("空"),
      map: keyRow("flag", "[ effect#1 @1 ]") + keyRow("name", "[ effect#1 @1 ]") + "age（尚未建档）",
      logs: [
        ["sys", "── ④ fn 执行完毕（finally）──"],
        ["info", "postCleanEffect：deps.length(2) ≤ 写指针(2) → 无尾巴可清"],
        ["out", "activeEffect 还原 → effect#1 待命。第一帧渲染完成 ✅"]
      ]
    },
    { // 5 改 name → trigger
      st: ["1", "2", "脏！"],
      eff: "activeEffect：—<br>_trackId：1 ｜ <b>dirty：脏！</b><br>" +
           'deps 数组：' + slot("dep·flag", "filled") + slot("dep·name", "filled") + slot("空") + slot("空"),
      map: keyRow("flag", "[ effect#1 @1 ]") + keyRow("name", "[ effect#1 @1 ]", "hot") + "age（尚未建档）",
      logs: [
        ["sys", "── ⑤ state.name = '李四' ──"],
        ["trig", "set 拦截：值变了 → trigger → 翻名册找到 dep.name（1 个订阅者）"],
        ["run", "标脏 dirty=Dirty → 调 scheduler（默认 = 直接重跑）→ effect#1 重新入栈"]
      ]
    },
    { // 6 run#2 进入：版本号+1、指针归零
      st: ["2", "0", "干净"],
      eff: "activeEffect：<b>effect#1</b><br>_trackId：<b>2</b>（+1！）｜ dirty：干净<br>" +
           'deps 数组：' + slot("dep·flag", "filled") + slot("dep·name", "filled") + slot("空") + slot("空") +
           '<span class="hb-ptr">▲ 写指针=0（归零！）</span>',
      map: keyRow("flag", "[ effect#1 @1 → 过期 ]", "") + keyRow("name", "[ effect#1 @1 → 过期 ]") + "age（尚未建档）",
      logs: [
        ["sys", "── ⑥ 第二轮 run 进入 ──"],
        ["info", "关键一步：_trackId 1→2 —— 名册里所有 @1 的登记瞬间变成「过期票」"],
        ["info", "写指针归零：deps 数组<b>原封不动</b>，只是准备好从头重写"]
      ]
    },
    { // 7 重读 flag
      st: ["2", "1", "干净"],
      eff: "activeEffect：<b>effect#1</b><br>_trackId：2 ｜ dirty：干净<br>" +
           'deps 数组：' + slot("dep·flag", "filled") + slot("dep·name") + slot("空") + slot("空") +
           '<span class="hb-ptr">▲ 写指针=1</span>',
      map: keyRow("flag", "[ effect#1 @2 ]", "hot") + keyRow("name", "[ effect#1 @1 → 过期 ]") + "age（尚未建档）",
      logs: [
        ["sys", "── ⑦ 重读 state.flag ──"],
        ["track", "检票：dep 里记的是 @1 ≠ 本轮 2 → 旧票撕掉，补发新票 e1@2"],
        ["info", "deps[0] = dep·flag（位置没变），写指针 0→1"]
      ]
    },
    { // 8 分支切换！读 age
      st: ["2", "2", "干净"],
      eff: "activeEffect：<b>effect#1</b><br>_trackId：2 ｜ dirty：干净<br>" +
           'deps 数组：' + slot("dep·flag", "filled") + slot("dep·age", "filled") + slot("空") + slot("空") +
           '<span class="hb-ptr">▲ 写指针=2</span>',
      map: keyRow("flag", "[ effect#1 @2 ]") + keyRow("name", "已注销（自清理）", "gone") + keyRow("age", "[ effect#1 @2 ]", "hot"),
      logs: [
        ["sys", "── ⑧ 分支切换！fn 这次走 else 读 state.age ──"],
        ["track", "名册新建 age → 登记 e1@2"],
        ["clean", "写指针位置 1 坐着 dep·name → oldDep ≠ dep → 当场清掉！（dep 空了 → 自清理出名册）"],
        ["info", "deps[1] = dep·age，写指针 2 —— 「登记即 diff」，清理顺手完成"]
      ]
    },
    { // 9 第二轮结束
      st: ["2", "2", "干净"],
      eff: "activeEffect：<b>null（还原）</b><br>_trackId：2 ｜ 待命<br>" +
           'deps 数组：' + slot("dep·flag", "filled") + slot("dep·age", "filled") + slot("空") + slot("空"),
      map: keyRow("flag", "[ effect#1 @2 ]") + keyRow("name", "已注销", "gone") + keyRow("age", "[ effect#1 @2 ]"),
      logs: [
        ["sys", "── ⑨ fn 执行完毕 ──"],
        ["info", "postClean：length(2) ≤ 指针(2) → 无尾巴"],
        ["out", "视图 =「年龄：18」—— name 已退出舞台"]
      ]
    },
    { // 10 改 name 验证
      st: ["2", "2", "干净"],
      eff: "activeEffect：—<br>_trackId：2 ｜ 待命<br>" +
           'deps 数组：' + slot("dep·flag", "filled") + slot("dep·age", "filled") + slot("空") + slot("空"),
      map: keyRow("flag", "[ effect#1 @2 ]") + keyRow("name", "已注销", "gone") + keyRow("age", "[ effect#1 @2 ]"),
      logs: [
        ["sys", "── ⑩ state.name = '王五'（验证清理成果）──"],
        ["trig", "set 拦截 → trigger → 翻名册查 name …… 空！"],
        ["clean", "静默返回 —— 总成本：两次 Map 查找，页面纹丝不动 ✅"]
      ]
    },
    { // 11 总结
      st: ["2", "2", "干净"],
      eff: "activeEffect：—<br>_trackId：2 ｜ 待命<br>" +
           'deps 数组：' + slot("dep·flag", "filled") + slot("dep·age", "filled") + slot("空") + slot("空"),
      map: keyRow("flag", "[ effect#1 @2 ]") + keyRow("age", "[ effect#1 @2 ]") + "name（已清场）",
      logs: [
        ["sys", "── ⑪ 全景回顾 ──"],
        ["info", "版本号：每轮 +1，dep 认票不认人 —— 去重与过期判定同一机制"],
        ["info", "写指针：登记即 diff —— 过期邻居在写入的当下顺手清掉"],
        ["out", "增量清理：没变的依赖零成本续票。你已经能徒手实现响应式了 🎓"]
      ]
    },
  ];

  function render(st) {
    effEl.innerHTML = st.eff;
    mapEl.innerHTML = st.map;
    stT.querySelector(".v").textContent = st.st[0];
    stL.querySelector(".v").textContent = st.st[1];
    stD.querySelector(".v").textContent = st.st[2];
    stS.querySelector(".v").textContent = step + " / 11";
    bump(stS);
  }
  function reset() {
    if (timer) { clearInterval(timer); timer = null; }
    step = 0;
    consoleEl.innerHTML = "";
    var st = STEPS[0];
    render(st);
    st.logs.forEach(function (ln) { log(ln[0], ln[1]); });
  }
  function next() {
    if (step >= STEPS.length - 1) return false;
    step++;
    var st = STEPS[step];
    render(st);
    st.logs.forEach(function (ln) { log(ln[0], ln[1]); });
    if (step === STEPS.length - 1) {
      tipSet("💡 推演完毕 —— 回看 6 章的门票比喻和 4.5 的九步时序，现在每个格子都是活的。");
      return false;
    }
    return true;
  }
  function tipSet(t) { var el = $("hbTip"); if (el) el.textContent = t; }
  $("hbSteps").addEventListener("click", function (e) {
    var b = e.target.closest(".step-btn");
    if (!b) return;
    var v = b.getAttribute("data-hb");
    if (v === "reset") { reset(); tipSet("提示：连点「下一步」。重点盯三处 —— 版本号何时 +1、写指针何时归零、第 ⑨ 步写指针位置上「坐着谁」。"); return; }
    if (v === "next") { next(); return; }
    if (v === "auto") {
      if (timer) { clearInterval(timer); timer = null; b.textContent = "⏩ 自动播放"; return; }
      b.textContent = "⏸ 暂停";
      timer = setInterval(function () {
        if (!next()) { clearInterval(timer); timer = null; b.textContent = "⏩ 自动播放"; }
      }, 1300);
    }
  });
  reset();
})();
