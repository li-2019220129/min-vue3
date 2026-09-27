/* runtime.html 实验室引擎 */
"use strict";
(function initTransitionLab() {
  var consoleEl = $("trConsole");
  if (!consoleEl) return;
  var log = mkLog(consoleEl);
  var el = $("trEl"), clsEl = $("trCls");
  var t0 = 0, busy = false;

  function classes() {
    var list = el.className.split(/\s+/).filter(function (c) {
      return c.indexOf("tr-") === 0 && c !== "tr-el" && c !== "tr-gone";
    });
    clsEl.textContent = list.length ? list.join(" + ") : "（无过渡 class）";
  }
  function stamp() { return "+" + Math.round(performance.now() - t0) + "ms"; }
  function add(c) { el.classList.add(c); log("track", stamp() + " 加 class：" + c); classes(); }
  function rm(c) { el.classList.remove(c); log("clean", stamp() + " 移除 class：" + c); classes(); }
  function readTransitionInfo() {   // 仿 getTransitionInfo：CSS 是唯一真相源
    var cs = getComputedStyle(el);
    var durs = cs.transitionDuration.split(","), delays = cs.transitionDelay.split(",");
    var total = 0;
    for (var i = 0; i < durs.length; i++) {
      total = Math.max(total, (parseFloat(durs[i]) + (parseFloat(delays[i]) || 0)) * 1000);
    }
    return { total: total, propCount: durs.length };
  }
  function whenEnds(done) {         // 仿 whenTransitionEnds：事件 + 超时双保险
    var info = readTransitionInfo();
    log("info", "getComputedStyle 读到时长 " + info.total + "ms × " + info.propCount + " 个属性 → 掐表");
    var ended = 0, finished = false;
    function finish() {
      if (!finished) { finished = true; el.removeEventListener("transitionend", onEnd); clearTimeout(timer); done(); }
    }
    function onEnd(e) {
      if (e.target !== el) return;
      ended++;
      log("trig", stamp() + " transitionend：" + e.propertyName);
      if (ended >= info.propCount) finish();
    }
    var timer = setTimeout(function () {
      log("info", "超时兜底到点（transitionend 没凑齐也收场）");
      finish();
    }, info.total + 40);
    el.addEventListener("transitionend", onEnd);
  }
  function enter() {
    el.classList.remove("tr-gone");
    log("sys", "── enter 开始 ──");
    add("tr-enter-from"); add("tr-enter-active");
    void el.offsetWidth;            // 强制重排，让起始态生效（Vue 用 rAF 下一帧）
    requestAnimationFrame(function () {
      rm("tr-enter-from");          // 删 from → 样式变化 → 过渡触发
      whenEnds(function () {
        rm("tr-enter-active");
        log("out", "enter 完成，元素稳定显示 ✅");
        busy = false;
      });
    });
  }
  function leave() {
    log("sys", "── leave 开始（元素缓刑：先不卸载，等动画）──");
    add("tr-leave-from"); add("tr-leave-active");
    void el.offsetWidth;
    requestAnimationFrame(function () {
      rm("tr-leave-from"); add("tr-leave-to");
      whenEnds(function () {
        el.classList.add("tr-gone");      // ⭐ 这时才真正"卸载"
        rm("tr-leave-active"); rm("tr-leave-to");
        log("out", "leave 完成 → 此刻才移除元素（display:none）");
        busy = false;
      });
    });
  }
  $("trSteps").addEventListener("click", function (e) {
    var b = e.target.closest(".step-btn");
    if (!b) return;
    var v = b.getAttribute("data-tr");
    if (v === "reset") {
      busy = false;
      el.classList.remove("tr-enter-from", "tr-enter-active", "tr-leave-from", "tr-leave-active", "tr-leave-to");
      el.classList.add("tr-gone");
      el.style.setProperty("--tr-dur", "0.6s");
      consoleEl.innerHTML = "";
      classes();
      log("sys", "已重置：默认 0.6s 过渡，元素隐藏中。点「切换显示 / 隐藏」开始。");
      return;
    }
    if (v === "fast") { el.style.setProperty("--tr-dur", "0.2s"); log("sys", "CSS 时长改为 0.2s（--tr-dur 变量）"); return; }
    if (v === "slow") { el.style.setProperty("--tr-dur", "1.2s"); log("sys", "CSS 时长改为 1.2s（--tr-dur 变量）"); return; }
    if (v === "toggle") {
      if (busy) { log("info", "动画进行中，忽略本次点击"); return; }
      busy = true; t0 = performance.now();
      if (el.classList.contains("tr-gone")) enter(); else leave();
    }
  });
  el.classList.add("tr-gone");
  classes();
  log("sys", "实验室就绪：0.6s 过渡，元素隐藏中。点「切换显示 / 隐藏」观察 class 时间线。");
})();
