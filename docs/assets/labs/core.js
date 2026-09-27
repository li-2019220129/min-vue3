/* core.html 实验室引擎 */
"use strict";
(function initBootLab() {
  var consoleEl = $("bootConsole"), flowEl = $("bootFlow");
  if (!consoleEl) return;
  var log = mkLog(consoleEl);
  var stageEl = $("bootStage"), phaseEl = $("bootPhase"), tipEl = $("bootTip"), appEl = $("bootApp");
  var stepDone = 0;
  var count = 0;

  var STEPS = [
    { phase: "createApp", lines: [
      ["sys", "── ① createApp(App) ──"],
      ["info", "ensureRenderer() 懒创建渲染器：用不到 SSR 就不打包 hydration（tree-shaking）"],
      ["info", "createAppAPI(render) 返回工厂 → 产出 app 对象：{ use, component, directive, provide, mount }"],
      ["out", "app 就绪 —— 此刻什么都没渲染，全局配置还没收齐"] ] },
    { phase: "全局配置", lines: [
      ["sys", "── ② app.use(Plugin).component('MyBtn').provide('theme','dark') ──"],
      ["info", "插件 / 全局组件 / 指令 / 全局 provide 全部登记进 app._context"],
      ["info", "每个方法都 return app —— 链式调用的全部秘密就是返回自己"] ] },
    { phase: "mount", lines: [
      ["sys", "── ③ app.mount('#app') ──"],
      ["info", "normalizeContainer：'#app' 字符串 → querySelector 拿到真实容器"],
      ["info", "根组件翻译成 vnode：createVNode(App)，并挂上 appContext（provide 全局兜底，第 24 章）"] ] },
    { phase: "render", lines: [
      ["sys", "── ④ render(vnode, container) ──"],
      ["info", "patch(null, vnode, container)：旧 vnode 为 null → 走挂载分支（第 17 章）"],
      ["info", "vnode.type 是对象 → 分流到 processComponent（第 19 章）"] ] },
    { phase: "setup", lines: [
      ["sys", "── ⑤ mountComponent：建实例 → setupComponent ──"],
      ["track", "initProps：声明过的进 instance.props（shallowReactive），其余进 attrs（第 22 章）"],
      ["track", "initSlots：children 是编译好的槽函数袋，挂上 instance.slots（第 22 章）"],
      ["run", "setup(props) 执行！currentInstance 指针指向本组件，你的组合式 API 在这里全部跑完"] ] },
    { phase: "effect", lines: [
      ["sys", "── ⑥ setupRenderEffect：render 包进 effect ──"],
      ["info", "instance.update = effect(componentUpdateFn, scheduler: queueJob)（第 2 章 + 第 23 章）"],
      ["info", "从此渲染函数有了响应式身份 —— 但数据变化不会立刻重跑，先排队"] ] },
    { phase: "首屏", lines: [
      ["sys", "── ⑦ 首次执行 update ──"],
      ["run", "instance.render() 执行 → 读到 count → track 登记依赖（第 4 章）→ 产出 subTree"],
      ["info", "patch(null, subTree) → processElement → mountElement → nodeOps + patchProp 逐个上屏（第 15/17 章）"],
      ["out", "🟢 第一个像素出现！onMounted 钩子进 post 队列，微任务里执行（第 23 章）"] ] },
    { phase: "日常循环", lines: [
      ["sys", "── ⑧ 启动完成，进入日常循环 ──"],
      ["info", "此后每次数据修改：trigger（第 5 章）→ queueJob → 微任务 flushJobs → update 重跑 → diff（第 18 章）"],
      ["out", "下面的计数器是真的：点 +1，走一遍完整循环 →"] ] },
  ];

  function lightNode(n) {
    flowEl.querySelectorAll(".boot-node").forEach(function (el) {
      var k = +el.getAttribute("data-node");
      el.classList.toggle("lit", k <= n);
      el.classList.toggle("now", k === n);
    });
  }
  function resetBtns() {
    $("bootSteps").querySelectorAll(".step-btn").forEach(function (b) {
      var v = b.getAttribute("data-boot");
      if (v === "reset") return;
      var n = +v;
      b.disabled = n <= stepDone;
      b.classList.toggle("done-btn", n <= stepDone);
    });
  }
  function updateStats() {
    stageEl.querySelector(".v").textContent = stepDone + " / 8";
    bump(stageEl);
    if (stepDone > 0) phaseEl.querySelector(".v").textContent = STEPS[stepDone - 1].phase;
  }
  function mountDemo() {
    appEl.innerHTML = "";
    var label = document.createElement("span");
    label.textContent = "Count: ";
    var num = document.createElement("b");
    num.textContent = "0";
    var btn = document.createElement("button");
    btn.className = "step-btn";
    btn.style.marginLeft = "10px";
    btn.textContent = "+1";
    btn.addEventListener("click", function () {
      count++;
      log("trig", "count = " + count + " → trigger → queueJob（去重排队）");
      Promise.resolve().then(function () {
        num.textContent = String(count);
        log("out", "微任务 flushJobs → update 重跑 → patch → DOM 更新为 " + count + " ✅");
      });
    });
    appEl.appendChild(label); appEl.appendChild(num); appEl.appendChild(btn);
  }
  function reset() {
    stepDone = 0; count = 0;
    consoleEl.innerHTML = "";
    lightNode(0);
    appEl.innerHTML = "（空容器 —— 等待 mount）";
    phaseEl.querySelector(".v").textContent = "未启动";
    stageEl.querySelector(".v").textContent = "0 / 8";
    tipEl.textContent = "提示：按 ①→⑧ 顺序点击。最后一步挂载出的计数器是真的 —— 点它，感受第 5/23 章的循环。";
    log("sys", "实验室就绪。目标：createApp(App).mount('#app') —— 按 ①→⑧ 点起来");
    resetBtns();
  }
  $("bootSteps").addEventListener("click", function (e) {
    var b = e.target.closest(".step-btn");
    if (!b) return;
    var v = b.getAttribute("data-boot");
    if (v === "reset") { reset(); return; }
    var n = +v;
    if (n <= stepDone) return;
    stepDone = n;
    var st = STEPS[n - 1];
    st.lines.forEach(function (ln) { log(ln[0], ln[1]); });
    lightNode(n);
    updateStats();
    resetBtns();
    if (n === 8) { mountDemo(); tipEl.textContent = "💡 启动完成，计数器已挂载 —— 第 21 章毕业，继续第 22 章！"; }
  });
  reset();
})();

(function initNtLab() {
  var consoleEl = $("ntConsole");
  if (!consoleEl) return;
  var log = mkLog(consoleEl);
  var valEl = $("ntVal"), qEl = $("ntQueueN"), fEl = $("ntFlushN"), domEl = $("ntDom");
  var queue = [], postCbs = [];
  var flushing = false, flushPending = false, flushP = null;
  var flushN = 0, count = 0, jobSeq = 0, loopArmed = false;
  var renderJob = null;   // 稳定的 job 对象 —— 同一个对象重复入队即被去重
  var pendingTickFn = null; // nextTick 回调里要执行的后续动作（场景④用）

  function render() {
    valEl.querySelector(".v").textContent = String(count);
    domEl.textContent = "页面显示：" + count;
    bump(valEl); bump(domEl);
  }
  function updateStats() {
    qEl.querySelector(".v").textContent = String(queue.length + postCbs.length);
    fEl.querySelector(".v").textContent = String(flushN);
  }
  function flushJobs() {
    flushing = true; flushPending = false; flushP = null;
    flushN++;
    log("run", "▶ flushJobs 开始（微任务 · 第 " + flushN + " 轮）：排序 → 逐 job → post 队列");
    queue.sort(function (a, b) { return a.id - b.id; });
    while (queue.length) {
      var job = queue.shift();
      log("run", "job#" + job.id + " → render() 重跑 → diff → DOM 更新");
      job.fn();
    }
    while (postCbs.length) {
      var cb = postCbs.shift();
      log("info", "post 队列：updated / mounted 类回调执行");
      cb();
    }
    flushing = false;
    if (queue.length) {
      log("info", "flush 中途又入了队 → 接着来一轮（官方还有 100 层递归上限防死循环）");
      flushJobs();
      return;
    }
    log("out", "✔ flushJobs 结束：本轮触发几次 trigger，都只渲染了一次");
    updateStats();
  }
  function queueJob(job) {
    if (queue.indexOf(job) !== -1) {
      log("track", "queueJob：job#" + job.id + " 已在队列 → 去重跳过（这就是批处理）");
      return;
    }
    queue.push(job);
    log("track", "queueJob：job#" + job.id + " 入队");
    if (!flushing && !flushPending) {
      flushPending = true;
      flushP = Promise.resolve().then(flushJobs);
      log("sys", "Promise.then(flushJobs) 注册 → 等本轮同步代码全部跑完");
    }
    updateStats();
  }
  function nextTick(label) {
    var p = flushP || Promise.resolve();
    p.then(function () {
      var domVal = domEl.textContent.replace("页面显示：", "");
      log("out", label + "：DOM=" + domVal + "（count 变量=" + count + "）");
      if (pendingTickFn) { var fn = pendingTickFn; pendingTickFn = null; fn(); }
    });
    log("sys", label + " 已挂到 flush 链之后（同一条微任务链）");
  }
  function setData(n) {
    for (var i = 0; i < n; i++) {
      count++;
      log("trig", "同步代码：count = " + count + "（trigger）");
    }
  }
  function buildJob() {
    if (!renderJob) renderJob = { id: ++jobSeq, fn: render };
    return renderJob;
  }
  function reset() {
    queue = []; postCbs = []; flushing = false; flushPending = false;
    flushP = null; flushN = 0; count = 0; loopArmed = false; renderJob = null; pendingTickFn = null;
    consoleEl.innerHTML = "";
    render(); updateStats();
    log("sys", "迷你 scheduler 已重置。场景 ①②③ 随便点 —— 日志顺序是真话（真实 Promise 微任务）。");
  }
  $("ntSteps").addEventListener("click", function (e) {
    var b = e.target.closest(".step-btn");
    if (!b) return;
    var v = b.getAttribute("data-nt");
    if (v === "reset") { reset(); return; }
    if (v === "batch") {
      log("sys", "── 场景①：一次点击里连改三次数据 ──");
      setData(3);
      queueJob(buildJob());
      log("out", "同步代码结束。此刻 DOM 还是 0 —— 更新在排队");
    } else if (v === "tick") {
      log("sys", "── 场景②：nextTick vs setTimeout ──");
      setData(1);
      queueJob(buildJob());
      nextTick("nextTick 回调");
      setTimeout(function () {
        log("info", "setTimeout 回调：最后才执行（宏任务，读到 count = " + count + "）");
      }, 0);
      log("out", "同步代码结束：接下来依次是 flush → nextTick → setTimeout");
    } else if (v === "tick2") {
      log("sys", "── 场景④：连续 nextTick 保序 + A 里再改数据 ──");
      setData(1);
      queueJob(buildJob());
      pendingTickFn = function () {
        count++;
        log("trig", "nextTick-A 里改数据：count = " + count + " → trigger → queueJob（新一轮 flush）");
        queueJob(buildJob());
        pendingTickFn = function () {
          log("info", "nextTick-C：我在第二轮 flush 之后才执行 —— 嵌套排队也严格保序");
        };
        nextTick("nextTick-C（A 里注册）");
      };
      nextTick("nextTick-A");
      nextTick("nextTick-B");
      log("out", "同步代码结束。先预测：A、B、flush②、C 谁先谁后？");
    } else if (v === "loop") {
      log("sys", "── 场景③：updated 回调里再改数据（会不会死循环？）──");
      loopArmed = true;
      postCbs.push(function () {
        if (loopArmed) {
          loopArmed = false;
          count++;
          log("trig", "updated 钩子：把 count 改成 " + count + " → trigger → queueJob");
          queueJob(buildJob());
        }
      });
      setData(1);
      queueJob(buildJob());
    }
  });
  reset();
})();
