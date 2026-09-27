/* frontier.html 实验室引擎 */
"use strict";
(function initErrorLab() {
  var consoleEl = $("erConsole");
  if (!consoleEl) return;
  var log = mkLog(consoleEl);
  var sw = { p: false, g: false, h: false };
  var els = { p: $("erP"), g: $("erG"), h: $("erH") };
  var NAMES = { p: "父组件 onErrorCaptured", g: "祖父 onErrorCaptured", h: "app.config.errorHandler" };

  function paint() {
    ["p", "g", "h"].forEach(function (k) {
      els[k].querySelector(".v").textContent = sw[k] ? "开" : "关";
      els[k].classList.toggle("hot", sw[k]);
    });
  }
  function reset() {
    sw.p = sw.g = sw.h = false; paint();
    consoleEl.innerHTML = "";
    log("sys", "已重置：三层捕获全关。点「孙组件抛错」看默认行为 —— 无人捕获 → 控制台警告。");
  }
  $("erSteps").addEventListener("click", function (e) {
    var b = e.target.closest(".step-btn");
    if (!b) return;
    var v = b.getAttribute("data-er");
    if (v === "reset") return reset();
    if (v === "throw") {
      log("sys", "── 孙组件 render 抛出 TypeError（ErrorCodes.RENDER_FUNCTION）──");
      log("trig", "callWithErrorHandling 接住异常 → handleError(err, child, RENDER_FUNCTION)");
      if (sw.p) log("track", "父 onErrorCaptured 捕获：埋点上报（不返回 false）→ 继续上抛");
      if (sw.g) log("track", "祖父 onErrorCaptured 捕获：降级 UI（不返回 false）→ 继续上抛");
      if (sw.h) log("out", "app.config.errorHandler 兜底处理 ✅（生产环境的统一出口）");
      if (!sw.p && !sw.g && !sw.h) {
        log("clean", "无人捕获 → logError：[Vue warn] Unhandled error during execution of renderer function");
      } else if (!sw.h) {
        log("info", "组件层看过一圈 → 全局 errorHandler 未开启 → 仍由 logError 兜底收场");
      }
    } else {
      sw[v] = !sw[v]; paint();
      log("sys", NAMES[v] + (sw[v] ? " 已开启" : " 已关闭"));
    }
  });
  reset();
})();
