/* ============================================================
   章节数据 + 侧边栏 + 页内路由（站点拆分版的共享中枢）
   ============================================================ */
"use strict";

var PAGE_FILE = (location.pathname.split("/").pop() || "index.html");

var GROUPS = [
  {
    title: '开始',
    file: 'index.html',
    items: [
      {
        id: 'home',
        idx: '00',
        label: '首页 · 开启旅程'
      },
      {
        id: 'overview',
        idx: '01',
        label: '全景：先看懂整个项目'
      }
    ]
  },
  {
    title: '响应式篇 · reactivity',
    file: 'reactivity.html',
    items: [
      {
        id: 'effect',
        idx: '02',
        label: 'effect：万物的起点'
      },
      {
        id: 'reactive',
        idx: '03',
        label: 'reactive：Proxy 的魔法'
      },
      {
        id: 'track',
        idx: '04',
        label: 'track：画好「关注名单」'
      },
      {
        id: 'trigger',
        idx: '05',
        label: 'trigger：一呼百应'
      },
      {
        id: 'cleanup',
        idx: '06',
        label: '依赖清理：分支切换之谜'
      }
    ]
  },
  {
    title: '进阶篇 · 更多 API',
    file: 'advanced.html',
    items: [
      {
        id: 'ref',
        idx: '07',
        label: 'ref：给原始值一个家'
      },
      {
        id: 'computed',
        idx: '08',
        label: 'computed：聪明的偷懒'
      },
      {
        id: 'watch',
        idx: '09',
        label: 'watch：优雅的观察者'
      },
      {
        id: 'nested',
        idx: '10',
        label: 'effect 嵌套与 effectScope'
      },
      {
        id: 'apifamily',
        idx: '11',
        label: '响应式 API 全家桶'
      },
      {
        id: 'practice',
        idx: '12',
        label: '实战心法：避坑指南'
      }
    ]
  },
  {
    title: '响应式源码精读 · advanced',
    file: 'deep.html',
    items: [
      {
        id: 'collections',
        idx: '13',
        label: 'Set/Map 拦截器：另一套 Handler'
      },
      {
        id: 'linkedlist',
        idx: '14',
        label: '官方 3.5 版精读'
      }
    ]
  },
  {
    title: '渲染器篇 · runtime',
    file: 'renderer.html',
    items: [
      {
        id: 'renderer',
        idx: '15',
        label: '渲染器：分层的艺术'
      },
      {
        id: 'hvnode',
        idx: '16',
        label: 'h 与 VNode：虚拟的代价与回报'
      },
      {
        id: 'mount',
        idx: '17',
        label: 'mountElement：首挂载实战'
      },
      {
        id: 'diff',
        idx: '18',
        label: 'patch 与 diff：最长递增子序列'
      },
      {
        id: 'component',
        idx: '19',
        label: '组件化：响应式 × 渲染器合流'
      },
      {
        id: 'blocktree',
        idx: '20',
        label: 'Block Tree 的运行时消费'
      }
    ]
  },
  {
    title: '组件与调度篇 · core',
    file: 'core.html',
    items: [
      {
        id: 'startflow',
        idx: '21',
        label: '启动全流程：createApp → 像素'
      },
      {
        id: 'compdata',
        idx: '22',
        label: '组件实例：props / emit / slots'
      },
      {
        id: 'scheduler',
        idx: '23',
        label: '调度器：queueJob 与 nextTick'
      },
      {
        id: 'pin',
        idx: '24',
        label: 'provide/inject 与内置组件'
      }
    ]
  },
  {
    title: '运行时深水区 · runtime+',
    file: 'runtime.html',
    items: [
      {
        id: 'fragment',
        idx: '25',
        label: 'Text / Fragment / 静态节点'
      },
      {
        id: 'directives',
        idx: '26',
        label: '自定义指令：七个钩子'
      },
      {
        id: 'transition',
        idx: '27',
        label: 'Transition：进出场原理'
      }
    ]
  },
  {
    title: '内置组件深读 · builtins',
    file: 'builtins.html',
    items: [
      {
        id: 'keepalive',
        idx: '28',
        label: 'KeepAlive 深读：第三个容器'
      },
      {
        id: 'suspense',
        idx: '29',
        label: 'Suspense 深读：计数器状态机'
      }
    ]
  },
  {
    title: '编译器篇 · compiler',
    file: 'compiler.html',
    items: [
      {
        id: 'compiler',
        idx: '30',
        label: '编译器总览：模板到 render'
      },
      {
        id: 'ast',
        idx: '31',
        label: 'AST 与 tokenizer：模板成树'
      },
      {
        id: 'transform',
        idx: '32',
        label: 'transform：指令的变身术'
      },
      {
        id: 'codegen',
        idx: '33',
        label: 'codegen：render 印刷厂'
      },
      {
        id: 'syntax',
        idx: '34',
        label: 'v-model 与事件修饰符'
      }
    ]
  },
  {
    title: '边界与生态 · frontier',
    file: 'frontier.html',
    items: [
      {
        id: 'error',
        idx: '35',
        label: '错误处理：捕获与传播'
      },
      {
        id: 'ssr',
        idx: '36',
        label: 'SSR 与 hydration'
      },
      {
        id: 'custom',
        idx: '37',
        label: '自定义渲染器实战'
      }
    ]
  },
  {
    title: '生态与工程 · ecosystem',
    file: 'ecosystem.html',
    items: [
      {
        id: 'hmr',
        idx: '38',
        label: 'HMR：热更新原理'
      },
      {
        id: 'devtools',
        idx: '39',
        label: 'vue-devtools 协议'
      },
      {
        id: 'router',
        idx: '40',
        label: 'Vue Router 源码导览'
      },
      {
        id: 'pinia',
        idx: '41',
        label: 'Pinia 源码导览'
      },
      {
        id: 'vueuse',
        idx: '42',
        label: 'VueUse 精选实现'
      },
      {
        id: 'testing',
        idx: '43',
        label: '用测试读源码'
      }
    ]
  },
  {
    title: '把 mini-vue3 写完 · build',
    file: 'build.html',
    items: [
      {
        id: 'build1',
        idx: '44',
        label: '① 渲染器主体'
      },
      {
        id: 'build2',
        idx: '45',
        label: '② Text / Fragment'
      },
      {
        id: 'build3',
        idx: '46',
        label: '③ 指令与 Transition'
      },
      {
        id: 'build4',
        idx: '47',
        label: '④ 调度器与三大件'
      },
      {
        id: 'build5',
        idx: '48',
        label: '⑤ 集合拦截器与收官'
      }
    ]
  },
  {
    title: '高手篇 · 登堂入室',
    file: 'masters.html',
    items: [
      {
        id: 'perf',
        idx: '49',
        label: '性能优化：源码视角'
      },
      {
        id: 'interview',
        idx: '50',
        label: '面试通关：分级题库'
      }
    ]
  },
  {
    title: '收官',
    file: 'roadmap.html',
    items: [
      {
        id: 'roadmap',
        idx: '51',
        label: '结业：路线与彩蛋'
      }
    ]
  }
];

var ALL = [];
GROUPS.forEach(function (g) {
  g.items.forEach(function (it) { ALL.push({ id: it.id, idx: it.idx, label: it.label, file: g.file }); });
});
var BY_ID = {};
ALL.forEach(function (c) { BY_ID[c.id] = c; });
var HERE = ALL.filter(function (c) { return c.file === PAGE_FILE; }).map(function (c) { return c.id; });
if (!HERE.length) { PAGE_FILE = "index.html"; HERE = ["home", "overview"]; }

/* ---------- 侧边栏生成 ---------- */
(function buildSidebar() {
  var sb = document.getElementById("sidebar");
  if (!sb) return;
  sb.innerHTML = GROUPS.map(function (g) {
    var items = g.items.map(function (it) {
      var href = (g.file === PAGE_FILE ? "" : g.file) + "#" + it.id;
      return '<a class="side-item" href="' + href + '" data-chapter="' + it.id + '">' +
        '<span class="idx">' + it.idx + '</span>' + it.label + '<span class="done">✓</span></a>';
    }).join("\n    ");
    return '<div class="side-group"><div class="side-title">' + g.title + '</div>' + items + '</div>';
  }).join("\n");
})();

/* ---------- 移动端侧边栏 ---------- */
var sidebar = document.getElementById("sidebar"), mask = document.getElementById("mask");
function closeSidebar() { sidebar.classList.remove("open"); mask.classList.remove("on"); }
document.getElementById("menuBtn").addEventListener("click", function () {
  sidebar.classList.toggle("open"); mask.classList.toggle("on");
});
mask.addEventListener("click", closeSidebar);
sidebar.addEventListener("click", function (e) { if (e.target.closest("a")) closeSidebar(); });

/* ---------- 路由：本页 chapter 切换；跨页 chapter 跳转 ---------- */
function route() {
  var hash = (location.hash || "#" + HERE[0]).slice(1);
  if (BY_ID[hash] && BY_ID[hash].file !== PAGE_FILE) {
    location.replace(BY_ID[hash].file + "#" + hash);
    return;
  }
  if (HERE.indexOf(hash) === -1) hash = HERE[0];
  document.querySelectorAll(".page").forEach(function (p) {
    p.classList.toggle("on", p.id === "page-" + hash);
  });
  document.querySelectorAll(".side-item").forEach(function (a) {
    a.classList.toggle("on", a.getAttribute("data-chapter") === hash);
  });
  var navMap = { home: "home", overview: "overview", roadmap: "roadmap" };
  document.querySelectorAll("#topNav a").forEach(function (a) {
    a.classList.toggle("on", a.getAttribute("data-nav") === (navMap[hash] || "overview"));
  });
  window.scrollTo(0, 0);
  closeSidebar();
}
window.addEventListener("hashchange", route);
route();
