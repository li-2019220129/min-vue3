/* renderer.html 实验室引擎 */
"use strict";
(function initInvoker() {
  var realBtn = $("invRealBtn"), resultEl = $("invResult"), consoleEl = $("invConsole");
  if (!realBtn) return;
  var log = mkLog(consoleEl);
  var mountEl = $("invMount"), updEl = $("invUpdate"), verEl = $("invVer");
  var mounts = 0, updates = 0, ver = 0, invoker = null;

  function ui() {
    mountEl.querySelector(".v").textContent = mounts;
    updEl.querySelector(".v").textContent = updates;
    verEl.querySelector(".v").textContent = "v" + ver;
  }

  function updateHandler() {
    ver++;
    var v = ver;
    var handler = function () {
      resultEl.textContent = "✅ v" + v + " 的处理器响应了点击！";
      log("out", "点击 → invoker(e) → 调用此刻的 invoker.value（v" + v + "）");
    };
    if (invoker) {
      invoker.value = handler;
      updates++;
      log("info", "更新到 v" + v + "：只替换 invoker.value（一次普通赋值，零 DOM 调用）");
    } else {
      invoker = function (e) { return invoker.value(e); };
      invoker.value = handler;
      realBtn.addEventListener("click", invoker);
      mounts++;
      log("info", "首次挂载 v1：addEventListener 挂上的是 invoker 壳子（此后永远不再调用）");
    }
    ui();
  }

  $("invUpdateBtn").addEventListener("click", updateHandler);
  log("sys", "patchEvent 逻辑已就绪：先点「更新事件处理器」生成 v1，再点真实按钮试试");
  updateHandler();
})();

(function initMountLab() {
  var preview = $("mountPreview"), consoleEl = $("mountConsole");
  if (!preview) return;
  var log = mkLog(consoleEl);
  var stats = { create: 0, insert: 0, set: 0, remove: 0 };
  var mtC = $("mtCreate"), mtI = $("mtInsert"), mtS = $("mtSet"), mtR = $("mtRemove");
  var tipEl = $("mountTip");
  var prevVNode = null, step = 0;

  function ui() {
    mtC.querySelector(".v").textContent = stats.create;
    mtI.querySelector(".v").textContent = stats.insert;
    mtS.querySelector(".v").textContent = stats.set;
    mtR.querySelector(".v").textContent = stats.remove;
  }
  function tag(el) { return "&lt;" + el.tagName.toLowerCase() + (el.className ? " ." + el.className.split(" ").join(".") : "") + "&gt;"; }

  /* ---- 带日志的 nodeOps（第 15 章的 nodeOps + 探针） ---- */
  var ops = {
    insert: function (el, parent, anchor) {
      stats.insert++; ui();
      parent.insertBefore(el, anchor || null);
      log("run", "insert " + tag(el) + " → " + tag(parent));
    },
    remove: function (el) {
      stats.remove++; ui();
      var p = el.parentNode; if (p) p.removeChild(el);
      log("clean", "remove " + tag(el));
    },
    createElement: function (type) {
      stats.create++; ui();
      var el = document.createElement(type);
      log("run", "createElement(" + type + ")");
      return el;
    },
    createText: function (t) { return document.createTextNode(t); },
    setText: function (node, t) { node.nodeValue = t; },
    setElementText: function (el, t) {
      stats.set++; ui();
      el.textContent = t;
      log("out", "setElementText " + tag(el) + " → \"" + t + "\"");
    },
    parentNode: function (n) { return n.parentNode; },
    nextSibling: function (n) { return n.nextSibling; },
    patchProp: function (el, key, prev, next) {
      stats.set++; ui();
      if (key === "class") { el.className = next || ""; log("out", "patchProp class → \"" + (next || "") + "\""); }
      else if (key === "style") {
        for (var k in next) el.style[k] = next[k];
        if (prev) for (var k2 in prev) if (next[k2] == null) el.style[k2] = "";
        log("out", "patchProp style → " + JSON.stringify(next));
      }
      else if (/^on/.test(key)) {
        var invokers = el._vei || (el._vei = {});
        if (invokers[key]) { invokers[key].value = next; log("out", "patchProp " + key + " → 仅替换 invoker.value（第 15 章）"); }
        else {
          var inv = function (e) { return inv.value(e); };
          inv.value = next;
          invokers[key] = inv;
          el.addEventListener(key.slice(2).toLowerCase(), inv);
          log("out", "patchProp " + key + " → addEventListener 挂 invoker");
        }
      }
      else {
        if (next == null) { el.removeAttribute(key); log("out", "patchProp removeAttribute(" + key + ")"); }
        else { el.setAttribute(key, next); log("out", "patchProp attr " + key + "=\"" + next + "\""); }
      }
    }
  };

  /* ---- 第 17 章 + 第 18 章的渲染器（教学实现） ---- */
  function h(type, props, children) {
    return { type: type, props: props || {}, children: children, key: (props && props.key) || null, el: null };
  }
  function mountElement(vnode, container, anchor) {
    var el = (vnode.el = ops.createElement(vnode.type));
    for (var key in vnode.props) {
      if (key !== "key") ops.patchProp(el, key, null, vnode.props[key]);
    }
    if (typeof vnode.children === "string") {
      ops.setElementText(el, vnode.children);
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach(function (c) { patch(null, c, el, null); });
    }
    ops.insert(el, container, anchor);
  }
  function patchElement(oldVNode, vnode) {
    var el = (vnode.el = oldVNode.el);
    log("info", "patchElement " + tag(el) + "：复用旧 DOM，开始 diff");
    var oldP = oldVNode.props || {}, newP = vnode.props || {};
    for (var k in newP) if (k !== "key" && newP[k] !== oldP[k]) ops.patchProp(el, k, oldP[k], newP[k]);
    for (var k2 in oldP) if (k2 !== "key" && !(k2 in newP)) ops.patchProp(el, k2, oldP[k2], null);
    patchChildren(oldVNode, vnode, el);
  }
  function patchChildren(oldVNode, vnode, el) {
    var oc = oldVNode.children, nc = vnode.children;
    if (typeof nc === "string") {
      if (Array.isArray(oc)) oc.forEach(function (c) { ops.remove(c.el); });
      if (oc !== nc) ops.setElementText(el, nc);
    } else if (Array.isArray(nc)) {
      if (Array.isArray(oc)) patchKeyedChildren(oc, nc, el);
      else { ops.setElementText(el, ""); nc.forEach(function (c) { patch(null, c, el, null); }); }
    } else {
      if (Array.isArray(oc)) oc.forEach(function (c) { ops.remove(c.el); });
      else ops.setElementText(el, "");
    }
  }
  /* 简化版 keyed diff（第 18 章算法，直接操作 DOM） */
  function patchKeyedChildren(oldCh, newCh, parent) {
    var i = 0, e1 = oldCh.length - 1, e2 = newCh.length - 1;
    while (i <= e1 && i <= e2 && oldCh[i].key === newCh[i].key) { patchElement(oldCh[i], newCh[i]); i++; }
    while (i <= e1 && i <= e2 && oldCh[e1].key === newCh[e2].key) { patchElement(oldCh[e1], newCh[e2]); e1--; e2--; }
    if (i > e1) {
      var anchor1 = newCh[e2 + 1] ? newCh[e2 + 1].el : null;
      for (var j = i; j <= e2; j++) patch(null, newCh[j], parent, anchor1);
      return;
    }
    if (i > e2) { for (var j2 = i; j2 <= e1; j2++) ops.remove(oldCh[j2].el); return; }
    var s1 = i, s2 = i;
    var keyToNew = new Map();
    for (var j3 = s2; j3 <= e2; j3++) keyToNew.set(newCh[j3].key, j3);
    var toBePatched = e2 - s2 + 1;
    var n2o = new Array(toBePatched).fill(-1);
    var oldKeys = [];
    for (var j4 = s1; j4 <= e1; j4++) {
      var nk = keyToNew.get(oldCh[j4].key);
      if (nk === undefined) { ops.remove(oldCh[j4].el); oldKeys.push(null); }
      else { n2o[nk - s2] = j4; oldKeys.push(nk); }
    }
    var lis = getLis(n2o);
    var lisIdx = lis.length - 1;
    var anchor = null;
    for (var j5 = toBePatched - 1; j5 >= 0; j5--) {
      var idx = s2 + j5;
      var node = newCh[idx];
      if (n2o[j5] === -1) {
        log("info", "diff：新建节点 key=" + node.key);
        patch(null, node, parent, anchor);
      } else {
        patchElement(oldCh[n2o[j5]], node);
        if (lisIdx < 0 || j5 !== lis[lisIdx]) {
          log("info", "diff：移动节点 key=" + node.key + "（不在 LIS 里）");
          ops.insert(node.el, parent, anchor);
        } else { lisIdx--; log("info", "diff：key=" + node.key + " 在 LIS 里 → 原地不动"); }
      }
      anchor = newCh[idx].el;
    }
  }
  function getLis(arr) {
    var result = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === -1) continue;
      if (!result.length || arr[i] > arr[result[result.length - 1]]) result.push(i);
      else {
        var lo = 0, hi = result.length - 1;
        while (lo < hi) { var mid = (lo + hi) >> 1; if (arr[result[mid]] < arr[i]) lo = mid + 1; else hi = mid; }
        result[lo] = i;
      }
    }
    return result;
  }
  function unmount(vnode) { ops.remove(vnode.el); }
  function patch(oldVNode, vnode, container, anchor) {
    if (oldVNode === vnode) return;
    if (oldVNode && oldVNode.type !== vnode.type) { unmount(oldVNode); oldVNode = null; }
    if (oldVNode == null) mountElement(vnode, container, anchor);
    else patchElement(oldVNode, vnode);
  }
  function render(vnode, container) {
    if (vnode == null) { if (prevVNode) { unmount(prevVNode); prevVNode = null; } return; }
    log("sys", "render(vnode, container) → patch(" + (prevVNode ? "旧树" : "null") + ", 新树)");
    patch(prevVNode, vnode, container, null);
    prevVNode = vnode;
  }

  /* ---- 演示用 vnode 集 ---- */
  function listVNode(keys) {
    return h("ul", { class: "todo" },
      keys.map(function (k) { return h("li", { key: k, class: "item" }, "节点 " + k); }));
  }
  function makeVNode(title, listKeys, cls, styleObj) {
    return h("div", { class: cls || "card", style: styleObj || { padding: "10px" } }, [
      h("h3", null, title),
      listVNode(listKeys),
      h("button", { onClick: function () { log("out", "🖱 按钮被点击 → invoker.value(e) → 用户回调（真实可用！）"); } }, "点我"),
    ]);
  }
  var V = {
    1: function () { return makeVNode("待办清单", ["a", "b", "c"]); },
    2: function () { return makeVNode("今日待办（改了标题）", ["a", "b", "c"]); },
    3: function () { return makeVNode("今日待办（改了标题）", ["a", "b", "c"], "card hot", { padding: "10px", border: "2px solid #e0566f" }); },
    4: function () { return makeVNode("今日待办（改了标题）", ["c", "a", "d", "b", "e"], "card hot", { padding: "10px", border: "2px solid #e0566f" }); },
  };
  var tips = {
    1: "首次挂载：3 个 li + h3 + button + card = 6 次 createElement + 6 次 insert（先组装后进场）",
    2: "只改了标题文本 → 全程只有 1 次 setElementText，其他 5 个节点零操作！",
    3: "改 class 和 style → card 节点 2 次 patchProp，列表复用不碰",
    4: "乱序重排：LIS 保护 a、b 原地不动 → 只新建 2 个（d、e）+ 移动 1 个（c）—— 看日志验证",
    5: "unmount 整棵树：1 次 remove（父节点没了，子节点跟着回收）"
  };

  function reset() {
    step = 0; prevVNode = null;
    stats.create = stats.insert = stats.set = stats.remove = 0;
    consoleEl.innerHTML = "";
    preview.innerHTML = "";
    log("sys", "mini 渲染器已就绪（第 15/16 章代码 + 操作探针）");
    log("sys", "按顺序点击上方按钮，观察右侧真实 DOM 与底层操作流水账");
    ui();
    tipEl.textContent = "提示：对比每一步「操作总数」—— 这就是 patch/diff 存在的意义。";
  }
  $("mountSteps").addEventListener("click", function (e) {
    var b = e.target.closest(".step-btn");
    if (!b) return;
    var v = b.getAttribute("data-mount");
    if (v === "reset") { reset(); return; }
    var n = +v;
    if (n !== step + 1) return;
    step = n;
    if (n === 5) {
      render(null, preview);
    } else {
      render(V[n](), preview);
    }
    if (tips[n]) tipEl.textContent = "💡 " + tips[n];
  });
  reset();
})();

(function initDiffLab() {
  var visual = $("diffVisual"), consoleEl = $("diffConsole");
  if (!visual) return;
  var log = mkLog(consoleEl);
  var dfS = $("dfStay"), dfM = $("dfMove"), dfN = $("dfMount"), dfU = $("dfUn");

  function runDiff(oldKeys, newKeys) {
    consoleEl.innerHTML = "";
    log("sys", "old: [" + oldKeys.join(", ") + "]  →  new: [" + newKeys.join(", ") + "]");
    var e1 = oldKeys.length - 1, e2 = newKeys.length - 1;
    var i = 0;
    var stay = 0, move = 0, mount = 0, unmount = 0;
    var result = {};  // key → 'stay'|'move'|'mount'|'unmount'
    newKeys.forEach(function (k) { result[k] = "mount"; });
    oldKeys.forEach(function (k) { result[k] = "unmount"; });

    while (i <= e1 && i <= e2 && oldKeys[i] === newKeys[i]) { result[oldKeys[i]] = "stay"; i++; }
    if (i > 0) log("track", "① 头部同步：前 " + i + " 个 key 相同 → patch 不移动");
    var tail = 0;
    while (i <= e1 && i <= e2 && oldKeys[e1] === newKeys[e2]) { result[oldKeys[e1]] = "stay"; e1--; e2--; tail++; }
    if (tail > 0) log("track", "② 尾部同步：后 " + tail + " 个 key 相同 → patch 不移动");

    if (i > e1) {
      if (i <= e2) log("info", "③ 旧列表耗尽 → 批量挂载 " + newKeys.slice(i, e2 + 1).join(", "));
    } else if (i > e2) {
      if (i <= e1) log("info", "③ 新列表耗尽 → 批量卸载 " + oldKeys.slice(i, e1 + 1).join(", "));
    } else {
      log("info", "③ 中间乱序段：old[" + i + ".." + e1 + "] vs new[" + i + ".." + e2 + "] → 请出 key 映射表");
      var s2 = i;
      var keyToNew = new Map();
      for (var j = s2; j <= e2; j++) keyToNew.set(newKeys[j], j);
      var toBePatched = e2 - s2 + 1;
      var n2o = new Array(toBePatched).fill(-1);
      var moved = false, maxSoFar = 0;
      for (var j2 = i; j2 <= e1; j2++) {
        var nk = keyToNew.get(oldKeys[j2]);
        if (nk === undefined) {
          result[oldKeys[j2]] = "unmount";
          log("clean", "key=" + oldKeys[j2] + " 在新列表找不到 → 卸载");
        } else {
          n2o[nk - s2] = j2;
          if (nk < maxSoFar) moved = true; else maxSoFar = nk;
        }
      }
      if (moved) {
        var lis = getLis(n2o);
        var lisSet = {};
        lis.forEach(function (x) { lisSet[x] = true; });
        log("info", "④ newIndexToOldIndex = [" + n2o.join(", ") + "]（-1 = 新挂载）");
        log("info", "⑤ LIS 保护下标 [" + lis.join(", ") + "] → 对应 key [" +
            lis.map(function (x) { return newKeys[s2 + x]; }).join(", ") + "] 原地不动");
        for (var j3 = 0; j3 < toBePatched; j3++) {
          if (n2o[j3] === -1) continue;
          result[newKeys[s2 + j3]] = lisSet[j3] ? "stay" : "move";
        }
      } else {
        log("info", "④ 相对顺序未打乱（无需 LIS）→ 乱序段全部原地 patch");
        for (var j4 = 0; j4 < toBePatched; j4++) {
          if (n2o[j4] !== -1) result[newKeys[s2 + j4]] = "stay";
        }
      }
    }
    newKeys.forEach(function (k) { if (result[k] === "stay") stay++; });
    newKeys.forEach(function (k) { if (result[k] === "move") move++; });
    newKeys.forEach(function (k) { if (result[k] === "mount") mount++; });
    oldKeys.forEach(function (k) { if (result[k] === "unmount") unmount++; });

    var label = { stay: "原地不动", move: "移动", mount: "新建", unmount: "卸载" };
    var cls = { stay: "d-stay", move: "d-move", mount: "d-mount", unmount: "d-un" };
    var html = '<div class="diffrow"><span class="drl">旧</span>';
    oldKeys.forEach(function (k) {
      var st = result[k] === "unmount" ? "unmount" : (result[k] === "stay" || result[k] === "move" ? "kept" : "kept");
      html += '<span class="dnode ' + cls[st === "unmount" ? "unmount" : result[k]] + '">' + k +
              '<small>' + label[result[k]] + '</small></span>';
    });
    html += "</div>";
    html += '<div class="diffrow"><span class="drl">新</span>';
    newKeys.forEach(function (k) {
      html += '<span class="dnode ' + cls[result[k]] + '">' + k + '<small>' + label[result[k]] + '</small></span>';
    });
    html += "</div>";
    visual.innerHTML = html;

    dfS.querySelector(".v").textContent = stay;
    dfM.querySelector(".v").textContent = move;
    dfN.querySelector(".v").textContent = mount;
    dfU.querySelector(".v").textContent = unmount;
    log("out", "结果：不动 " + stay + " · 移动 " + move + " · 新建 " + mount + " · 卸载 " + unmount +
        " → DOM 操作数：" + (move + mount + unmount));
  }

  function getLis(arr) {
    var result = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === -1) continue;
      if (!result.length || arr[i] > arr[result[result.length - 1]]) result.push(i);
      else {
        var lo = 0, hi = result.length - 1;
        while (lo < hi) { var mid = (lo + hi) >> 1; if (arr[result[mid]] < arr[i]) lo = mid + 1; else hi = mid; }
        result[lo] = i;
      }
    }
    return result;
  }

  function parseKeys(s) {
    return s.split(/[,，\s]+/).filter(Boolean).map(function (x) { return x.trim(); });
  }
  document.querySelectorAll("[data-diff]").forEach(function (b) {
    b.addEventListener("click", function () {
      var parts = b.getAttribute("data-diff").split("|");
      $("diffOld").value = parts[0];
      $("diffNew").value = parts[1];
      runDiff(parseKeys(parts[0]), parseKeys(parts[1]));
    });
  });
  $("diffRun").addEventListener("click", function () {
    var o = parseKeys($("diffOld").value), n = parseKeys($("diffNew").value);
    if (!o.length || !n.length) { alert("两侧都要至少一个 key（逗号分隔）"); return; }
    runDiff(o, n);
  });
  runDiff(["a", "b", "c", "d", "e"], ["c", "a", "d", "b", "e"]);
})();

(function initDiffWalkthrough() {
  var consoleEl = $("dwConsole");
  if (!consoleEl) return;
  var log = mkLog(consoleEl);
  var oldRow = $("dwOldRow"), newRow = $("dwNewRow");
  var stateEl = $("dwState"), dataEl = $("dwData"), stepEl = $("dwStep"), tipEl = $("dwTip");
  var step = 0, timer = null;
  var N = function (k, c, l) { return { k: k, c: c || "", l: l || "待处理" }; };

  var STEPS = [
    { // 0 初始
      old: [N("a"), N("b"), N("c"), N("d"), N("e")],
      nw:  [N("a"), N("d"), N("c"), N("b"), N("f"), N("e")],
      ptr: "i=0 · e1=4 · e2=5",
      data: "通讯录：—<br>对照表：—<br>LIS：—",
      logs: [
        ["sys", "实验室就绪：旧 [a,b,c,d,e] → 新 [a,d,c,b,f,e]"],
        ["info", "这个例子五脏俱全：有头同步、有尾同步、有乱序、有新增 —— 点「下一步」开走"]
      ]
    },
    { // 1 头同步
      old: [N("a", "d-stay", "已patch"), N("b"), N("c"), N("d"), N("e")],
      nw:  [N("a", "d-stay", "已patch"), N("d"), N("c"), N("b"), N("f"), N("e")],
      ptr: "i=1 · e1=4 · e2=5",
      data: "通讯录：—<br>对照表：—<br>LIS：—",
      logs: [
        ["sys", "── ① 从头同步 ──"],
        ["run", "旧[0]=a ↔ 新[0]=a：同类型同 key → patchElement（内容打补丁，位置不动）"],
        ["info", "i 前进 → 1"]
      ]
    },
    { // 2 尾同步
      old: [N("a", "d-stay", "已patch"), N("b"), N("c"), N("d", "dw-cur", "对不上?"), N("e", "d-stay", "已patch")],
      nw:  [N("a", "d-stay", "已patch"), N("d"), N("c"), N("b"), N("f", "dw-cur", "对不上?"), N("e", "d-stay", "已patch")],
      ptr: "i=1 · e1=3 · e2=4",
      data: "通讯录：—<br>对照表：—<br>LIS：—",
      logs: [
        ["sys", "── ② 从尾同步 ──"],
        ["run", "旧[4]=e ↔ 新[5]=e → patch e（不挪位置）"],
        ["info", "指针内收：e1 → 3，e2 → 4"],
        ["clean", "旧[3]=d vs 新[4]=f → key 不同 → 头尾同步结束"]
      ]
    },
    { // 3 判定
      old: [N("a", "d-stay", "已patch"), N("b"), N("c"), N("d", "dw-cur"), N("e", "d-stay", "已patch")],
      nw:  [N("a", "d-stay", "已patch"), N("d"), N("c"), N("b"), N("f", "dw-cur"), N("e", "d-stay", "已patch")],
      ptr: "i=1 · e1=3 · e2=4",
      data: "通讯录：—<br>对照表：—<br>LIS：—",
      logs: [
        ["sys", "── ③ 判定 ──"],
        ["info", "i(1) ≤ e1(3) 且 i(1) ≤ e2(4) → 双方都有剩余 → 进入乱序主战场"],
        ["out", "旧乱序段 [b, c, d]（下标 1..3）｜ 新乱序段 [d, c, b, f]（下标 1..4）"]
      ]
    },
    { // 4 建通讯录
      old: [N("a", "d-stay", "已patch"), N("b"), N("c"), N("d"), N("e", "d-stay", "已patch")],
      nw:  [N("a", "d-stay", "已patch"), N("d", "", "新[1]"), N("c", "", "新[2]"), N("b", "", "新[3]"), N("f", "", "新[4]"), N("e", "d-stay", "已patch")],
      ptr: "i=1 · e1=3 · e2=4",
      data: "通讯录（keyToNewIndexMap）：<br>&nbsp;&nbsp;{ d:1, c:2, b:3, f:4 }<br>对照表：—<br>LIS：—",
      logs: [
        ["sys", "── ④ 建通讯录（keyToNewIndexMap）──"],
        ["track", "新乱序段逐个登记：d→1，c→2，b→3，f→4"],
        ["info", "以后按 key 查新位置是 O(1) —— 通讯录不发，挨个找要 O(n²)"]
      ]
    },
    { // 5 扫旧建对照表
      old: [N("a", "d-stay", "已patch"), N("b", "dw-cur", "→ 新[3]"), N("c", "dw-cur", "→ 新[2]"), N("d", "dw-cur", "→ 新[1]"), N("e", "d-stay", "已patch")],
      nw:  [N("a", "d-stay", "已patch"), N("d", "", "新[1]"), N("c", "", "新[2]"), N("b", "", "新[3]"), N("f", "d-mount", "新面孔→新建"), N("e", "d-stay", "已patch")],
      ptr: "i=1 · e1=3 · e2=4",
      data: "通讯录：{ d:1, c:2, b:3, f:4 }<br>对照表（新位置 → 旧下标）：<br>&nbsp;&nbsp;[3, 2, 1, -1]（-1 = 新建）<br>moved：<b>true</b>（c 的 2 &lt; d 的 3，顺序倒退了）",
      logs: [
        ["sys", "── ⑤ 扫旧乱序段，建对照表 ──"],
        ["track", "b → 新下标 3：顺序正常（maxSoFar=3）→ 对照表[2]=1"],
        ["clean", "c → 新下标 2 &lt; 3：顺序倒退！moved=true → 对照表[1]=2"],
        ["clean", "d → 新下标 1 → 对照表[0]=3"],
        ["out", "f 在旧列表查无此人 → 对照表[3] = -1（待新建）"]
      ]
    },
    { // 6 LIS
      old: [N("a", "d-stay", "已patch"), N("b", "d-stay", "LIS·不动"), N("c", "", "要挪"), N("d", "", "要挪"), N("e", "d-stay", "已patch")],
      nw:  [N("a", "d-stay", "已patch"), N("d", "", "要挪"), N("c", "", "要挪"), N("b", "d-stay", "LIS·不动"), N("f", "d-mount", "新面孔→新建"), N("e", "d-stay", "已patch")],
      ptr: "i=1 · e1=3 · e2=4",
      data: "对照表：[3, 2, 1, -1]<br>贪心台阶：result=[3] → 2 替换 → [2] → 1 替换 → [1]<br>（-1 = 新建的，跳过不参与）<br><b>LIS = [b]</b>（长度 1，却已是最多不动）",
      logs: [
        ["sys", "── ⑥ 求 LIS：最多不动 = 最少移动 ──"],
        ["info", "台阶过程：result=[3] → 2 来了替换 → [2] → 1 来了替换 → [1]；-1 跳过"],
        ["out", "LIS 长度 1 → 只有 b（对照表下标 2 → 旧下标 1）坐住不动"],
        ["info", "换座位比喻：b 是「相对顺序没变」的最长一人队 —— 数学保证这就是最少移动方案"]
      ]
    },
    { // 7 从后往前落位
      old: [N("a", "d-stay", "已patch"), N("b", "d-stay", "不动"), N("c", "", "已复用"), N("d", "", "已复用"), N("e", "d-stay", "已patch")],
      nw:  [N("a", "d-stay", "已patch"), N("d", "d-move", "移动·插到c前"), N("c", "d-move", "移动·插到b前"), N("b", "d-stay", "LIS·不动"), N("f", "d-mount", "新建·插到e前"), N("e", "d-stay", "已patch")],
      ptr: "j = 3 → 2 → 1 → 0",
      data: "落位顺序（从后往前）：f(建) → b(不动) → c(移) → d(移)<br>锚点一路继承：处理到谁，右边的兄弟已经在正确位置",
      logs: [
        ["sys", "── ⑦ 从后往前，逐个落位 ──"],
        ["run", "j=3：f 新面孔 → mount，anchor=e → 插到 e 前面"],
        ["run", "j=2：b 在 LIS 里 → 只 patch，不挪"],
        ["run", "j=1：c 不在 LIS → insert(c, anchor=b) → 挪到 b 前面"],
        ["run", "j=0：d 不在 LIS → insert(d, anchor=c) → 挪到 c 前面"]
      ]
    },
    { // 8 总账
      old: [N("a", "d-stay", "patch"), N("b", "d-stay", "LIS·不动"), N("c", "d-move", "移动"), N("d", "d-move", "移动"), N("e", "d-stay", "patch")],
      nw:  [N("a", "d-stay", "patch"), N("d", "d-move", "移动"), N("c", "d-move", "移动"), N("b", "d-stay", "LIS·不动"), N("f", "d-mount", "新建"), N("e", "d-stay", "patch")],
      ptr: "完成 ✅",
      data: "<b>总账：0 卸载 · 1 新建 · 2 移动 · 3 原地 patch</b><br>对比全删重建：5 卸 + 6 挂 = 11 次，状态全丢",
      logs: [
        ["out", "✅ 落位完成：a d c b f e"],
        ["out", "总账：0 卸载 · 1 新建 · 2 次移动 · 3 次原地 patch"],
        ["info", "五个旧节点全部复用，一个都没销毁 —— 这就是 diff 的全部意义"]
      ]
    },
  ];

  function render(st) {
    function node(n) { return '<span class="dnode ' + n.c + '">' + n.k + "<small>" + n.l + "</small></span>"; }
    oldRow.innerHTML = '<span class="drl">旧</span>' + st.old.map(node).join("");
    newRow.innerHTML = '<span class="drl">新</span>' + st.nw.map(node).join("");
    stateEl.innerHTML = "指针：" + st.ptr;
    dataEl.innerHTML = st.data;
    stepEl.querySelector(".v").textContent = step + " / 8";
    bump(stepEl);
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
      tipEl.textContent = "💡 推演完毕 —— 换到下面的「快速实验室」随便输入 key 序列，看总账变化。";
      return false;
    }
    return true;
  }
  $("dwSteps").addEventListener("click", function (e) {
    var b = e.target.closest(".step-btn");
    if (!b) return;
    var v = b.getAttribute("data-dw");
    if (v === "reset") { reset(); return; }
    if (v === "next") { next(); return; }
    if (v === "auto") {
      if (timer) { clearInterval(timer); timer = null; b.textContent = "⏩ 自动播放"; return; }
      b.textContent = "⏸ 暂停";
      timer = setInterval(function () {
        if (!next()) { clearInterval(timer); timer = null; b.textContent = "⏩ 自动播放"; }
      }, 1100);
    }
  });
  reset();
})();
