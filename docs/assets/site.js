/* ============================================================
   站点表现层：语法高亮 / 复制按钮 / 已读进度 / 阅读进度条
   ============================================================ */
"use strict";

function $(id) { return document.getElementById(id); }

/* ============================================================
   语法高亮 / 复制按钮
   ============================================================ */
var KW = "const|let|var|function|return|if|else|for|while|do|new|class|extends|constructor|this|typeof|instanceof|import|from|export|default|null|undefined|true|false|switch|case|break|continue|try|catch|finally|throw|delete|in|of|void|async|await|static|get|set|super|yield";
var TOKEN_RE = new RegExp(
  "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)" +          // 1 注释
  "|('(?:[^'\\\\\\n]|\\\\.)*'|\"(?:[^\"\\\\\\n]|\\\\.)*\"|`(?:[^`\\\\]|\\\\.)*`)" + // 2 字符串
  "|\\b(" + KW + ")\\b" +                              // 3 关键字
  "|(\\b\\d[\\d_]*(?:\\.\\d+)?\\b)" +                  // 4 数字
  "|([A-Za-z_$][\\w$]*)(?=\\s*\\()",                   // 5 函数名
  "g");

function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function highlight(code) {
  var out = "", last = 0, m;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(code))) {
    out += esc(code.slice(last, m.index));
    if (m[1]) out += '<span class="tk-cmt">' + esc(m[1]) + "</span>";
    else if (m[2]) out += '<span class="tk-str">' + esc(m[2]) + "</span>";
    else if (m[3]) out += '<span class="tk-kw">' + m[3] + "</span>";
    else if (m[4]) out += '<span class="tk-num">' + m[4] + "</span>";
    else if (m[5]) out += '<span class="tk-fn">' + esc(m[5]) + "</span>";
    last = m.index + m[0].length;
  }
  return out + esc(code.slice(last));
}

document.querySelectorAll("pre.code").forEach(function (pre) {
  var codeEl = pre.querySelector("code");
  if (!codeEl) return;
  var raw = codeEl.textContent;
  codeEl.innerHTML = highlight(raw);
  var head = document.createElement("div");
  head.className = "code-head";
  head.innerHTML = '<span class="code-title">' + esc(pre.getAttribute("data-title") || "js") + "</span>";
  var btn = document.createElement("button");
  btn.className = "copy-btn";
  btn.textContent = "复制";
  btn.addEventListener("click", function () {
    function done(ok) {
      btn.textContent = ok ? "已复制 ✓" : "复制失败";
      setTimeout(function () { btn.textContent = "复制"; }, 1500);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(raw).then(function () { done(true); }, function () { done(false); });
    } else {
      var ta = document.createElement("textarea");
      ta.value = raw; document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      done(ok);
    }
  });
  head.appendChild(btn);
  pre.insertBefore(head, pre.firstChild);
});


var READ_KEY = "minvue3-read";

function getRead() {
  try { return JSON.parse(localStorage.getItem(READ_KEY) || "[]"); }
  catch (e) { return []; }
}
function updateReadUI() {
  var read = getRead();
  var total = ALL.length - 1; // 除首页外的全部章节
  $("readPill").textContent = "📖 已读 " + read.length + " / " + total + " 章";
  document.querySelectorAll(".side-item").forEach(function (a) {
    var m = /#([a-z0-9]+)$/.exec(a.getAttribute("href") || "");
    var id = m ? m[1] : null;
    a.classList.toggle("read", read.indexOf(id) !== -1);
  });
  document.querySelectorAll(".read-btn").forEach(function (b) {
    var on = read.indexOf(b.getAttribute("data-page")) !== -1;
    b.classList.toggle("read", on);
    b.textContent = on ? "✓ 本章已读（点击取消）" : "✓ 标记本章已读";
  });
}

document.querySelectorAll(".read-btn").forEach(function (b) {
  b.addEventListener("click", function () {
    var id = b.getAttribute("data-page");
    var read = getRead();
    var i = read.indexOf(id);
    if (i === -1) read.push(id); else read.splice(i, 1);
    localStorage.setItem(READ_KEY, JSON.stringify(read));
    updateReadUI();
  });
});



/* ---------- 阅读进度条 ---------- */
window.addEventListener("scroll", function () {
  var h = document.documentElement;
  var max = h.scrollHeight - h.clientHeight;
  $("progress").style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
}, { passive: true });

updateReadUI();
