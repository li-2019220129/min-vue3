/* ============================================================
   插图系统：吉祥物 V豆 · 章首横幅 · 概念插图 · 已读撒花 · 结业彩蛋
   依赖：chapters.js（GROUPS/ALL/BY_ID）、summaries.js（SUMMARIES）
   ============================================================ */
"use strict";

/* ============================================================
   一、吉祥物 V豆（SVG 绘制函数）
   pose: wave / read / work / point / think / celebrate / watch / speak / broom / walkie
   ============================================================ */
var GID = 0;

function _grad() {
  var id = "vg" + (++GID);
  return {
    id: id,
    def: '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#5fe3a1"/><stop offset="1" stop-color="#2c8c65"/></linearGradient>'
  };
}

var _ARM = {
  downL:  '<path d="M58 120 Q40 128 36 144" fill="none" stroke="#2c8c65" stroke-width="11" stroke-linecap="round"/>',
  downR:  '<path d="M142 120 Q160 128 164 144" fill="none" stroke="#2c8c65" stroke-width="11" stroke-linecap="round"/>',
  upL:    '<path d="M60 110 Q42 96 40 72" fill="none" stroke="#2c8c65" stroke-width="11" stroke-linecap="round"/>',
  upR:    '<path d="M140 110 Q158 96 160 72" fill="none" stroke="#2c8c65" stroke-width="11" stroke-linecap="round"/>',
  fwdL:   '<path d="M58 118 Q52 104 68 96" fill="none" stroke="#2c8c65" stroke-width="11" stroke-linecap="round"/>',
  fwdR:   '<path d="M142 118 Q148 104 132 96" fill="none" stroke="#2c8c65" stroke-width="11" stroke-linecap="round"/>',
  pointR: '<path d="M144 112 Q168 106 186 98" fill="none" stroke="#2c8c65" stroke-width="11" stroke-linecap="round"/>',
  chinR:  '<path d="M142 116 Q126 126 114 122" fill="none" stroke="#2c8c65" stroke-width="11" stroke-linecap="round"/>'
};

function _mascotInner(pose, dx, dy, sc) {
  var g = _grad();
  var arms = "", props = "", eyes =
    '<circle cx="84" cy="92" r="5.5" fill="#22303c"/><circle cx="86" cy="90" r="1.8" fill="#fff"/>' +
    '<circle cx="116" cy="92" r="5.5" fill="#22303c"/><circle cx="118" cy="90" r="1.8" fill="#fff"/>';
  switch (pose) {
    case "wave":
      arms = _ARM.downL + _ARM.upR;
      props = '<text x="174" y="62" font-size="21" text-anchor="middle">👋</text>'; break;
    case "read":
      arms = _ARM.fwdL + _ARM.fwdR;
      props = '<text x="146" y="74" font-size="24" text-anchor="middle">📖</text>'; break;
    case "work":
      arms = _ARM.downL + _ARM.pointR;
      props = '<text x="190" y="92" font-size="19" text-anchor="middle">🔧</text>'; break;
    case "point":
      arms = _ARM.downL + _ARM.pointR; break;
    case "think":
      arms = _ARM.downL + _ARM.chinR;
      props = '<text x="146" y="52" font-size="20" text-anchor="middle">💭</text>'; break;
    case "celebrate":
      arms = _ARM.upL + _ARM.upR;
      props = '<text x="34" y="58" font-size="19" text-anchor="middle">🎉</text>' +
              '<text x="168" y="54" font-size="17" text-anchor="middle">✨</text>'; break;
    case "watch":
      arms = _ARM.downL + _ARM.fwdR;
      props = '<text x="146" y="80" font-size="21" text-anchor="middle">🔭</text>'; break;
    case "speak":
      arms = _ARM.downL + _ARM.pointR;
      props = '<text x="192" y="90" font-size="20" text-anchor="middle">📣</text>' +
              '<path d="M186 74 q8 -6 6 -16" fill="none" stroke="#8b949e" stroke-width="2.2" stroke-linecap="round"/>' +
              '<path d="M193 78 q12 -10 10 -26" fill="none" stroke="#b9c0c9" stroke-width="2.2" stroke-linecap="round"/>'; break;
    case "broom":
      arms = _ARM.downL + _ARM.pointR;
      props = '<text x="190" y="92" font-size="20" text-anchor="middle">🧹</text>'; break;
    case "walkie":
      arms = _ARM.downR + _ARM.fwdL;
      props = '<text x="150" y="82" font-size="20" text-anchor="middle">📻</text>'; break;
    default:
      arms = _ARM.downL + _ARM.downR;
  }
  var inner =
    '<ellipse cx="100" cy="170" rx="48" ry="7" fill="#1f6f4e" opacity=".10"/>' +
    arms +
    '<line x1="100" y1="48" x2="100" y2="26" stroke="#2c8c65" stroke-width="5" stroke-linecap="round"/>' +
    '<circle cx="100" cy="20" r="7" fill="#647eff"/>' +
    '<path d="M100 44 C146 44 162 80 162 112 C162 148 134 164 100 164 C66 164 38 148 38 112 C38 80 54 44 100 44 Z" fill="url(#' + g.id + ')"/>' +
    '<ellipse cx="82" cy="72" rx="13" ry="18" fill="#fff" opacity=".16"/>' +
    eyes +
    '<ellipse cx="72" cy="104" rx="7" ry="4.5" fill="#ffb3c1" opacity=".55"/>' +
    '<ellipse cx="128" cy="104" rx="7" ry="4.5" fill="#ffb3c1" opacity=".55"/>' +
    '<path d="M90 108 Q100 117 110 108" fill="none" stroke="#22303c" stroke-width="3.5" stroke-linecap="round"/>' +
    '<rect x="86" y="120" width="28" height="22" rx="7" fill="#fff" opacity=".93"/>' +
    '<text x="100" y="137" font-size="15" font-weight="900" fill="#2c8c65" text-anchor="middle" font-family="ui-monospace,Consolas,monospace">V</text>' +
    props;
  return '<g class="mascot-bob" transform="translate(' + (dx || 0) + ',' + (dy || 0) + ') scale(' + (sc || 1) + ')">' +
    '<defs>' + g.def + '</defs>' + inner + '</g>';
}

function mascot(pose) {
  return '<svg viewBox="0 0 200 178" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    _mascotInner(pose, 0, 0, 1) + '</svg>';
}

/* ============================================================
   二、场景小工具（箭头 / 标签片 / emoji / 盒子）
   ============================================================ */
function sEmo(x, y, ch, s) {
  return '<text x="' + x + '" y="' + y + '" font-size="' + (s || 22) + '" text-anchor="middle">' + ch + '</text>';
}
function sArrow(x1, y1, x2, y2, c, w) {
  c = c || "#8b949e"; w = w || 2.5;
  var a = Math.atan2(y2 - y1, x2 - x1), L = 9;
  var p1x = x2 - L * Math.cos(a - 0.42), p1y = y2 - L * Math.sin(a - 0.42);
  var p2x = x2 - L * Math.cos(a + 0.42), p2y = y2 - L * Math.sin(a + 0.42);
  return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round"/>' +
    '<polygon points="' + x2 + ',' + y2 + ' ' + p1x.toFixed(1) + ',' + p1y.toFixed(1) + ' ' + p2x.toFixed(1) + ',' + p2y.toFixed(1) + '" fill="' + c + '"/>';
}
function sChip(x, y, w, txt, bg, fg, fs) {
  fs = fs || 13;
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="26" rx="13" fill="' + bg + '" stroke="' + fg + '" stroke-opacity=".4"/>' +
    '<text x="' + (x + w / 2) + '" y="' + (y + 17.5) + '" font-size="' + fs + '" font-weight="700" fill="' + fg + '" text-anchor="middle" font-family="ui-monospace,Consolas,monospace">' + txt + '</text>';
}
function sLabel(x, y, txt, fill, fs) {
  return '<text x="' + x + '" y="' + y + '" font-size="' + (fs || 13) + '" font-weight="700" fill="' + (fill || "#59636e") + '" text-anchor="middle">' + txt + '</text>';
}
function sBox(x, y, w, h, fill, stroke, rx) {
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 12) + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.6"/>';
}
function sDotGrid(x0, y0, cols, rows, gap, color) {
  var out = "";
  for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++)
    out += '<circle cx="' + (x0 + c * gap) + '" cy="' + (y0 + r * gap) + '" r="2" fill="' + color + '" opacity=".35"/>';
  return out;
}
function sWrap(inner) {
  return '<svg viewBox="0 0 620 300" xmlns="http://www.w3.org/2000/svg" role="img">' + inner + '</svg>';
}

/* ============================================================
   三、概念插图库（data-art 对应）
   ============================================================ */
var SCENES = {

  /* 第 2 章：effect —— 给函数别上追踪器 */
  "effect-walkie": sWrap(
    sDotGrid(250, 40, 14, 8, 26, "#9aa4af") +
    _mascotInner("walkie", 42, 108, 0.92) +
    sBox(322, 62, 224, 96, "#282c34", "#1e2229", 12) +
    '<text x="340" y="90" font-size="13" fill="#c678dd" font-family="ui-monospace,Consolas,monospace">effect(() =&gt; {</text>' +
    '<text x="340" y="114" font-size="13" fill="#98c379" font-family="ui-monospace,Consolas,monospace">  <tspan fill="#e06c75" text-decoration="underline">state.name</tspan> → 标题</text>' +
    '<text x="340" y="138" font-size="13" fill="#abb2bf" font-family="ui-monospace,Consolas,monospace">})   <tspan fill="#7f848e">// 读取即登记</tspan></text>' +
    sArrow(330, 122, 262, 148, "#3ba776") +
    sChip(310, 188, 178, "track：记下这位读者", "#e9f7f1", "#2c8c65") +
    sArrow(399, 186, 330, 168, "#a9dfc5") +
    sEmo(560, 250, "👀", 20) + sLabel(560, 278, "数据一变就喊它", "#59636e", 12)
  ),

  /* 第 4 章：track —— 点名册 */
  "track-roster": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("point", 34, 112, 0.9) +
    sArrow(196, 158, 236, 150, "#3ba776") +
    sBox(240, 44, 250, 212, "#ffffff", "#c8e8d9", 14) +
    '<rect x="240" y="44" width="250" height="40" rx="14" fill="#e9f7f1"/>' +
    '<rect x="240" y="70" width="250" height="14" fill="#e9f7f1"/>' +
    sLabel(365, 70, "点名册 · targetMap", "#1f6f4e", 15) +
    sChip(258, 100, 130, "target: state", "#f7f8fa", "#59636e", 12) +
    sLabel(424, 117, "key: name", "#59636e", 12.5) +
    sChip(258, 140, 100, "effectA ✓", "#e9f7f1", "#2c8c65", 12) +
    sChip(368, 140, 100, "effectB ✓", "#e9f7f1", "#2c8c65", 12) +
    sChip(258, 178, 100, "渲染函数 ✓", "#eaf4fc", "#0e7cc2", 12) +
    sChip(368, 178, 100, "watcher ✓", "#fdf6e3", "#a16207", 12) +
    sLabel(365, 236, "谁读了我，就登记谁", "#8b949e", 12) +
    sEmo(540, 120, "📋", 30) + sEmo(556, 200, "✍️", 24)
  ),

  /* 第 5 章：trigger —— 大喇叭广播 */
  "trigger-megaphone": sWrap(
    sDotGrid(250, 40, 14, 8, 26, "#9aa4af") +
    _mascotInner("speak", 42, 108, 0.92) +
    sArrow(300, 120, 356, 100, "#e06c75") +
    sArrow(300, 130, 356, 148, "#e06c75") +
    sArrow(300, 140, 356, 196, "#e06c75") +
    sChip(366, 84, 130, "effectA 重跑!", "#fdeef2", "#be3455", 12.5) +
    sChip(366, 132, 130, "effectB 标脏!", "#fdeef2", "#be3455", 12.5) +
    sChip(366, 182, 130, "watch 回调!", "#fdeef2", "#be3455", 12.5) +
    sLabel(430, 244, "state.count++ 的一瞬间", "#59636e", 12.5) +
    sEmo(560, 110, "⚡", 26) + sEmo(540, 200, "📢", 24)
  ),

  /* 第 6 章：cleanup —— 保洁阿姨清算过期名单 */
  "cleanup-broom": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("broom", 40, 108, 0.92) +
    '<g stroke-dasharray="5 4">' +
    '<rect x="300" y="86" width="96" height="34" rx="8" fill="#fdf6e3" stroke="#d19a66"/>' +
    '<rect x="352" y="140" width="96" height="34" rx="8" fill="#fdf6e3" stroke="#d19a66"/>' +
    '<rect x="292" y="196" width="96" height="34" rx="8" fill="#fdf6e3" stroke="#d19a66"/></g>' +
    sLabel(348, 108, "state.a ?", "#a16207", 12) +
    sLabel(400, 162, "过期依赖", "#a16207", 12) +
    sLabel(340, 218, "旧分支残留", "#a16207", 12) +
    sArrow(396, 110, 470, 128, "#d19a66") +
    sArrow(452, 158, 478, 152, "#d19a66") +
    sArrow(392, 214, 470, 182, "#d19a66") +
    sBox(486, 108, 88, 96, "#f4f5f7", "#c9ced6", 12) +
    sEmo(530, 168, "🗑️", 30) +
    sLabel(530, 232, "version 快照对账", "#59636e", 12) +
    sEmo(280, 250, "✨", 18)
  ),

  /* 第 7 章：ref —— 礼盒里的原始值 */
  "ref-gift": sWrap(
    sDotGrid(250, 40, 14, 8, 26, "#9aa4af") +
    _mascotInner("wave", 42, 108, 0.92) +
    sArrow(240, 150, 280, 148, "#3ba776") +
    sBox(286, 96, 92, 74, "#fdf6e3", "#b0851f", 12) +
    '<line x1="332" y1="96" x2="332" y2="170" stroke="#b0851f" stroke-width="5"/>' +
    '<line x1="286" y1="132" x2="378" y2="132" stroke="#b0851f" stroke-width="5"/>' +
    '<circle cx="332" cy="64" r="24" fill="#e9f7f1" stroke="#2c8c65" stroke-width="1.8"/>' +
    sLabel(332, 71, "0", "#2c8c65", 20) +
    sArrow(366, 52, 420, 52, "#8b949e") +
    '<circle cx="452" cy="52" r="24" fill="#eaf4fc" stroke="#0e7cc2" stroke-width="1.8"/>' +
    sLabel(452, 59, "1", "#0e7cc2", 20) +
    sChip(286, 190, 190, "count.value = 1", "#fff", "#8a6a12", 12.5) +
    sLabel(381, 244, "原始值装进盒子：拦截 .value 的读写", "#59636e", 12) +
    sEmo(540, 120, "🎁", 30) + sEmo(560, 200, "🔢", 22)
  ),

  /* 第 8 章：computed —— 冰箱里的牛奶 */
  "computed-fridge": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("think", 36, 112, 0.9) +
    sArrow(210, 160, 268, 150, "#3ba776") +
    sChip(226, 84, 118, "dirty？去看一眼", "#e9f7f1", "#2c8c65", 12) +
    sBox(286, 42, 150, 216, "#f4f8fb", "#a8cdea", 14) +
    '<rect x="286" y="100" width="150" height="5" fill="#a8cdea"/>' +
    '<rect x="418" y="70" width="8" height="44" rx="4" fill="#a8cdea"/>' +
    '<rect x="418" y="122" width="8" height="56" rx="4" fill="#a8cdea"/>' +
    sEmo(361, 86, "🧊", 24) + sEmo(361, 160, "🥛", 34) +
    sLabel(361, 200, "缓存的新鲜牛奶", "#14507e", 12.5) +
    sChip(456, 66, 130, "源数据变了 → 标脏", "#fdeef2", "#be3455", 11.5) +
    sChip(456, 104, 130, "有人读 → 才重算", "#eaf4fc", "#0e7cc2", 11.5) +
    sChip(456, 142, 130, "没变 → 直接开盖", "#e9f7f1", "#2c8c65", 11.5) +
    sLabel(361, 282, "computed：聪明的偷懒，理直气壮", "#59636e", 12.5)
  ),

  /* 第 9 章：watch —— 优雅的观察者 */
  "watch-doorbell": sWrap(
    sDotGrid(250, 40, 14, 8, 26, "#9aa4af") +
    _mascotInner("watch", 42, 112, 0.9) +
    sBox(360, 84, 150, 130, "#fdf6e3", "#b0851f", 12) +
    '<polygon points="360,84 435,34 510,84" fill="#f3e2b3" stroke="#b0851f" stroke-width="1.6"/>' +
    '<rect x="414" y="140" width="42" height="74" rx="6" fill="#e7d9a8" stroke="#b0851f"/>' +
    sLabel(435, 122, "数据源 source", "#8a6a12", 13) +
    sEmo(435, 236, "🔔", 22) +
    '<path d="M414 250 q-60 6 -110 -14" fill="none" stroke="#8b949e" stroke-width="2" stroke-dasharray="5 4"/>' +
    sChip(196, 216, 120, "变了 → 叫我", "#eaf4fc", "#0e7cc2", 12) +
    sArrow(196, 244, 196, 262, "#0e7cc2") +
    sChip(140, 266, 232, "job：pre / post / sync 三张入场券", "#fff", "#0e7cc2", 11.5) +
    sLabel(435, 282, "怎么响应，听观察者的", "#59636e", 12.5)
  ),

  /* 第 18 章：diff —— 快递分拣中心 */
  "diff-express": sWrap(
    sLabel(150, 40, "旧 children（快递单）", "#59636e", 13.5) +
    (function () {
      var old = [["A", "#e9f7f1", "#2c8c65"], ["B", "#f4f5f7", "#9aa4af"], ["C", "#eaf4fc", "#0e7cc2"], ["D", "#eaf4fc", "#0e7cc2"]];
      var out = "", x = 70;
      old.forEach(function (b) {
        out += sBox(x, 56, 50, 44, b[1], b[2], 9) + sLabel(x + 25, 85, b[0], b[2], 20);
        x += 66;
      });
      return out;
    })() +
    sLabel(150, 158, "新 children（分拣结果）", "#59636e", 13.5) +
    (function () {
      var neo = [["A", "✓ patch", "#e9f7f1", "#2c8c65"], ["D", "↕ 移动", "#eaf4fc", "#0e7cc2"], ["C", "✓ LIS 不动", "#e9f7f1", "#2c8c65"], ["E", "＋ 新增", "#fdf6e3", "#8a6a12"]];
      var out = "", x = 70;
      neo.forEach(function (b) {
        out += sBox(x, 174, 50, 44, b[2], b[3], 9) + sLabel(x + 25, 203, b[0], b[3], 20) +
          '<text x="' + (x + 25) + '" y="238" font-size="10.5" fill="' + b[3] + '" text-anchor="middle" font-weight="700">' + b[1] + '</text>';
        x += 66;
      });
      return out;
    })() +
    '<g stroke="#c9ced6" stroke-width="2" fill="none"></g>' +
    sArrow(293, 104, 166, 166, "#0e7cc2") +
    '<circle cx="254" cy="56" r="12" fill="#e9f7f1" stroke="#2c8c65" stroke-width="1.6"/>' +
    '<text x="254" y="60" font-size="8.5" font-weight="800" fill="#2c8c65" text-anchor="middle">LIS</text>' +
    '<g transform="translate(161,58) rotate(-8)"><text font-size="26" fill="#c0392b" opacity=".8">✕</text></g>' +
    sChip(96, 114, 150, "B 卸载 unmount", "#fdeef2", "#be3455", 12) +
    sArrow(171, 112, 162, 103, "#be3455") +
    sChip(388, 246, 220, "LIS = [A, C] → 不动它们", "#e9f7f1", "#1f6f4e", 12.5) +
    sLabel(560, 196, "复用优先", "#8b949e", 12) + sEmo(556, 172, "📦", 24) +
    sLabel(310, 292, "diff：该动的才动，最贵的操作留给最少的节点", "#59636e", 12.5)
  ),

  /* 第 21 章：启动全流程 —— 火箭发射 */
  "startflow-rocket": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("celebrate", 36, 118, 0.88) +
    '<path d="M400 240 q-30 -60 10 -120" fill="none" stroke="#b9c0c9" stroke-width="2.5" stroke-dasharray="6 5"/>' +
    sEmo(418, 92, "🚀", 52) + sEmo(478, 60, "✨", 22) + sEmo(356, 70, "⭐", 16) +
    sChip(60, 66, 170, "① createApp(App)", "#e9f7f1", "#1f6f4e", 13) +
    sChip(84, 122, 170, "② app.mount('#app')", "#eaf4fc", "#0e7cc2", 13) +
    sChip(108, 178, 170, "③ patch → mountComponent", "#fdf6e3", "#8a6a12", 12.5) +
    sArrow(232, 80, 258, 110, "#8b949e") +
    sArrow(256, 136, 282, 166, "#8b949e") +
    sChip(300, 210, 130, "🎨 第一个像素!", "#fdeef2", "#be3455", 13) +
    sLabel(310, 282, "三次翻译，一飞冲天 —— 全书机器首次联动", "#59636e", 12.5)
  ),

  /* 第 23 章：调度器 —— 取号机 */
  "scheduler-queue": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("work", 40, 112, 0.9) +
    sArrow(226, 156, 286, 140, "#3ba776") +
    sBox(292, 48, 250, 160, "#1d2128", "#333842", 12) +
    '<text x="310" y="78" font-size="13.5" fill="#98c379" font-family="ui-monospace,Consolas,monospace">queue: [</text>' +
    '<text x="322" y="102" font-size="13" fill="#61afef" font-family="ui-monospace,Consolas,monospace">{ id:1, 父组件 job },</text>' +
    '<text x="322" y="126" font-size="13" fill="#61afef" font-family="ui-monospace,Consolas,monospace">{ id:2, 子组件 job },</text>' +
    '<text x="322" y="150" font-size="13" fill="#e5c07b" font-family="ui-monospace,Consolas,monospace">{ id:3, watch 回调 }</text>' +
    '<text x="310" y="182" font-size="13.5" fill="#98c379" font-family="ui-monospace,Consolas,monospace">] → 一趟 flushJobs()</text>' +
    sChip(292, 226, 150, "🎫 同帧只更新一次", "#e9f7f1", "#2c8c65", 12) +
    sChip(456, 226, 150, "nextTick 排在散场后", "#eaf4fc", "#0e7cc2", 12) +
    sLabel(417, 282, "改 10 个数据 = 只重渲 1 次：微任务批处理", "#59636e", 12.5)
  ),

  /* 第 30 章：编译器 —— 翻译流水线 */
  "compiler-translator": sWrap(
    sDotGrid(30, 200, 6, 3, 24, "#9aa4af") +
    _mascotInner("point", 30, 96, 0.78) +
    sChip(206, 60, 108, "📄 template", "#f7f8fa", "#59636e", 12.5) +
    sArrow(318, 72, 350, 84, "#8b949e") +
    sBox(356, 52, 90, 52, "#e9f7f1", "#3ba776", 12) + sLabel(401, 76, "parse", "#1f6f4e", 15) + sEmo(401, 94, "🌳", 15) +
    sArrow(450, 78, 480, 90, "#8b949e") +
    sBox(484, 52, 110, 52, "#eaf4fc", "#0e7cc2", 12) + sLabel(539, 76, "transform", "#0e7cc2", 14) + sEmo(539, 94, "🧅", 15) +
    sArrow(539, 108, 539, 138, "#8b949e") +
    sBox(484, 142, 110, 52, "#fdeef2", "#be3455", 12) + sLabel(539, 166, "generate", "#be3455", 14) + sEmo(539, 184, "🖨️", 15) +
    sArrow(480, 170, 452, 182, "#8b949e") +
    sBox(330, 150, 118, 52, "#fdf6e3", "#b0851f", 12) +
    '<text x="389" y="174" font-size="12" fill="#8a6a12" text-anchor="middle" font-family="ui-monospace,Consolas,monospace">render(){...}</text>' +
    sLabel(389, 196, "render 函数出炉", "#8a6a12", 11.5) +
    sChip(330, 226, 118, "+ patchFlag ⚡", "#fff", "#1f6f4e", 11.5) +
    sChip(456, 226, 138, "+ 静态提升 ⬆️", "#fff", "#0e7cc2", 11.5) +
    sLabel(370, 282, "编译期多干点，运行时少干点", "#59636e", 12.5)
  ),

  /* 第 28 章：KeepAlive —— 仓库货架 */
  "keepalive-warehouse": sWrap(
    sDotGrid(250, 40, 14, 4, 26, "#9aa4af") +
    _mascotInner("work", 40, 118, 0.88) +
    sArrow(220, 160, 300, 140, "#3ba776") +
    '<rect x="300" y="70" width="270" height="10" rx="5" fill="#c8a56b"/>' +
    '<rect x="300" y="140" width="270" height="10" rx="5" fill="#c8a56b"/>' +
    sBox(320, 92, 56, 46, "#e9f7f1", "#2c8c65", 8) + sLabel(348, 121, "A", "#2c8c65", 19) +
    sBox(392, 92, 56, 46, "#e9f7f1", "#2c8c65", 8) + sLabel(420, 121, "B", "#2c8c65", 19) +
    sBox(320, 162, 56, 46, "#eaf4fc", "#0e7cc2", 8) + sLabel(348, 191, "C", "#0e7cc2", 19) +
    '<g transform="rotate(-10 380 210)"><rect x="352" y="188" width="56" height="46" rx="8" fill="#fdf6e3" stroke="#b0851f"/><text x="380" y="218" font-size="18" font-weight="800" fill="#8a6a12" text-anchor="middle">C</text></g>' +
    sArrow(430, 200, 376, 196, "#b0851f") +
    sChip(452, 158, 110, "deactivate", "#fdf6e3", "#8a6a12", 11.5) +
    sLabel(435, 58, "缓存仓库 storageContainer", "#8a6a12", 12.5) +
    sChip(300, 236, 160, "cache: Map + LRU", "#f7f8fa", "#59636e", 12) +
    sChip(472, 236, 98, "max: 2", "#fdeef2", "#be3455", 12) +
    sLabel(435, 284, "DOM 搬进仓库不销毁：状态全在", "#59636e", 12.5)
  ),

  /* 第 1 章：四包单向依赖小楼 */
  "overview-tower": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("point", 34, 112, 0.9) +
    sArrow(206, 150, 250, 130, "#3ba776") +
    sBox(256, 192, 260, 42, "#f7f8fa", "#9aa4af", 9) +
    '<text x="386" y="218" font-size="12.5" font-weight="700" fill="#59636e" text-anchor="middle" font-family="ui-monospace,Consolas,monospace">shared · 工具函数</text>' +
    sBox(256, 140, 260, 42, "#e9f7f1", "#2c8c65", 9) +
    '<text x="386" y="166" font-size="12.5" font-weight="700" fill="#1f6f4e" text-anchor="middle" font-family="ui-monospace,Consolas,monospace">reactivity · 响应式核心 ⭐</text>' +
    sBox(256, 88, 260, 42, "#eaf4fc", "#0e7cc2", 9) +
    '<text x="386" y="114" font-size="12.5" font-weight="700" fill="#14507e" text-anchor="middle" font-family="ui-monospace,Consolas,monospace">runtime-core · 跨平台渲染器</text>' +
    sBox(256, 36, 260, 42, "#fdf6e3", "#b0851f", 9) +
    '<text x="386" y="62" font-size="12.5" font-weight="700" fill="#8a6a12" text-anchor="middle" font-family="ui-monospace,Consolas,monospace">runtime-dom · 浏览器适配层</text>' +
    sArrow(548, 214, 548, 58, "#8b949e", 2) +
    sLabel(548, 44, "依赖方向", "#8b949e", 11) +
    sLabel(386, 262, "上层点菜，下层做菜：依赖永远朝下", "#59636e", 12.5)
  ),

  /* 第 3 章：Proxy 玻璃房 */
  "reactive-castle": sWrap(
    sDotGrid(250, 40, 14, 8, 26, "#9aa4af") +
    _mascotInner("work", 42, 108, 0.92) +
    sArrow(246, 158, 292, 172, "#0e7cc2") +
    '<rect x="298" y="54" width="230" height="190" rx="14" fill="#eaf4fc" fill-opacity=".38" stroke="#0e7cc2" stroke-width="1.8"/>' +
    sBox(318, 86, 84, 40, "#fff", "#a8cdea", 8) +
    '<text x="360" y="111" font-size="12" font-weight="700" fill="#14507e" text-anchor="middle" font-family="ui-monospace,Consolas,monospace">target</text>' +
    sBox(424, 86, 84, 40, "#fff", "#a8cdea", 8) +
    '<text x="466" y="111" font-size="12" font-weight="700" fill="#14507e" text-anchor="middle" font-family="ui-monospace,Consolas,monospace">name: 张三</text>' +
    sEmo(412, 74, "🏠", 22) +
    sBox(388, 182, 50, 62, "#dbeafe", "#0e7cc2", 6) +
    sChip(346, 256, 134, "get / set 拦截", "#eaf4fc", "#0e7cc2", 12) +
    sLabel(413, 292, "懒代理：你读到哪一层，管家才包到哪一层", "#59636e", 12)
  ),

  /* 第 10 章：套娃与团长 */
  "nested-dolls": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("point", 34, 112, 0.9) +
    '<circle cx="400" cy="150" r="95" fill="none" stroke="#c9ced6" stroke-width="2"/>' +
    '<circle cx="400" cy="150" r="62" fill="none" stroke="#0e7cc2" stroke-width="2" stroke-dasharray="6 4"/>' +
    '<circle cx="400" cy="150" r="32" fill="#e9f7f1" stroke="#2c8c65" stroke-width="2"/>' +
    sLabel(400, 72, "全局 scope", "#8b949e", 12) +
    sLabel(400, 106, "组件 scope", "#0e7cc2", 12) +
    sLabel(400, 155, "effect", "#2c8c65", 13) +
    sEmo(517, 96, "🪆", 24) +
    sChip(452, 262, 158, "scope.stop() 一声解散", "#fdeef2", "#be3455", 12) +
    sArrow(498, 258, 486, 240, "#be3455") +
    sLabel(196, 276, "进内层先暂存，出内层再还原 —— 指针永不串号", "#59636e", 12)
  ),

  /* 第 11 章：customRef 手动挡 */
  "customref-gears": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("work", 40, 112, 0.9) +
    sArrow(222, 160, 280, 152, "#3ba776") +
    sBox(300, 110, 190, 120, "#f4f5f7", "#9aa4af", 12) +
    '<path d="M350 134 v72 M440 134 v72 M350 170 h90" fill="none" stroke="#b9c0c9" stroke-width="8" stroke-linecap="round"/>' +
    '<circle cx="350" cy="134" r="15" fill="#2c8c65"/>' +
    '<circle cx="440" cy="134" r="15" fill="none" stroke="#0e7cc2" stroke-width="2" stroke-dasharray="4 3"/>' +
    sChip(306, 76, 78, "track ✋", "#e9f7f1", "#2c8c65", 12) +
    sChip(406, 76, 86, "trigger ✋", "#eaf4fc", "#0e7cc2", 12) +
    sEmo(540, 160, "⚙️", 24) +
    sLabel(395, 282, "挡把在你手里：什么时候收集、什么时候通知，你说了算", "#59636e", 12.5)
  ),

  /* 第 12 章：五步诊断法 */
  "practice-doctor": sWrap(
    sDotGrid(250, 40, 14, 8, 26, "#9aa4af") +
    _mascotInner("think", 40, 110, 0.92) +
    sEmo(148, 76, "🩺", 20) +
    sArrow(238, 150, 282, 140, "#3ba776") +
    sBox(288, 44, 262, 214, "#fff", "#c8e8d9", 12) +
    '<rect x="288" y="44" width="262" height="38" rx="12" fill="#e9f7f1"/>' +
    '<rect x="288" y="68" width="262" height="14" fill="#e9f7f1"/>' +
    sLabel(419, 69, "五步诊断法 · 数据变了页面不动？", "#1f6f4e", 13.5) +
    '<text x="306" y="112" font-size="12.5" fill="#3a424b">① 读写的是同一份对象吗（toRaw 对比）</text>' +
    '<text x="306" y="142" font-size="12.5" fill="#3a424b">② 有没有解构 / 展开（断线高发区）</text>' +
    '<text x="306" y="172" font-size="12.5" fill="#3a424b">③ shallow / markRaw 拒收了吗</text>' +
    '<text x="306" y="202" font-size="12.5" fill="#3a424b">④ 集合类型走了另一套拦截器？</text>' +
    '<text x="306" y="232" font-size="12.5" fill="#3a424b">⑤ watch 的 source 写法对吗</text>' +
    sLabel(419, 282, "九成「页面不动」都是丢了响应式连接", "#59636e", 12.5)
  ),

  /* 第 13 章：Set/Map 两套便当 */
  "collections-bento": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("think", 36, 112, 0.9) +
    sBox(280, 64, 140, 160, "#fff", "#0e7cc2", 12) +
    sLabel(350, 90, "Set", "#0e7cc2", 15) +
    '<circle cx="316" cy="128" r="13" fill="#eaf4fc" stroke="#0e7cc2"/>' +
    '<circle cx="350" cy="128" r="13" fill="#eaf4fc" stroke="#0e7cc2"/>' +
    '<circle cx="384" cy="128" r="13" fill="#eaf4fc" stroke="#0e7cc2"/>' +
    '<circle cx="333" cy="176" r="13" fill="#eaf4fc" stroke="#0e7cc2"/>' +
    '<circle cx="367" cy="176" r="13" fill="#eaf4fc" stroke="#0e7cc2"/>' +
    sBox(440, 64, 140, 160, "#fff", "#2c8c65", 12) +
    sLabel(510, 90, "Map", "#2c8c65", 15) +
    sChip(452, 110, 116, "key → value", "#e9f7f1", "#2c8c65", 11) +
    sChip(452, 146, 116, "key → value", "#e9f7f1", "#2c8c65", 11) +
    sChip(452, 182, 116, "key → value", "#e9f7f1", "#2c8c65", 11) +
    sChip(280, 244, 300, "读方法埋 track · 写方法埋 trigger", "#fdf6e3", "#8a6a12", 12) +
    sLabel(430, 282, "同一个 Proxy，两套拦截策略（collectionHandlers）", "#59636e", 12)
  ),

  /* 第 14 章：Dep 与 Link 手拉手 */
  "linkedlist-hands": sWrap(
    sDotGrid(250, 40, 14, 8, 26, "#9aa4af") +
    _mascotInner("point", 34, 112, 0.9) +
    '<circle cx="300" cy="130" r="34" fill="#eaf4fc" stroke="#0e7cc2" stroke-width="2"/>' +
    sLabel(300, 136, "dep", "#0e7cc2", 15) +
    '<circle cx="410" cy="130" r="24" fill="#f7f8fa" stroke="#9aa4af" stroke-width="2"/>' +
    sLabel(410, 136, "Link", "#59636e", 12) +
    '<circle cx="516" cy="130" r="34" fill="#e9f7f1" stroke="#2c8c65" stroke-width="2"/>' +
    sLabel(516, 136, "sub", "#2c8c65", 15) +
    sArrow(338, 116, 382, 116, "#8b949e", 2) +
    sArrow(382, 146, 338, 146, "#8b949e", 2) +
    sArrow(438, 116, 478, 116, "#8b949e", 2) +
    sArrow(478, 146, 438, 146, "#8b949e", 2) +
    sLabel(360, 100, "next", "#8b949e", 10.5) +
    sLabel(360, 168, "prev", "#8b949e", 10.5) +
    sLabel(458, 100, "next", "#8b949e", 10.5) +
    sLabel(458, 168, "prev", "#8b949e", 10.5) +
    sChip(300, 210, 240, "登记 / 摘除都是 O(1)，全靠这两根指针", "#e9f7f1", "#1f6f4e", 12) +
    sLabel(420, 282, "dep 与 sub 的每次相遇，记成一节双向链", "#59636e", 12.5)
  ),

  /* 第 16 章：两张快照对比 */
  "hvnode-photo": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("think", 34, 112, 0.88) +
    sLabel(296, 46, "旧 vnode 📸", "#59636e", 12.5) +
    sBox(216, 56, 160, 132, "#fff", "#9aa4af", 10) +
    '<rect x="240" y="72" width="112" height="22" rx="6" fill="#e9f7f1" stroke="#2c8c65"/>' +
    '<text x="296" y="88" font-size="11.5" fill="#2c8c65" text-anchor="middle" font-family="ui-monospace,Consolas,monospace">div</text>' +
    '<rect x="240" y="106" width="50" height="22" rx="6" fill="#f7f8fa" stroke="#c9ced6"/>' +
    '<text x="265" y="122" font-size="11.5" fill="#8b949e" text-anchor="middle">h1</text>' +
    '<rect x="302" y="106" width="50" height="22" rx="6" fill="#eaf4fc" stroke="#0e7cc2"/>' +
    '<text x="327" y="122" font-size="11.5" fill="#0e7cc2" text-anchor="middle" font-family="ui-monospace,Consolas,monospace">p</text>' +
    sLabel(492, 46, "新 vnode 📸", "#59636e", 12.5) +
    sBox(412, 56, 160, 132, "#fff", "#9aa4af", 10) +
    '<rect x="436" y="72" width="112" height="22" rx="6" fill="#e9f7f1" stroke="#2c8c65"/>' +
    '<text x="492" y="88" font-size="11.5" fill="#2c8c65" text-anchor="middle" font-family="ui-monospace,Consolas,monospace">div</text>' +
    '<rect x="436" y="106" width="50" height="22" rx="6" fill="#f7f8fa" stroke="#c9ced6"/>' +
    '<text x="461" y="122" font-size="11.5" fill="#8b949e" text-anchor="middle">h1</text>' +
    '<rect x="498" y="106" width="50" height="22" rx="6" fill="#fdf6e3" stroke="#b0851f"/>' +
    '<text x="523" y="122" font-size="11.5" fill="#8a6a12" text-anchor="middle" font-family="ui-monospace,Consolas,monospace">p·1</text>' +
    sEmo(394, 130, "🔍", 22) +
    sChip(300, 214, 200, "只有 p 变了 → 只 patch 它", "#e9f7f1", "#1f6f4e", 12) +
    sLabel(400, 282, "声明式 + 最小化更新：对比两张快照", "#59636e", 12.5)
  ),

  /* 第 17 章：先造后插 */
  "mount-moving": sWrap(
    sDotGrid(250, 40, 14, 4, 26, "#9aa4af") +
    _mascotInner("work", 34, 118, 0.88) +
    sChip(196, 66, 148, "① createElement", "#e9f7f1", "#2c8c65", 12) +
    sChip(214, 112, 148, "② patchProp + 挂子", "#eaf4fc", "#0e7cc2", 12) +
    sChip(232, 158, 148, "③ 一次 insert 📥", "#fdf6e3", "#8a6a12", 12) +
    sArrow(390, 120, 424, 128, "#8b949e") +
    '<polygon points="430,88 505,40 580,88" fill="#f3e2b3" stroke="#b0851f"/>' +
    sBox(438, 88, 134, 110, "#fdf6e3", "#b0851f", 8) +
    sBox(484, 138, 42, 60, "#fff", "#b0851f", 5) +
    '<line x1="420" y1="200" x2="592" y2="200" stroke="#c8a56b" stroke-width="5" stroke-linecap="round"/>' +
    sLabel(505, 228, "文档里一次到位", "#8a6a12", 12) +
    sLabel(300, 282, "先造后插、先子后父 —— 回流少一个量级", "#59636e", 12.5)
  ),

  /* 第 19 章：render 包进 effect */
  "component-gearbox": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("work", 34, 118, 0.86) +
    sBox(206, 96, 84, 64, "#fff", "#2c8c65", 10) +
    '<text x="248" y="124" font-size="12.5" font-weight="700" fill="#2c8c65" text-anchor="middle" font-family="ui-monospace,Consolas,monospace">render()</text>' +
    '<text x="248" y="146" font-size="10.5" fill="#8b949e" text-anchor="middle">组件的模板</text>' +
    sArrow(294, 128, 330, 128, "#3ba776") +
    sBox(336, 74, 180, 130, "#f4f5f7", "#9aa4af", 14) +
    sEmo(426, 122, "⚙️", 34) +
    sChip(352, 158, 148, "scheduler → queueJob", "#fff", "#59636e", 11) +
    sLabel(426, 66, "渲染 effect", "#59636e", 12.5) +
    sArrow(520, 128, 556, 128, "#be3455") +
    sBox(560, 92, 48, 72, "#eaf4fc", "#0e7cc2", 10) +
    sLabel(584, 132, "DOM", "#0e7cc2", 11.5) +
    sLabel(400, 246, "数据一变 → 标脏 → job 入队 → 整个组件重渲", "#59636e", 12.5) +
    sEmo(560, 220, "🔁", 22)
  ),

  /* 第 22 章：组件桌面四件套 */
  "compdata-desk": sWrap(
    sDotGrid(30, 40, 8, 3, 24, "#9aa4af") +
    _mascotInner("point", 30, 44, 0.75) +
    '<line x1="160" y1="196" x2="590" y2="196" stroke="#c8a56b" stroke-width="6" stroke-linecap="round"/>' +
    sBox(186, 112, 88, 80, "#fff", "#2c8c65", 10) + sLabel(230, 158, "props", "#2c8c65", 14) + sLabel(230, 224, "声明过的合同", "#59636e", 11.5) +
    sBox(288, 112, 88, 80, "#f7f8fa", "#9aa4af", 10) + sLabel(332, 158, "attrs", "#59636e", 14) + sLabel(332, 224, "边角料", "#59636e", 11.5) +
    sBox(390, 112, 88, 80, "#fdf6e3", "#b0851f", 10) + sLabel(434, 158, "emit", "#8a6a12", 14) + sLabel(434, 224, "收据 onXxx", "#59636e", 11.5) +
    sBox(492, 112, 88, 80, "#eaf4fc", "#0e7cc2", 10) + sLabel(536, 158, "slots", "#0e7cc2", 14) + sLabel(536, 224, "预制函数袋", "#59636e", 11.5) +
    sLabel(390, 282, "initProps 分家：声明过的进 props，没声明的进 attrs", "#59636e", 12.5)
  ),

  /* 第 24 章：原型链找爷爷 */
  "pin-familytree": sWrap(
    sDotGrid(30, 40, 8, 3, 24, "#9aa4af") +
    _mascotInner("think", 34, 130, 0.8) +
    sBox(300, 44, 190, 42, "#fdf6e3", "#b0851f", 10) +
    sLabel(395, 70, "爷爷 provide('家传宝')", "#8a6a12", 12.5) +
    sBox(180, 138, 130, 40, "#eaf4fc", "#0e7cc2", 10) + sLabel(245, 163, "爸爸", "#0e7cc2", 12.5) +
    sBox(480, 138, 110, 40, "#eaf4fc", "#0e7cc2", 10) + sLabel(535, 163, "叔叔", "#0e7cc2", 12.5) +
    '<line x1="245" y1="138" x2="360" y2="86" stroke="#c9ced6" stroke-width="2"/>' +
    '<line x1="535" y1="138" x2="430" y2="86" stroke="#c9ced6" stroke-width="2"/>' +
    sBox(255, 224, 160, 42, "#e9f7f1", "#2c8c65", 10) +
    sLabel(335, 250, "我 inject('家传宝') ✓", "#2c8c65", 12.5) +
    '<line x1="335" y1="224" x2="290" y2="178" stroke="#c9ced6" stroke-width="2"/>' +
    sArrow(330, 220, 378, 92, "#be3455", 2.2) +
    sChip(452, 232, 150, "原型链：Object.create ⬆️", "#fdeef2", "#be3455", 10.5) +
    sLabel(400, 288, "自己没有就沿着父链一路问上去", "#59636e", 12.5)
  ),

  /* 第 25 章：Fragment 双锚点 */
  "fragment-anchor": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("think", 34, 112, 0.88) +
    sEmo(150, 74, "👻", 22) +
    sBox(236, 76, 12, 144, "#9aa4af", "#9aa4af", 4) +
    sBox(462, 76, 12, 144, "#9aa4af", "#9aa4af", 4) +
    sEmo(242, 64, "⚓", 18) + sEmo(468, 64, "⚓", 18) +
    '<rect x="258" y="92" width="196" height="112" rx="10" fill="#eaf4fc" fill-opacity=".4" stroke="#0e7cc2" stroke-width="1.6" stroke-dasharray="6 4"/>' +
    sChip(311, 106, 90, "child 1", "#fff", "#14507e", 11.5) +
    sChip(311, 140, 90, "child 2", "#fff", "#14507e", 11.5) +
    sChip(311, 174, 90, "child 3", "#fff", "#14507e", 11.5) +
    sLabel(400, 60, "Fragment：隐形容器", "#14507e", 14) +
    sChip(300, 240, 110, "首锚点", "#f7f8fa", "#59636e", 11.5) +
    sChip(430, 240, 110, "尾锚点", "#f7f8fa", "#59636e", 11.5) +
    sLabel(400, 288, "不产生真实 DOM，却能让插拔精确定位", "#59636e", 12.5)
  ),

  /* 第 26 章：七个钩子衣架 */
  "directives-coatrack": sWrap(
    sDotGrid(250, 40, 14, 4, 26, "#9aa4af") +
    _mascotInner("work", 40, 112, 0.9) +
    '<line x1="400" y1="64" x2="400" y2="248" stroke="#b0851f" stroke-width="6" stroke-linecap="round"/>' +
    '<line x1="308" y1="70" x2="492" y2="70" stroke="#b0851f" stroke-width="6" stroke-linecap="round"/>' +
    '<ellipse cx="400" cy="252" rx="52" ry="8" fill="#c8a56b"/>' +
    sBox(318, 88, 56, 62, "#e9f7f1", "#2c8c65", 8) + sLabel(346, 118, "created", "#2c8c65", 9.5) +
    sBox(382, 88, 56, 62, "#eaf4fc", "#0e7cc2", 8) + sLabel(410, 118, "mounted", "#0e7cc2", 9.5) +
    sBox(446, 88, 56, 62, "#fdf6e3", "#b0851f", 8) + sLabel(474, 118, "updated", "#8a6a12", 9.5) +
    sBox(410, 168, 56, 62, "#fdeef2", "#be3455", 8) + sLabel(438, 198, "unmounted", "#be3455", 9) +
    sLabel(400, 56, "七个钩子（常用四件先挂上）", "#59636e", 12.5) +
    sChip(300, 250, 200, "patch 的 4 个时机顺路调用", "#e9f7f1", "#1f6f4e", 12) +
    sLabel(400, 284, "v-model 本质就是个指令", "#59636e", 12.5)
  ),

  /* 第 27 章：Transition 时刻表 */
  "transition-stopwatch": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("point", 34, 112, 0.9) +
    sEmo(150, 76, "🎬", 24) +
    '<rect x="236" y="44" width="300" height="26" rx="6" fill="#d66a7a"/>' +
    '<circle cx="252" cy="70" r="7" fill="#d66a7a"/><circle cx="286" cy="70" r="7" fill="#d66a7a"/><circle cx="320" cy="70" r="7" fill="#d66a7a"/><circle cx="354" cy="70" r="7" fill="#d66a7a"/><circle cx="388" cy="70" r="7" fill="#d66a7a"/><circle cx="422" cy="70" r="7" fill="#d66a7a"/><circle cx="456" cy="70" r="7" fill="#d66a7a"/><circle cx="490" cy="70" r="7" fill="#d66a7a"/><circle cx="524" cy="70" r="7" fill="#d66a7a"/>' +
    sChip(246, 110, 88, "enter-from", "#f7f8fa", "#59636e", 11.5) +
    sChip(364, 110, 96, "enter-active", "#eaf4fc", "#0e7cc2", 11.5) +
    sChip(490, 110, 84, "enter-to", "#e9f7f1", "#2c8c65", 11.5) +
    sArrow(336, 123, 360, 123, "#8b949e", 2) +
    sArrow(462, 123, 486, 123, "#8b949e", 2) +
    sChip(300, 168, 220, "animationend ⏱ → 摘 class", "#fff", "#be3455", 12) +
    sEmo(560, 180, "⏱", 24) +
    sLabel(400, 232, "进场：双 rAF 切换，加完再摘", "#59636e", 12) +
    sLabel(400, 282, "离场更难：旧节点留在原地演完再删", "#59636e", 12.5)
  ),

  /* 第 31 章：tokenizer 状态机 */
  "ast-machine": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("read", 34, 112, 0.9) +
    sChip(196, 60, 84, "&lt;div&gt;", "#f7f8fa", "#59636e", 12) +
    sChip(216, 96, 74, "{{ n }}", "#f7f8fa", "#59636e", 12) +
    sArrow(288, 92, 302, 104, "#8b949e", 2) +
    sArrow(294, 122, 302, 126, "#8b949e", 2) +
    sBox(306, 72, 168, 112, "#282c34", "#1e2229", 12) +
    sLabel(390, 100, "tokenizer 状态机", "#98c379", 13) +
    '<circle cx="344" cy="132" r="8" fill="#61afef"/>' +
    '<circle cx="378" cy="132" r="8" fill="#e5c07b"/>' +
    '<circle cx="412" cy="132" r="8" fill="#e06c75"/>' +
    '<line x1="352" y1="132" x2="368" y2="132" stroke="#555b66" stroke-width="2"/>' +
    '<line x1="386" y1="132" x2="402" y2="132" stroke="#555b66" stroke-width="2"/>' +
    sLabel(390, 166, "逐字符 · 边解析边纠错", "#7f848e", 11) +
    sArrow(478, 122, 508, 152, "#3ba776") +
    '<line x1="524" y1="212" x2="500" y2="248" stroke="#9aa4af" stroke-width="2"/>' +
    '<line x1="524" y1="212" x2="548" y2="248" stroke="#9aa4af" stroke-width="2"/>' +
    '<circle cx="524" cy="196" r="17" fill="#e9f7f1" stroke="#2c8c65"/>' +
    sLabel(524, 201, "div", "#2c8c65", 10.5) +
    '<circle cx="496" cy="258" r="14" fill="#eaf4fc" stroke="#0e7cc2"/>' +
    sLabel(496, 263, "p", "#0e7cc2", 10.5) +
    '<circle cx="552" cy="258" r="14" fill="#fdf6e3" stroke="#b0851f"/>' +
    sLabel(552, 263, "n", "#8a6a12", 10.5) +
    sLabel(370, 268, "输出：AST 树", "#59636e", 12) +
    sLabel(300, 292, "为什么不用正则一把梭？状态机能恢复错误继续编", "#59636e", 12)
  ),

  /* 第 32 章：洋葱模型 */
  "transform-onion": sWrap(
    sDotGrid(250, 200, 14, 3, 26, "#9aa4af") +
    _mascotInner("think", 34, 130, 0.82) +
    '<circle cx="400" cy="140" r="92" fill="none" stroke="#c8a56b" stroke-width="3"/>' +
    '<circle cx="400" cy="140" r="62" fill="none" stroke="#b0851f" stroke-width="3"/>' +
    '<circle cx="400" cy="140" r="34" fill="#fdf6e3" stroke="#8a6a12" stroke-width="2"/>' +
    sLabel(400, 145, "vnode", "#8a6a12", 12.5) +
    sArrow(236, 140, 300, 140, "#3ba776") +
    sLabel(268, 126, "enter", "#2c8c65", 12) +
    sArrow(500, 140, 564, 140, "#be3455") +
    sLabel(532, 126, "exit", "#be3455", 12) +
    sChip(330, 250, 140, "插件① 外层", "#f7f8fa", "#59636e", 11) +
    sChip(430, 250, 140, "插件② 内层", "#f7f8fa", "#59636e", 11) +
    sLabel(400, 288, "exit 从里往外跑：v-if 在出口看到完整分支，完成变身", "#59636e", 12.5)
  ),

  /* 第 33 章：两台打印机 */
  "codegen-two-printers": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("point", 26, 166, 0.7) +
    '<circle cx="218" cy="96" r="16" fill="#e9f7f1" stroke="#2c8c65" stroke-width="2"/>' +
    sLabel(218, 101, "div", "#2c8c65", 10.5) +
    '<circle cx="186" cy="146" r="13" fill="#f7f8fa" stroke="#9aa4af" stroke-width="2"/>' +
    sLabel(186, 151, "h1", "#59636e", 10) +
    '<circle cx="250" cy="146" r="13" fill="#eaf4fc" stroke="#0e7cc2" stroke-width="2"/>' +
    sLabel(250, 151, "p", "#0e7cc2", 10) +
    '<line x1="212" y1="111" x2="190" y2="134" stroke="#9aa4af" stroke-width="2"/>' +
    '<line x1="224" y1="111" x2="246" y2="134" stroke="#9aa4af" stroke-width="2"/>' +
    sLabel(216, 180, "同一棵 AST", "#59636e", 12) +
    sArrow(262, 96, 340, 88, "#8b949e", 2) +
    sArrow(268, 152, 340, 192, "#8b949e", 2) +
    sBox(346, 52, 200, 84, "#e9f7f1", "#2c8c65", 12) +
    sEmo(446, 92, "🖨️", 22) + sLabel(392, 88, "render()", "#2c8c65", 13) +
    sLabel(446, 122, "→ vnode 树 · 浏览器 diff", "#1f6f4e", 11) +
    sBox(346, 168, 200, 84, "#fdeef2", "#be3455", 12) +
    sEmo(446, 208, "🖨️", 22) + sLabel(404, 204, "ssrRender()", "#be3455", 13) +
    sLabel(446, 238, "→ HTML 字符串 · 首屏直出", "#8a4053", 11) +
    sLabel(400, 288, "codegen：一台 AST，两台打印机", "#59636e", 12.5)
  ),

  /* 第 35 章：错误传播手套 */
  "error-glove": sWrap(
    sDotGrid(250, 40, 14, 8, 26, "#9aa4af") +
    _mascotInner("watch", 36, 140, 0.85) +
    sChip(268, 56, 150, "孙组件 💥 throw", "#fdeef2", "#be3455", 12) +
    sChip(268, 128, 150, "父组件", "#f7f8fa", "#59636e", 12) +
    sChip(268, 200, 150, "根组件", "#f7f8fa", "#59636e", 12) +
    sArrow(343, 124, 343, 92, "#be3455", 2.2) +
    sArrow(343, 196, 343, 164, "#be3455", 2.2) +
    sLabel(466, 140, "onErrorCaptured？", "#8b949e", 11) +
    sLabel(466, 212, "onErrorCaptured？", "#8b949e", 11) +
    '<path d="M352 66 Q420 30 496 54" fill="none" stroke="#be3455" stroke-width="2" stroke-dasharray="5 4"/>' +
    sEmo(516, 62, "🧤", 26) +
    sChip(470, 88, 128, "errorHandler 兜底", "#e9f7f1", "#2c8c65", 11) +
    sLabel(420, 282, "包装一切 → 沿父链上溯：返回 false 才停", "#59636e", 12.5)
  ),

  /* 第 36 章：hydration 接电线 */
  "ssr-wires": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("work", 40, 118, 0.88) +
    sEmo(152, 82, "🔌", 20) +
    '<path d="M240 150 Q320 200 428 150" fill="none" stroke="#0e7cc2" stroke-width="2.5" stroke-dasharray="6 4"/>' +
    '<polygon points="420,64 505,20 590,64" fill="none" stroke="#0e7cc2" stroke-width="2" stroke-dasharray="6 4"/>' +
    '<rect x="432" y="64" width="146" height="120" fill="none" stroke="#0e7cc2" stroke-width="2" stroke-dasharray="6 4"/>' +
    sLabel(505, 128, "半成品房子", "#0e7cc2", 12.5) +
    sEmo(505, 168, "🏠", 26) +
    sChip(52, 62, 178, "服务器：字符串直出", "#eaf4fc", "#0e7cc2", 12) +
    sChip(368, 236, 180, "客户端：只接电线不重建", "#e9f7f1", "#2c8c65", 11.5) +
    sLabel(505, 282, "hydration：激活 DOM、绑定事件与响应式", "#59636e", 12.5)
  ),

  /* 第 37 章：canvas 画笔 */
  "custom-canvas": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("work", 40, 112, 0.9) +
    sEmo(154, 78, "🖌️", 20) +
    sBox(300, 52, 240, 180, "#fff", "#b0851f", 8) +
    '<circle cx="492" cy="98" r="17" fill="#f7c873"/>' +
    '<polygon points="312,214 380,120 448,214" fill="#cfe3d8" stroke="#8fb8a3"/>' +
    '<polygon points="400,214 462,142 524,214" fill="#a9dfc5" stroke="#6aa88b"/>' +
    sChip(320, 246, 120, "画布版 nodeOps", "#e9f7f1", "#2c8c65", 11.5) +
    sChip(452, 246, 120, "命中检测自己做", "#fdf6e3", "#8a6a12", 11.5) +
    sLabel(420, 286, "换一套增删改查接口，Vue 就能画在 canvas 上", "#59636e", 12.5)
  ),

  /* 第 38 章：HMR 进站换胎 */
  "hmr-pitstop": sWrap(
    sDotGrid(250, 40, 14, 8, 26, "#9aa4af") +
    _mascotInner("work", 170, 128, 0.72) +
    sEmo(380, 168, "🏎️", 46) +
    '<line x1="322" y1="152" x2="352" y2="152" stroke="#b9c0c9" stroke-width="3" stroke-linecap="round"/>' +
    '<line x1="316" y1="168" x2="348" y2="168" stroke="#b9c0c9" stroke-width="3" stroke-linecap="round"/>' +
    '<line x1="322" y1="184" x2="352" y2="184" stroke="#b9c0c9" stroke-width="3" stroke-linecap="round"/>' +
    sChip(452, 88, 146, "rerender：换 render", "#e9f7f1", "#2c8c65", 11.5) +
    sChip(452, 138, 146, "实例还在 ✅", "#eaf4fc", "#0e7cc2", 11.5) +
    sChip(452, 188, 146, "状态全保留 ✅", "#fdf6e3", "#8a6a12", 11.5) +
    sArrow(444, 150, 414, 154, "#8b949e", 2) +
    sLabel(400, 274, "F1 进站换胎：不熄火、不倒车 —— 模板热替换的秘密", "#59636e", 12.5) +
    sEmo(60, 70, "🔥", 22)
  ),

  /* 第 40 章：路口指示牌 */
  "router-signpost": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("point", 34, 112, 0.9) +
    '<line x1="392" y1="58" x2="392" y2="252" stroke="#b0851f" stroke-width="7" stroke-linecap="round"/>' +
    '<g><rect x="398" y="72" width="96" height="26" rx="6" fill="#eaf4fc" stroke="#0e7cc2"/><polygon points="494,72 514,85 494,98" fill="#eaf4fc" stroke="#0e7cc2"/><text x="446" y="90" font-size="12" font-weight="700" fill="#0e7cc2" text-anchor="middle" font-family="ui-monospace,Consolas,monospace">/home</text></g>' +
    '<g><rect x="398" y="128" width="96" height="26" rx="6" fill="#e9f7f1" stroke="#2c8c65"/><polygon points="494,128 514,141 494,154" fill="#e9f7f1" stroke="#2c8c65"/><text x="446" y="146" font-size="12" font-weight="700" fill="#2c8c65" text-anchor="middle" font-family="ui-monospace,Consolas,monospace">/about</text></g>' +
    '<g><rect x="398" y="184" width="96" height="26" rx="6" fill="#fdf6e3" stroke="#b0851f"/><polygon points="494,184 514,197 494,210" fill="#fdf6e3" stroke="#b0851f"/><text x="446" y="202" font-size="12" font-weight="700" fill="#8a6a12" text-anchor="middle" font-family="ui-monospace,Consolas,monospace">/user/:id</text></g>' +
    sChip(398, 232, 150, "currentRoute = reactive", "#fdeef2", "#be3455", 11) +
    sLabel(430, 284, "一个响应式的 currentRoute，驱动整场导航", "#59636e", 12.5)
  ),

  /* 第 41 章：Pinia 金库 */
  "pinia-vault": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("point", 34, 112, 0.9) +
    '<circle cx="430" cy="140" r="64" fill="#f4f5f7" stroke="#9aa4af" stroke-width="5"/>' +
    '<circle cx="430" cy="140" r="20" fill="#fff" stroke="#9aa4af" stroke-width="3"/>' +
    '<line x1="430" y1="76" x2="430" y2="120" stroke="#9aa4af" stroke-width="3"/>' +
    '<line x1="430" y1="160" x2="430" y2="204" stroke="#9aa4af" stroke-width="3"/>' +
    '<line x1="366" y1="140" x2="410" y2="140" stroke="#9aa4af" stroke-width="3"/>' +
    '<line x1="450" y1="140" x2="494" y2="140" stroke="#9aa4af" stroke-width="3"/>' +
    sLabel(430, 146, "_s", "#59636e", 12) +
    sChip(196, 60, 176, "defineStore → 惰性钥匙 🔑", "#fdf6e3", "#8a6a12", 12) +
    sArrow(368, 84, 384, 96, "#8b949e", 2) +
    sChip(348, 236, 168, "首次 useStore() 才建仓", "#e9f7f1", "#2c8c65", 11.5) +
    sLabel(430, 284, "单例仓库：install 挂册，useStore 开门", "#59636e", 12.5)
  ),

  /* 第 44 章：施工蓝图 */
  "build-blueprint": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("work", 36, 112, 0.9) +
    sEmo(150, 74, "🦺", 22) +
    sBox(290, 46, 250, 176, "#1d3a5f", "#152c49", 12) +
    '<g stroke="#7ea4cc" stroke-width="1" opacity=".35"><line x1="290" y1="90" x2="540" y2="90"/><line x1="290" y1="134" x2="540" y2="134"/><line x1="290" y1="178" x2="540" y2="178"/><line x1="352" y1="46" x2="352" y2="222"/><line x1="415" y1="46" x2="415" y2="222"/><line x1="478" y1="46" x2="478" y2="222"/></g>' +
    '<g fill="none" stroke="#cfe3f5" stroke-width="2"><rect x="380" y="70" width="60" height="26" rx="5"/><rect x="330" y="130" width="60" height="26" rx="5"/><rect x="430" y="130" width="60" height="26" rx="5"/><line x1="410" y1="96" x2="360" y2="130"/><line x1="410" y1="96" x2="460" y2="130"/></g>' +
    sLabel(415, 208, "施工图：patch → mount → diff", "#9fc3e8", 12) +
    sChip(300, 240, 112, "原料全部现成", "#e9f7f1", "#2c8c65", 11.5) +
    sChip(426, 240, 118, "验收：计数器亮灯", "#fdf6e3", "#8a6a12", 11.5) +
    sLabel(420, 284, "施工① 开工：按依赖顺序抄，跑通第一个计数器", "#59636e", 12.5)
  ),

  /* 第 48 章：全家福测试全绿 */
  "build-allgreen": sWrap(
    sDotGrid(250, 40, 14, 8, 26, "#9aa4af") +
    _mascotInner("celebrate", 40, 108, 0.92) +
    sBox(300, 48, 210, 196, "#fff", "#c8e8d9", 12) +
    '<rect x="300" y="48" width="210" height="36" rx="12" fill="#e9f7f1"/>' +
    '<rect x="300" y="70" width="210" height="14" fill="#e9f7f1"/>' +
    sLabel(405, 72, "全家福测试", "#1f6f4e", 13.5) +
    '<text x="316" y="110" font-size="12.5" fill="#3a424b">✅ reactive / ref / computed</text>' +
    '<text x="316" y="138" font-size="12.5" fill="#3a424b">✅ watch / effectScope</text>' +
    '<text x="316" y="166" font-size="12.5" fill="#3a424b">✅ 渲染器 / diff / 组件树</text>' +
    '<text x="316" y="194" font-size="12.5" fill="#3a424b">✅ 指令 / Transition</text>' +
    '<text x="316" y="222" font-size="12.5" fill="#3a424b">✅ 集合拦截器</text>' +
    sEmo(546, 84, "🏁", 26) +
    sLabel(470, 282, "全绿 🎓 你的 mini-vue3 与官方同构", "#59636e", 12.5)
  ),

  /* 第 49 章：性能助推器 */
  "perf-boost": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("celebrate", 36, 110, 0.9) +
    sEmo(420, 108, "🚀", 46) +
    '<line x1="360" y1="96" x2="386" y2="96" stroke="#b9c0c9" stroke-width="3" stroke-linecap="round"/>' +
    '<line x1="348" y1="116" x2="382" y2="116" stroke="#b9c0c9" stroke-width="3" stroke-linecap="round"/>' +
    sChip(330, 156, 84, "v-memo", "#e9f7f1", "#2c8c65", 12) +
    sChip(426, 156, 104, "shallowRef", "#eaf4fc", "#0e7cc2", 12) +
    sChip(300, 206, 104, "KeepAlive", "#fdf6e3", "#8a6a12", 12) +
    sChip(416, 206, 76, "v-once", "#fdeef2", "#be3455", 12) +
    sLabel(420, 256, "运行时省电三招：shallow / markRaw / v-show", "#59636e", 11.5) +
    sLabel(400, 286, "性能八招 = 识别不变量，跳过它", "#59636e", 12.5)
  ),

  /* 第 50 章：面试白板 */
  "interview-whiteboard": sWrap(
    sDotGrid(250, 40, 14, 8, 26, "#9aa4af") +
    _mascotInner("point", 36, 112, 0.9) +
    sBox(300, 48, 240, 150, "#fff", "#9aa4af", 10) +
    '<text x="324" y="86" font-size="14.5" font-weight="800" fill="#2c8c65">① 先给结论</text>' +
    '<text x="324" y="120" font-size="14.5" font-weight="800" fill="#0e7cc2">② 再讲原理</text>' +
    '<text x="324" y="154" font-size="14.5" font-weight="800" fill="#be3455">③ 最后画图 ✏️</text>' +
    '<line x1="330" y1="212" x2="510" y2="212" stroke="#c8a56b" stroke-width="5" stroke-linecap="round"/>' +
    sEmo(516, 92, "🎤", 22) +
    sLabel(370, 246, "🟢 基础", "#2c8c65", 12) + sLabel(424, 246, "🟡 进阶", "#a16207", 12) + sLabel(478, 246, "🔴 高手", "#be3455", 12) + sLabel(532, 246, "🟣 拓展", "#7c6bd6", 12) +
    sLabel(420, 284, "24 道分级真题：答不上的那道，回去翻对应章节", "#59636e", 12.5)
  ),

  /* 第 51 章：登顶插旗 */
  "summit-flag": sWrap(
    sDotGrid(30, 40, 8, 8, 26, "#9aa4af") +
    _mascotInner("celebrate", 36, 110, 0.9) +
    '<polygon points="286,258 424,64 562,258" fill="#e3eaf1" stroke="#b9c0c9" stroke-width="2"/>' +
    '<polygon points="398,102 424,64 450,102" fill="#fff"/>' +
    '<line x1="424" y1="64" x2="424" y2="24" stroke="#8a6a12" stroke-width="3.5"/>' +
    '<polygon points="424,24 462,34 424,46" fill="#42d392"/>' +
    '<circle cx="322" cy="222" r="3.5" fill="#b9c0c9"/><circle cx="346" cy="192" r="3.5" fill="#b9c0c9"/><circle cx="368" cy="162" r="3.5" fill="#b9c0c9"/><circle cx="392" cy="132" r="3.5" fill="#b9c0c9"/>' +
    sChip(470, 70, 96, "51 / 51 ✅", "#e9f7f1", "#2c8c65", 12) +
    sLabel(424, 284, "山顶风景正好 —— 下一段路：把 mini-vue3 写完", "#59636e", 12.5)
  )
};

/* ============================================================
   四、章首横幅数据：id → { pose, emo, cap }
   ============================================================ */
var HERO = {
  overview:   { pose: "point",    emo: "🗺️📦🧭", cap: "出发前先拿地图：四个包的单向依赖，就是全书藏宝图" },
  effect:     { pose: "walkie",   emo: "📻👀",   cap: "给函数别上追踪器 —— 读取时登记，变化时重喊" },
  reactive:   { pose: "think",    emo: "🪟✨",   cap: "Proxy 是座玻璃房：管家只在你进门时才动手" },
  track:      { pose: "read",     emo: "📋✍️",   cap: "点名开始：谁读了我，就上名册" },
  trigger:    { pose: "speak",    emo: "📣⚡",   cap: "一呼百应：值变了，名册上的人全被喊起来" },
  cleanup:    { pose: "broom",    emo: "🧹🗑️",   cap: "分支切换会留下过期名单 —— 按快照对账清算" },
  ref:        { pose: "wave",     emo: "🎁🔢",   cap: "原始值装进礼物盒：从此外面只认 .value" },
  computed:   { pose: "think",    emo: "🥛🧊",   cap: "冰箱里的牛奶：不脏不新做，有人问才看一眼" },
  watch:      { pose: "watch",    emo: "🔭🔔",   cap: "优雅的观察者：变了叫我，怎么处理听我的" },
  nested:     { pose: "think",    emo: "🪆🧩",   cap: "套娃不出错靠暂存还原；团长一声解散全员退休" },
  apifamily:  { pose: "point",    emo: "🧰🛠️",   cap: "全家桶是一台函数工厂：多深、多大、要不要手动挡" },
  practice:   { pose: "work",     emo: "🚑🔍",   cap: "九成「页面不动」都是丢了连接 —— 五步诊断法走起" },
  collections:{ pose: "think",    emo: "🍱🔀",   cap: "Set/Map 拦不了属性就拦方法 —— 埋进方法体里" },
  linkedlist: { pose: "point",    emo: "🔗🪢",   cap: "Dep 与 Link 手拉手：每次相遇都记成一节双向链" },
  renderer:   { pose: "work",     emo: "📦🔌",   cap: "换掉接口盒，Vue 跑在画布上 —— 分层的艺术" },
  hvnode:     { pose: "think",    emo: "🧱📸",   cap: "VNode 是渲染结果的快照：对比两张照片，只改不同处" },
  mount:      { pose: "work",     emo: "🏗️📥",   cap: "先造后插、先子后父 —— 搬家也有最佳路线" },
  diff:       { pose: "point",    emo: "🚚📋",   cap: "快递分拣：该 patch 的 patch，该动的才动" },
  component:  { pose: "wave",     emo: "⚙️🔌",   cap: "render 包进 effect：数据一变，组件自己排队重跑" },
  blocktree:  { pose: "point",    emo: "🎯📜",   cap: "动态节点拉平成点名册，静态的一个都不看" },
  startflow:  { pose: "celebrate",emo: "🚀⏱️",   cap: "createApp → mount：三次翻译，一飞冲天" },
  compdata:   { pose: "point",    emo: "📇📨",   cap: "props 是合同、attrs 是边角料、emit 是收据" },
  scheduler:  { pose: "work",     emo: "🎫⏳",   cap: "同一帧只更新一次：取号、去重、一趟 flush" },
  pin:        { pose: "think",    emo: "🌳🎁",   cap: "provide/inject 顺着链找爷爷；内置组件各守一个路口" },
  fragment:   { pose: "think",    emo: "👻⚓",   cap: "Fragment 是隐形容器：看不见，但锚点记得它" },
  directives: { pose: "work",     emo: "🪝🧲",   cap: "七个钩子借 patch 的四个时机顺路上岗" },
  transition: { pose: "wave",     emo: "🎬✨",   cap: "六个 class 的时刻表：进场加完再摘，离场掐表再删" },
  keepalive:  { pose: "work",     emo: "📦🏬",   cap: "DOM 搬进隐藏仓库：从未销毁，所以状态全在" },
  suspense:   { pose: "think",    emo: "⏳🎭",   cap: "deps 数到 0 才换幕 —— 沙漏见底，好戏开场" },
  compiler:   { pose: "point",    emo: "🏭📝",   cap: "编译期多干点，运行时少干点 —— 三大优化全是这句话" },
  ast:        { pose: "read",     emo: "🌳🔤",   cap: "逐字符吞模板的状态机，边解析边埋线" },
  transform:  { pose: "think",    emo: "🧅🔁",   cap: "洋葱模型：enter 进去，exit 出来，v-if 中途变身" },
  codegen:    { pose: "work",     emo: "🖨️📜",   cap: "同一棵 AST 两台打印机：render 与 ssrRender" },
  syntax:     { pose: "wave",     emo: "🍬🧾",   cap: "每颗糖都对应一小段生成的代码 —— 甜要甜得明白" },
  error:      { pose: "watch",    emo: "🧤⚾",   cap: "所有用户代码都进手套：接不住就沿父链往上扔" },
  ssr:        { pose: "point",    emo: "🖥️💧",   cap: "服务器直出字符串，客户端只接电线不重建房子" },
  custom:     { pose: "work",     emo: "🎨🖌️",   cap: "换一套增删改查接口，Vue 就能画在 canvas 上" },
  hmr:        { pose: "celebrate",emo: "🔥⚡",   cap: "模板变了换引擎不熄火：render 一换，组件原地复活" },
  devtools:   { pose: "watch",    emo: "🩺📻",   cap: "一条全局广播频道，组件树随叫随到" },
  router:     { pose: "point",    emo: "🚏🗺️",   cap: "一个 reactive 的 currentRoute，驱动整场导航" },
  pinia:      { pose: "point",    emo: "🏦📦",   cap: "defineStore 发的是惰性钥匙：第一次开，仓库才动工" },
  vueuse:     { pose: "work",     emo: "🧰🇨🇭",   cap: "三件套范式：onScopeDispose 清理、ref 马甲、纯函数" },
  testing:    { pose: "watch",    emo: "🔬✅",   cap: "测试是行为的说明书：先看断言，再读实现" },
  build1:     { pose: "work",     emo: "🦺🔨",   cap: "施工①：patch 落地，第一个计数器亮起来" },
  build2:     { pose: "work",     emo: "🧱⚓",   cap: "施工②：双锚点立起来，多根模板从此可用" },
  build3:     { pose: "work",     emo: "🪝🎬",   cap: "施工③：七个钩子上岗，进出场有了灵魂" },
  build4:     { pose: "work",     emo: "🎫👑",   cap: "施工④：调度器与三大件 —— 组件树真正跑起来" },
  build5:     { pose: "celebrate",emo: "🧩🏁",   cap: "施工⑤：全家福测试全绿，你的 mini-vue3 与官方同构" },
  perf:       { pose: "celebrate",emo: "⚡🏁",   cap: "识别不变量，跳过它 —— 八招全是这一句话" },
  interview:  { pose: "point",    emo: "🎤💼",   cap: "先结论、再原理、最后画图 —— 四档题库逐级通关" },
  roadmap:    { pose: "celebrate",emo: "🏆🎉",   cap: "从一个 isObject 到最长递增子序列 —— 山顶风景正好" }
};

/* 各篇目横幅配色 */
var ACCENT = {
  "index.html": "", "reactivity.html": "", "advanced.html": "a-blue",
  "deep.html": "a-purple", "renderer.html": "a-amber", "core.html": "a-rose",
  "runtime.html": "a-blue", "builtins.html": "a-purple", "compiler.html": "a-amber",
  "frontier.html": "a-rose", "ecosystem.html": "a-blue", "build.html": "",
  "masters.html": "a-amber", "roadmap.html": "a-purple"
};

/* ============================================================
   五、注入逻辑
   ============================================================ */
function chapterIdOf(sec) {
  return (sec.id || "").replace(/^page-/, "");
}

function injectHeroes() {
  document.querySelectorAll(".page").forEach(function (sec) {
    var id = chapterIdOf(sec);
    if (id === "home") return;
    var meta = HERO[id];
    if (!meta || sec.querySelector(".ch-hero")) return;
    var ch = BY_ID[id];
    if (!ch) return;

    var group = "";
    for (var i = 0; i < GROUPS.length; i++) {
      if (GROUPS[i].items.some(function (it) { return it.id === id; })) { group = GROUPS[i].title; break; }
    }
    var probe = sec.cloneNode(true);
    probe.querySelectorAll("pre.code, .demo, .ch-hero, .summary-card").forEach(function (n) { n.remove(); });
    var prose = probe.textContent.length;
    var codeBlocks = sec.querySelectorAll("pre.code").length;
    var mins = Math.max(5, Math.min(45, Math.round(prose / 360 + codeBlocks * 0.9)));
    var labs = sec.querySelectorAll(".demo").length;

    var div = document.createElement("div");
    div.className = "ch-hero " + (ACCENT[ch.file] || "");
    div.innerHTML =
      '<div class="ch-art">' + mascot(meta.pose) + '</div>' +
      '<div class="ch-txt">' +
        '<span class="ch-no">第 ' + ch.idx + ' 章 · ' + group + '</span>' +
        '<div class="ch-title">' + meta.emo + ' ' + meta.cap + '</div>' +
        '<div class="ch-meta"><span>⏱ 预计 <b>' + mins + '</b> 分钟</span>' +
          (labs ? '<span>🧪 <b>' + labs + '</b> 个实验室，记得动手</span>' : '') +
          '<span>🎯 文末有自测 + 小结</span></div>' +
      '</div>';
    sec.insertBefore(div, sec.firstChild);
  });
}

function injectHomeMascot() {
  var hero = document.querySelector("#page-home .hero");
  if (!hero || hero.querySelector(".home-mascot")) return;
  var d = document.createElement("div");
  d.className = "home-mascot";
  d.innerHTML = mascot("wave");
  hero.insertBefore(d, hero.firstChild);
}

function injectSummaries() {
  document.querySelectorAll(".page").forEach(function (sec) {
    var id = chapterIdOf(sec);
    var s = SUMMARIES[id];
    if (!s || sec.querySelector(".summary-card")) return;
    var btn = sec.querySelector(".read-btn");
    if (!btn) return;
    var card = document.createElement("div");
    card.className = "summary-card";
    card.innerHTML =
      '<div class="sum-head"><span class="sum-ico">📮</span>本章小结</div>' +
      '<div class="sum-body">' +
        '<p class="sum-take">' + s.take + '</p>' +
        '<ul>' + s.pts.map(function (p) { return '<li>' + p + '</li>'; }).join("") + '</ul>' +
      '</div>';
    btn.parentNode.insertBefore(card, btn);
  });
}

function injectDataArt() {
  document.querySelectorAll("[data-art]").forEach(function (holder) {
    var svg = SCENES[holder.getAttribute("data-art")];
    if (!svg || holder.querySelector("svg")) return;
    holder.insertAdjacentHTML("afterbegin", svg);
  });
}

/* ---------- 已读按钮撒花 + 全勤结业彩蛋 ---------- */
var SPARK_EMO = ["✨", "🎉", "⭐", "💚", "🎈", "🌟"];
function spawnSparks(btn) {
  for (var i = 0; i < 8; i++) {
    var s = document.createElement("span");
    s.className = "spark";
    s.textContent = SPARK_EMO[Math.floor(Math.random() * SPARK_EMO.length)];
    s.style.left = "50%";
    s.style.top = "30%";
    s.style.setProperty("--sx", (Math.random() * 130 - 65).toFixed(0) + "px");
    s.style.setProperty("--sr", (Math.random() * 720 - 360).toFixed(0) + "deg");
    s.style.animationDelay = (Math.random() * 0.12).toFixed(2) + "s";
    btn.appendChild(s);
    (function (el) { setTimeout(function () { el.remove(); }, 1100); })(s);
  }
}
function readCount() {
  try { return JSON.parse(localStorage.getItem("minvue3-read") || "[]").length; }
  catch (e) { return 0; }
}
function setupSparks() {
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".read-btn");
    if (!btn) return;
    spawnSparks(btn);
    if (readCount() >= ALL.length - 1) {
      setTimeout(function () {
        if (!localStorage.getItem("minvue3-party") && !document.querySelector("#party.on")) showParty();
      }, 450);
    }
  });
}
function confetti(n) {
  var emos = ["🎉", "✨", "🎊", "💚", "⭐", "🟩", "🟦", "🎈"];
  for (var i = 0; i < n; i++) {
    var c = document.createElement("span");
    c.className = "confetti";
    c.textContent = emos[Math.floor(Math.random() * emos.length)];
    c.style.left = Math.random() * 100 + "vw";
    c.style.fontSize = (13 + Math.random() * 14) + "px";
    c.style.setProperty("--cd", (2.4 + Math.random() * 2.2).toFixed(2) + "s");
    c.style.setProperty("--cr", (Math.random() * 900).toFixed(0) + "deg");
    c.style.animationDelay = (Math.random() * 0.7).toFixed(2) + "s";
    document.body.appendChild(c);
    (function (el) { setTimeout(function () { el.remove(); }, 5200); })(c);
  }
}
function showParty() {
  if (document.getElementById("party")) { document.getElementById("party").classList.add("on"); return; }
  var ov = document.createElement("div");
  ov.id = "party";
  ov.className = "on";
  ov.innerHTML =
    '<div class="party-card">' +
      '<div class="p-mascot">' + mascot("celebrate") + '</div>' +
      '<h2>🎉 结业快乐！51 章全部点亮</h2>' +
      '<p>从一个 <code class="inline">isObject</code> 到最长递增子序列，你已经把 Vue3 的心脏完整走了一遍。<br>' +
      '现在打开编辑器，把实验室里的每一行亲手敲一遍 —— 然后去 <b>vuejs/core</b> 朝圣吧。</p>' +
      '<button class="party-btn">继续捣鼓源码 →</button>' +
    '</div>';
  document.body.appendChild(ov);
  confetti(46);
  ov.querySelector(".party-btn").addEventListener("click", function () {
    ov.classList.remove("on");
    try { localStorage.setItem("minvue3-party", "1"); } catch (e) {}
  });
}
function maybeParty() {
  if (readCount() < ALL.length - 1) return;
  var seen = false;
  try { seen = !!localStorage.getItem("minvue3-party"); } catch (e) {}
  if (!seen) showParty();
}

/* ---------- 总入口 ---------- */
function injectArt() {
  try { injectHomeMascot(); } catch (e) {}
  try { injectHeroes(); } catch (e) {}
  try { injectSummaries(); } catch (e) {}
  try { injectDataArt(); } catch (e) {}
  try { setupSparks(); } catch (e) {}
  try { maybeParty(); } catch (e) {}
}
injectArt();
