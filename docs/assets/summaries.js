/* ============================================================
   51 章本章小结数据：id → { take: 一句话带走, pts: 要点清单 }
   由 art.js 在每章 read-btn 前注入渲染。
   ============================================================ */
"use strict";

var SUMMARIES = {
  /* ---------- 01 全景 ---------- */
  overview: {
    take: "先拿地图再上路：四个包单向依赖，读源码永远从「谁调用谁」开始。",
    pts: [
      "monorepo 四包各管一摊：<b>shared → reactivity → runtime-core → runtime-dom</b>，依赖永远朝下，runtime-core 不认识 DOM 才能跨平台。",
      "再大的框架也从 <code class=\"inline\">isObject</code> 起步 —— 记得把 <code class=\"inline\">null</code> 踢出去（typeof null 的历史 bug）。",
      "读源码三把钥匙：<b>测试用例、类型定义、断点跟一帧</b>；第一遍只追主流程，错误处理全部跳过。",
      "动手仓库 553 行，reactivity 占八成 —— 先读完它，渲染器照着第 17~19 章抄进去就是完整项目。"
    ]
  },

  /* ---------- 响应式篇 02~06 ---------- */
  effect: {
    take: "effect = 会留下「我来过」痕迹的函数；activeSub 全局指针就是那枚追踪器。",
    pts: [
      "<b>副作用</b>：函数除返回值外还影响了外部世界（改标题、改 DOM）。Vue 的使命 = 读取时登记、变化时重喊。",
      "<code class=\"inline\">ReactiveEffect.run()</code> 五步心跳：清旧清理函数 → 标记旧依赖待观察 → <b>activeSub = this</b> → 执行 fn → finally 里还原指针并清理。",
      "还原指针必须放 <b>finally</b>：函数抛异常也不能让追踪器挂在身上 —— 健壮性都藏在这种细节里。",
      "<code class=\"inline\">effect(fn)</code> 立即执行一次（依赖收集的前提）、可注入 scheduler（computed/watch 的脾气开关）、返回 runner 可手动挡。",
      "3.5 用 <b>版本号记账</b>做脏检查：跑前记 trackId / depsLength，跑后对比 —— 过期依赖当场清算。"
    ]
  },
  reactive: {
    take: "Proxy 是lazy的玻璃房：你不进去，管家就不动； Reflect + receiver 是继承不翻车的保命符。",
    pts: [
      "createReactiveObject 五道关卡：已是代理直接回 / 只代理对象 / 只拦 get,set,deleteProperty / <b>懒代理</b>（嵌套对象读取时才包）/ 缓存复用。",
      "get 拦截器三分流：ReactiveFlags 暗号先行 → track 收集 → 深层值 <code class=\"inline\">reactive(res)</code> 后再返回。",
      "⚠️ 高频陷阱：继承场景下 <code class=\"inline\">Reflect.get(target, key, receiver)</code> 的 receiver 让 getter 里的 this 指向代理，否则<b>依赖收集丢失</b>。",
      "ReactiveFlags 是「暗号本」：<code class=\"inline\">__v_isReactive</code> 等 7 个特殊 key 让代理能被识别、能被逃脱（raw）。",
      "四个 handler 象限（深/浅 × 读/写）各司其职：readonly、shallow 各有专属拦截器。"
    ]
  },
  track: {
    take: "track 就是点名：谁在读我，就把谁记进这本「WeakMap → Map → Map」的三层名册。",
    pts: [
      "三层结构：<b>WeakMap(target) → Map(key) → Dep</b> —— target 用 WeakMap 防内存泄漏，key 用 Map 支持任意类型。",
      "官方 3.5 里「名册条目」是 <b>Dep 类</b>：登记通过 <code class=\"inline\">Dep.track()</code> 完成，effect 与 dep 双向记录（Link 双向链，第 14 章展开）。",
      "登记的前提是 <code class=\"inline\">activeSub</code> 非空 —— 没人在 effect 里读取，收集根本不会发生。",
      "双向登记便宜到可以全开：每次读取就是一两次 Map 查询 + 指针比较，没有遍历。"
    ]
  },
  trigger: {
    take: "trigger 就是广播：值变了，拿出名册挨个喊「该重跑了」—— 但喊之前先想清楚值到底变没变。",
    pts: [
      "完整链路：set 拦截 → Reflect.set 落库 → hasChanged 比较 → <code class=\"inline\">trigger(target, key)</code> → 从名册取出 Dep → 通知。",
      "<b>hasChanged</b> 用 <code class=\"inline\">Object.is</code>：连 NaN === NaN 都能正确判「没变」—— 那 +0/-0 的坑也一并堵上。",
      "递归防护：<code class=\"inline\">RUNNING</code> 旗标保证 effect 执行期间不会被自己再次触发（除非显式 allowRecurse）。",
      "scheduler 是埋好的种子：有 scheduler 就只调 scheduler 不重跑 —— computed 标脏、watch 回调、渲染排队全靠这一口子。",
      "官方 3.5 通知管线「先收集后执行」：先把待通知的 effect 收进 batch 队列再统一跑，避免遍历中途新增/删除的紊乱。"
    ]
  },
  cleanup: {
    take: "分支切换会留下「过期关注」：3.5 的答案是先记账（version 快照），跑完再对账清算。",
    pts: [
      "问题现场：<code class=\"inline\">if (state.ok) state.a else state.b</code> 切换后，effect 依然被 a 触发 —— a 是过期依赖。",
      "老方案（3.0~3.3）：每次重跑前<b>全删重建</b>所有依赖 —— 简单但每次都是 O(n) 清理。",
      "官方 3.5：run 前记 <b>trackId + depsLength 快照</b>，新依赖按序覆写旧槽位；跑完后「多出来的尾巴」就是过期依赖，摘除即可。",
      "这个「先挂起再清算」让分支切换从全量重建变成<b>增量清理</b> —— 思想与 React fiber 的双缓冲殊途同归。"
    ]
  },

  /* ---------- 进阶篇 07~12 ---------- */
  ref: {
    take: "ref 是给原始值造的「盒子」：Proxy 包不住 18，就把它装进对象里再包。",
    pts: [
      "Proxy 的盲区：原始值没有属性访问可供拦截 —— 所以 ref 用 <b>类 + getter/setter</b> 实现响应式。",
      "<code class=\"inline\">RefImpl.value</code> 的 getter 做 trackSelf、setter 做 hasChanged + triggerSelf；对象值先 <code class=\"inline\">toReactive</code> 包一层 —— 官方 setter 里这行就是防「替换对象后丢响应」的。",
      "<code class=\"inline\">toRef/toRefs</code> 是解构救星：把 <code class=\"inline\">props.x</code> 变成保持连接的 ref，而不是断线快照。",
      "<code class=\"inline\">proxyRefs</code> 让模板不用写 .value：读时自动拆盒、写时自动装盒（setup 返回值也被它处理）。",
      "isRef / unref 是判别与拆盒的通用工具 —— 写组合式函数时让 API 对 ref 和原始值都友好。"
    ]
  },
  computed: {
    take: "computed = 冰箱里的牛奶：不脏不新做，有人问才看一眼脏不脏 —— 偷懒偷得理直气壮。",
    pts: [
      "ComputedRefImpl <b>自己就是订阅者</b>：内部 effect 的 scheduler 不重算、只标脏，并把「我脏了」继续往上通知。",
      "三方博弈：底层 dep 变 → computed 标脏 → 依赖 computed 的 effect 被唤醒 → 它读 .value 时才真正重算（惰性）。",
      "读 .value 的完整逻辑：<b>dirty 才重算 + 顺手让读它的人登记自己</b> —— 依赖链就是这么一节一节焊起来的。",
      "写 computed 官方 3.4+ 支持：内部转成 setter 改源值，所以它仍然是「派生」而非存储。",
      "三条纪律：getter 必须纯、不要在 getter 里改状态、链式 computed 按依赖顺序自底向上求值 —— 与 methods 的区别是<b>有缓存、按依赖细粒度失效</b>。"
    ]
  },
  watch: {
    take: "watch = watchEffect + scheduler：把「自动重跑」换成「你自己决定跑什么」。",
    pts: [
      "三种形态归一：source 是 ref/computed/reactive/函数，最终都包成 <b>getter</b>；reactive 对象自动 deep 并 traverse 摸一遍来收集。",
      "job 是回调的入场券：flush pre（组件更新前，默认）/ post（更新后，能拿 DOM）/ sync（同步立即）。",
      "<b>onCleanup</b> 解决过时响应竞态：新一轮回调前先执行上一次注册的清理 —— 取消旧请求就写在这。",
      "组件里创建的 watch 挂在组件的 effectScope 上：<b>组件卸载自动停止</b>，不必手动 stop（第 10 章的机制在这里落地）。",
      "3.5 新玩具：pause/resume 暂停恢复、deep: 'number' 控制深度、once 只跑一次 —— 全是 job 外面的一层薄包装。"
    ]
  },
  nested: {
    take: "嵌套 effect 靠「暂存-还原」不串号；effectScope 是给一批 effect 发的「团长」，解散即全员退休。",
    pts: [
      "嵌套错乱现场：内层跑完把 activeSub 置空，外层后续读取全部漏收集 —— 解法是<b>进内层前暂存、出内层时还原</b>（借函数调用栈之力）。",
      "官方演进：3.0~3.3 显式 effectStack 出栈入栈 → 3.5 暂存还原，本质一样，写法更省。",
      "<code class=\"inline\">effectScope()</code> 把 scope.effects 里所有 effect 一并 stop；组件初始化时创建的正是它 —— 卸载即全停。",
      "<code class=\"inline\">detached</code> 让子作用域脱离父级独立存活（Router 的视图 effect 就用它）。",
      "写组合式函数的礼节：用 <code class=\"inline\">getCurrentScope()</code> 判断环境、用 <code class=\"inline\">onScopeDispose</code> 注册清理 —— VueUse 全家都是这个范式。"
    ]
  },
  apifamily: {
    take: "全家桶是一个函数工厂的四个产物：选型只问三个问题 —— 多深、多大、要不要手动挡。",
    pts: [
      "reactive / readonly / shallowReactive / shallowReadonly 由同一个工厂生产，只差 handler 组合与 depth 参数。",
      "<b>shallowRef</b> 是大对象的省电模式：只有 .value 整体替换才触发；配合 <code class=\"inline\">triggerRef</code> 手动广播内部变更。",
      "<b>customRef</b> 是手动挡：track/trigger 自己调 —— 防抖输入框就是它在 track 前延时、trigger 前去重。",
      "<code class=\"inline\">toRaw</code> 出门（拿原始对象给第三方库）、<code class=\"inline\">markRaw</code> 拒收（这对象永远别代理，如富文本实例）。",
      "决策树：原始值 → ref；大而局部改动 → shallow；需要受控时序 → customRef；第三方实例 → markRaw。"
    ]
  },
  practice: {
    take: "九成「数据变了页面不动」都是丢了响应式连接 —— 拿五步诊断法按图索骥。",
    pts: [
      "案例一：解构 reactive 对象 = 复制走快照，连接断开 —— 用 toRefs 或干脆不解构。",
      "案例二：解构 props 同理，且父组件更新后拿到的是旧值 —— <code class=\"inline\">toRef(props, 'x')</code> 才是活的。",
      "案例三：对象放进 Set/Map 后走 collectionHandlers，响应式「看起来消失」—— 用 reactive 版集合 API（第 13 章）。",
      "五步诊断法：① 确认读写的是同一份（toRaw 对比）② 有没有解构/展开 ③ 有没有 markRaw/shallow ④ 集合还是普通对象 ⑤ watch 的 source 写法对不对。",
      "心法总纲一张图：<b>凡是「取出值」的动作都可能断线，凡是「保持引用」的动作都保平安</b>。"
    ]
  },

  /* ---------- 深水区 13~14 ---------- */
  collections: {
    take: "Set/Map 不能拦属性访问，就拦方法调用 —— track/trigger 埋进方法体里。",
    pts: [
      "集合走 <b>collectionHandlers</b>：Proxy 只拦截 get，拦截到的是方法本身，所以包装一版 instrumentations。",
      "<code class=\"inline\">get/set/has/delete</code> 各自埋好 track/trigger；size 和 forEach 走 <code class=\"inline\">ITERATE_KEY</code>。",
      "魔鬼细节一：<code class=\"inline\">p.get(k) !== raw.get(k)</code> 的 identity 比较坑 —— 官方双版本 get（劫持返回值 vs 原样返回）。",
      "魔鬼细节二：readonly 集合不能真写，方法里探到只读就<b>降级到 raw 上操作</b>并告警。",
      "遍历类操作触发 ITERATE_KEY：新增/删除 key 会触发它 —— 这就是「v-for 里 push 能更新」的完整原因。"
    ]
  },
  linkedlist: {
    take: "官方 3.5 内核 = Dep + Link 两个类：dep 与 effect 的每一次相遇都记成一条双向链节点。",
    pts: [
      "<b>Dep</b>：订阅者双向链头 + version + 全局 trackId 机制；<b>Link</b>：一对 dep-sub 关系的节点，prev/next 两根指针。",
      "track = Dep.track()：sub 已链接（trackId 匹配）直接走；否则 <code class=\"inline\">link(dep, sub)</code> 挂链 —— 双向登记 O(1)。",
      "trigger = version++ → <code class=\"inline\">notify()</code> → 按 next 顺链把订阅者塞进 batch 队列 —— 不再遍历 Set，通知是「顺链传递」。",
      "清理：跑前记 depsLength 快照，跑后从尾巴上摘掉「本轮没被重新链接」的 Link —— 增量清算，代价摊到每次运行。",
      "概念映射：三层名册 ↔ Dep；activeEffect ↔ activeSub；effects 遍历 ↔ 双向链 — <b>思想没变，换了个更省的记账方式</b>。"
    ]
  },

  /* ---------- 渲染器篇 15~20 ---------- */
  renderer: {
    take: "渲染器 = core 的流程 + 注入的 DOM 接口盒：换掉盒子，画布上也能跑 Vue。",
    pts: [
      "<b>nodeOps</b> 八个接口（createElement/insert/remove…）定义「渲染需要什么」，不定义「怎么操作 DOM」 —— 依赖倒置。",
      "<b>patchProp</b> 四路分流：class、style、事件、其他 attribute；最后一道分流是 <b>in 判定</b>：DOM property 走赋值，否则 setAttribute。",
      "⭐ <b>patchEvent 的 invoker</b>：事件只挂一次，更新只换 invoker.value —— 缓存的存在让「事件永远不用重挂」。",
      "unmount 一条线：递归卸载子树 → 组件走 beforeUnmount/unmounted → 指令 beforeUnmount 钩子 → 摘 DOM。",
      "patchElement 走快慢车道：有 patchFlag 就只对比 flag 标注的属性/子节点（快车道），全靠 flag 编译期省下的运行时。"
    ]
  },
  hvnode: {
    take: "VNode 是对「渲染结果」的一次快照：两次快照对比，就知道最小操作集 —— shapeFlag 用一个数字背 32 个布尔。",
    pts: [
      "为什么需要 VNode：DOM 操作太贵，<b>声明式描述 + 最小化更新</b>是性价比之王。",
      "结构八件套：type / props / children / el / shapeFlag / patchFlag / key / dynamicChildren。",
      "<b>shapeFlag</b> 位运算：ELEMENT = 1、COMPONENT = 1<<2……一个数字同时表达「是什么 + children 什么形态」。",
      "<code class=\"inline\">h()</code> 只是 createVNode 的短别名：预处理 children 规范化（对象/数组/文本七十二变归一）、合并 props。",
      "<b>VNode 树 ≠ 组件树</b>：前者是渲染快照会反复重建，后者是稳定实例（状态住在这里）。"
    ]
  },
  mount: {
    take: "mountElement 的顺序是艺术：先造后插、先子后父、事件最后 —— 顺序错了性能差一个量级。",
    pts: [
      "总路线：shapeFlag 分诊 → createElement → patchProp 挂属性 → <b>先挂子节点</b> → 整体 insert。",
      "先子后父：父元素带着完整子树一次性入文档，避免逐个插入引发多次回流。",
      "事件要在挂到文档<b>之前</b>挂好 —— 否则插入瞬间触发的事件（如 focus）接不住。",
      "unmount 是 mount 的镜像 + 一件必做的事：<b>先摘 el 引用</b>再删 DOM，防止卸载后还被误用。",
      "本章实现可直接抄进 runtime-core/src/index.ts —— 抄完跑通 mini 渲染器实验室即验收。"
    ]
  },
  diff: {
    take: "diff = 先用「最坏情况兜底」，再求「最长递增子序列」让该动的动，不该动的一根手指都别动。",
    pts: [
      "patchChildren 分诊台：新老都数组 + 有 key → 核心算法；任一无 key → patchUnkeyedChildren 简单对比。",
      "五步预处理：①头头同 patch ②尾尾同 patch ③仅新增（头插到老头）④仅卸载（从老尾删）⑤进入乱序主战场。",
      "主战场：给新 children 建 <b>keyToNewIndexToMap</b> → 老节点找位（找到 patch、找不到卸载）→ 求<b>最长递增子序列</b> → LIS 外的节点才移动。",
      "为什么从后往前插：用 <b>anchor</b> 逐个 insert(el, container, anchor)，保证新节点的相对顺序一次成型。",
      "LIS 的意义：把「必须移动的节点」压到最少 —— 移动 DOM 是 diff 里最贵的操作。"
    ]
  },
  component: {
    take: "组件 =「render 函数包进 effect」：数据一变，effect 把整个组件的 render 重新排队跑一遍。",
    pts: [
      "组件 vnode 的 type 是对象；mountComponent 三步：创建实例 → setup → 建立渲染 effect。",
      "<b>渲染 effect 带 scheduler</b>：数据变了不立即重渲，而是 queueJob 进队 —— 这就是「父组件一次改多个数据只更新一次」的原因。",
      "父组件更新时先过 <b>shouldUpdateComponent</b>：props 没变且无插槽变化，子组件连 render 都不会被调用。",
      "子组件的 props 是浅响应的「视图」：父传入新值 → props 对象被触发 → 子组件渲染 effect 感知重跑。",
      "生命周期 = 「注册进实例对应槽位」；this 是 PublicInstanceProxyHandlers 的代理，按 setup → data → props → ctx 的顺序查找。"
    ]
  },
  blocktree: {
    take: "Block Tree 是 diff 的「点名花名册」：动态节点拉平成清单，静态的一个都不看。",
    pts: [
      "Block 栈 30 行：渲染时遇到动态节点就收集进当前 Block 的 dynamicChildren —— <b>按结构顺序</b>记录。",
      "patchBlockChildren 直接按索引对比清单，<b>不再逐层递归整棵树</b> —— 静态节点根本不进入视野。",
      "v-if / v-for 必须开新 Block：它们的分支会改变结构顺序，拉平清单会错位 —— 边界处重新开册。",
      "这份花名册是编译期生成的（第 30 章 patchFlag + Block）：编译器知道谁是动态的，运行时只负责抄名单。"
    ]
  },

  /* ---------- 组件与调度 21~24 ---------- */
  startflow: {
    take: "createApp → mount 的三次翻译：组件 → 渲染器 → vnode 树，最后一张 patch 补丁打上像素。",
    pts: [
      "createApp 返回「工厂里的工厂」：app 对象集中 use/component/directive/provide 等全局配置。",
      "mount 三次翻译：①把根组件包成 vnode ②render(vnode, container) ③container 内部旧内容清空 + mountComponent 全流程。",
      "第一次渲染没有 oldVNode，patch 走 mount 分支 —— 你在 15~19 章学的所有机器在这里首次联动。",
      "app.unmount 走的卸载线会把组件树整个退役；同一个 app 二次 mount 会被告警 —— <b>一个 app 一生只 mount 一次</b>。",
      "对照官方：runtime-dom 的 createApp 多做了「标准化容器」（selector → HTMLElement）这一步。"
    ]
  },
  compdata: {
    take: "props 是合同、attrs 是边角料、emit 是收据、slots 是预制的函数袋。",
    pts: [
      "实例 instance 十几个字段里最核心的四块：setupState / props / slots / proxy —— this 的查找顺序由它们决定。",
      "initProps 分家：<b>声明过的进 props，没声明的进 attrs</b>（class/style 永远是 attrs）—— emits 声明也参与分家。",
      "emit 的两次变换：事件名 camelCase → kebab-case 各试一次，最终 <code class=\"inline\">props['on' + capitalize(name)]</code> 找到处理函数。",
      "initSlots：编译器把插槽编译成函数袋，运行时只管按需调用 —— <code class=\"inline\">$slots</code> 是惰性的。",
      "<code class=\"inline\">defineExpose</code> 把内部状态关进抽屉：父组件通过模板 ref 拿到的只有暴露的那一层 —— 封装靠它。"
    ]
  },
  scheduler: {
    take: "queueJob = 「同一帧只更新一次」的票务系统：去重、排序、一趟 flush，nextTick 是排在散场后的顺风车。",
    pts: [
      "同步更新的灾难：一次点击改 10 个数据 = 10 次全量重渲 —— Vue 的答案是<b>微任务批处理</b>。",
      "queueJob 三板斧：<b>flag 去重</b>（已入队不重复）、<b>id 有序插入</b>（父组件 id 小先更新）、flush 时再校验（可能已被父更新顺带处理）。",
      "flushJobs 一趟洗牌：排序 → 依次执行 → 执行途中可能再入队 → 队列空了才结束（本轮新任务进下一轮微任务）。",
      "nextTick = promise.then 挂在同一个微任务链上：所以「改数据 → nextTick → 拿到的是新 DOM」。",
      "递归更新保护：同一 job 在一轮 flush 里自增计数超阈值（100）就报「Maximum recursive updates」—— 死循环写给字面上看。"
    ]
  },
  pin: {
    take: "provide/inject 是「顺着组件链找爷爷」；KeepAlive/Teleport/Suspense 各是 patch 上的一个特殊路口。",
    pts: [
      "provide/inject 的实现就是<b>原型链</b>：instance.provides = Object.create(parent.provides)，inject 沿链查找。",
      "KeepAlive = 缓存 Map + LRU keys + renderer 的 deactivate/activate（DOM 搬进隐藏仓库，不卸载）。",
      "Teleport = patch 分流的第二入口：children 渲染到 target 容器，锚点与挂载点分离。",
      "Suspense = deps 计数器 + 状态机：async setup 的 Promise 被登记，全员就绪才切换 fallback → content。",
      "通信选型七种武器：props/emit、v-model、provide/inject、ref+expose、全局状态、事件总线（不推荐）、attrs —— 按距离和方向选。"
    ]
  },

  /* ---------- 深水区 runtime 25~27 ---------- */
  fragment: {
    take: "Text/Fragment/Static 是 patch 分流表的剩余行：多根模板靠「双锚点」隐身，静态节点有免检通道。",
    pts: [
      "patch 分流完整版按 shapeFlag 走：ELEMENT / COMPONENT / TEXT / COMMENT / FRAGMENT / TELEPORT / SUSPENSE / STATIC。",
      "Text 最简单：el 是文本节点，更新只换 nodeValue。",
      "<b>Fragment 是隐形容器</b>：不产生真实 DOM，靠首尾两个锚点（空文本）定位 —— 多根模板、v-if + 注释占位全靠它。",
      "Static 走免检通道：静态提升的节点整段克隆、跳过 diff —— 编译期标记的功劳。",
      "无 key 子节点走 patchUnkeyedChildren：按下标一一对比，简单但移动优化为零 —— 所以列表要给 key。"
    ]
  },
  directives: {
    take: "自定义指令 = 七个钩子「借」patch 的四个时机顺路执行：v-model 本质就是个指令。",
    pts: [
      "七钩子：created / beforeMount / mounted / beforeUpdate / updated / beforeUnmount / unmounted。",
      "withDirectives 把指令数组挂上 vnode（dirs 属性），patch 在<b>挂载、更新、卸载</b>的四个位置顺路遍历调用。",
      "钩子参数五件套：el、binding（value/oldValue/arg/modifiers）、vnode、prevVnode。",
      "v-model(文本) = value 绑定 + input 事件回写 + .lazy/.trim/.number 三个修饰符的编译期变形。",
      "三个实战轮子：v-copy（click 监听 + 卸载清理）、v-lazy（IntersectionObserver）、v-permission（挂载前直接摘节点）。"
    ]
  },
  transition: {
    take: "Transition 是「六个 class 的时刻表」：进场加完再摘，离场掐表等 animationend。",
    pts: [
      "六 class：enter-from / enter-active / enter-to / leave-from / leave-active / leave-to，按帧切换（双 rAF）。",
      "实现骨架：渲染前后补摘 class + <b>whenTransitionEnds 掐表</b>（读 computed style 算出真实时长）。",
      "离场难点：旧节点要「留在原地演完」再删 —— 先把它从新位置摘出、absolute 定位、演完才真正 unmount。",
      "TransitionGroup = 列表版 + FLIP：移动的节点记下新旧位置，用 transform 反向补间。",
      "常见坑：单根节点限制、css: false 用 JS 钩子、appear 首挂也动画、v-show 的离场是重播 transitionend。"
    ]
  },

  /* ---------- builtins 28~29 ---------- */
  keepalive: {
    take: "KeepAlive 的全部魔法 = 一张缓存 Map + DOM 挪进隐藏仓库：节点从未销毁，所以状态全在。",
    pts: [
      "setup 里三件套：<code class=\"inline\">cache: Map</code>（key→vnode）、<code class=\"inline\">keys: Set</code>（LRU 顺序）、include/exclude 的响应式 watch 重筛。",
      "render 两条路：命中 → cloneVNode 复用 el 与 component 实例；未命中 → 正常挂载并登记。超 max 逐出最久未用。",
      "renderer 对接：<code class=\"inline\">deactivate</code> 把 DOM <b>hostInsert 进 storageContainer</b>（隐藏仓库），activate 原样搬回 —— 这就是「状态保留」的物理原因。",
      "真销毁的三个时机：include/exclude 不再匹配、LRU 超限、KeepAlive 自身卸载 —— 都走 pruneCacheEntry。",
      "失活组件的 watch/定时器<b>不会停</b>：想暂停用 onDeactivated/onActivated 手动控制。"
    ]
  },
  suspense: {
    take: "Suspense = deps 计数器状态机：数到 0 才换幕，pendingId 让过期的换幕作废。",
    pts: [
      "契约：async setup 返回 Promise → 挂到 vnode.asyncDep → Suspense 的 registerDep 接住：<b>deps++</b>。",
      "状态机：deps > 0 显示 fallback；resolve（deps 归 0）→ 新子树先挂到隐藏分支、就绪后整体切换 —— 永远「要么旧、要么完整的新」。",
      "组件不知道 Suspense 存在，编排全在树上层的边界里 —— 但也因此 <b>async setup 必须有 Suspense 包裹</b>，否则内容永远不显示。",
      "pendingId 防竞态：快速切换时旧一轮的 resolve 发现「id 已过期」自动作废 —— 与 invalidateJob 的撤单思想同源。",
      "fallback 里拿不到子组件数据：实例还没创建完 —— 骨架屏的数据要放父级。"
    ]
  },

  /* ---------- compiler 30~34 ---------- */
  compiler: {
    take: "编译器 = parse 建树、transform 变身、codegen 印刷：三大优化全是「编译期多干点，运行时少干点」。",
    pts: [
      "三段流水线：template → <b>AST（parse）</b> → 加工后的 AST（transform）→ <b>render 函数代码（generate）</b>。",
      "优化一 <b>静态提升</b>：静态节点提到 render 外只创建一次，diff 都不进。",
      "优化二 <b>patchFlag</b>：编译期标注「这个节点哪些地方会变」，运行时只查标注项 —— 靶向更新。",
      "优化三 <b>Block Tree</b>：动态节点拉平成 dynamicChildren 清单，运行时按单点名（第 20 章的另一半）。",
      "cacheHandlers 把内联事件缓存成函数复用；模板表达式有白名单前缀沙箱 —— 写不了 window 是编译期拦截。"
    ]
  },
  ast: {
    take: "parser 是一台状态机：逐字符吞模板，上下文里还悄悄为 codegen 埋线。",
    pts: [
      "AST 节点三要素：type（ELEMENT/TEXT/INTERPOLATION…）、tag、props/children —— 树形对应模板结构。",
      "为什么用状态机不用正则：模板有嵌套、有边界歧义，状态机能<b>边解析边纠错</b>（错误恢复后继续编）。",
      "解析上下文 ctx 里藏着 codegen 的线：helpers 集合、identifiers、inline 属性 —— transform/codegen 全要读它。",
      "表达式前缀化：模板里的 <code class=\"inline\">{{ msg }}</code> 在 parse 阶段就标成 <code class=\"inline\">_ctx.msg</code> —— 沙箱从这里开始。",
      "🧪 编译器游乐场是本章主菜：左改模板、右看 AST 和代码三栏实时联动。"
    ]
  },
  transform: {
    take: "transform 是洋葱：enter 从外往里，exit 从里往外 —— 指令的变身全靠这一进一出。",
    pts: [
      "洋葱模型：插件返回的函数在<b>子节点处理完后</b>执行（exit），所以 v-if 能「看到完整的分支」再变身。",
      "v-if 变身全程：识别 → 变成条件表达式结构 → 建立分支数组 → 生成三元/分支代码。",
      "helper 注入：transform 用到哪个运行时函数就 <code class=\"inline\">addExp</code> 记一笔，codegen 按需 import —— 产物永远最小。",
      "v-for 和 v-if 相遇规则：v-for 优先级更高（同一元素先展开循环）—— 官方不建议同元素混用，原因就在这里。",
      "亲手写一个 transform：编译期给静态 class 加前缀 —— 感受「构建时替你写代码」。"
    ]
  },
  codegen: {
    take: "codegen 是印刷厂：同一棵 AST，两台打印机 —— 浏览器的 render 和服务器的 ssrRender。",
    pts: [
      "CodegenContext = 缩进管理 + 代码 pushes 数组 + helper 登记 —— 一个精致的小字符串拼接器。",
      "genNode 是分发表：按节点 type 生成对应代码片段，递归拼完整棵树。",
      "同一模板两种产物：客户端 render（返回 vnode 树）与 SSR 的 ssrRender（直接拼字符串，无需 diff）。",
      "print 前后对照着读一遍 33.5 的逐行注释产物 —— compile 输出的代码从此不再天书。",
      "SFC 一个文件产出三份代码：script、style、template 的 render —— 30.7 的三段式在这里合流。"
    ]
  },
  syntax: {
    take: "语法糖 = 编译期展开的等价代码：每个修饰符都对应一小段内联生成的 JS。",
    pts: [
      "事件修饰符逐个展开：.stop → _withModifiers(e => …, [\"stop\"])，运行时包装器判断 —— 没有魔法，全是生成的代码。",
      "v-model 三种目标三种展开：text（value + input）、checkbox/radio（checked + change）、组件（modelValue + update:modelValue）。",
      ".lazy 改监听 change、.trim/.number 是回写前包一层处理 —— 全是编译期完成。",
      "编译宏（defineProps/defineEmits…）不是函数：编译期直接消除，运行时根本不存在 —— 所以不用 import。",
      "糖的代价表：越甜的糖生成的代码越多，理解展开结果才能预判行为。"
    ]
  },

  /* ---------- frontier 35~37 ---------- */
  error: {
    take: "错误处理两层楼：callWithErrorHandling 把所有用户代码包起来，handleError 沿父链一层层问「接得住吗」。",
    pts: [
      "第一层：invokeArray/patch 等所有用户回调都走 <code class=\"inline\">callWithErrorHandling</code> 包装 —— 捕获点统一。",
      "第二层：handleError 沿 <b>instance.parent 链上溯</b>，每一层问 onErrorCaptured，返回 false 才停止传播。",
      "全局 <code class=\"inline\">app.config.errorHandler</code> 是最终兜底；没有任何处理才走 console/error。",
      "生产分工：errorHandler 接住渲染/生命周期错误并上报；但异步回调（setTimeout/Promise）要另配 window.onerror / unhandledrejection。",
      "warn 与 error 是两套体系：dev 告警不中断运行，error 走传播链。"
    ]
  },
  ssr: {
    take: "SSR 换发动机（字符串直出）+ hydration 激活（只接电线不重建房子）。",
    pts: [
      "服务端：renderToString 走 ssrRender 通道，把组件树直接拼成 HTML 字符串 —— 没有 vnode diff，没有 DOM。",
      "客户端：hydration 拿着 vnode 树与现有 DOM <b>对照激活</b>：绑定事件、建立响应式连接，不重新创建节点。",
      "mismatch 三大原因：服务端客户端渲染结果不一致（时间/随机值）、DOM 被浏览器/用户改动、嵌套不合法标签被浏览器修正。",
      "payload 状态传送：服务端数据序列化进 HTML，客户端直接接管 —— 免去二次请求。",
      "流式渲染：按 readiness 分段推送 + 按需水合 —— 大页面首屏再提速。"
    ]
  },
  custom: {
    take: "自定义渲染器只考一道题：把「增删改查 + 属性」这组接口用另一种介质实现一遍。",
    pts: [
      "注入点清单：createElement/insert/remove/patchProp/setText… 七八个接口就是全部合同。",
      "canvas 版策略：<b>全量重绘</b> —— 把每个 vnode 当作一次 draw 指令，diff 结果映射为重绘标记。",
      "事件在 canvas 上要自己实现命中检测：算坐标、逆序找目标、手动冒泡 —— 这就是 37.4 的进阶作业。",
      "全书视图：reactivity 是心脏、runtime-core 是骨架、renderer 注入是接口 —— 三星电视、小程序、Three.js 渲染 Vue 都是这条路。"
    ]
  },

  /* ---------- ecosystem 38~43 ---------- */
  hmr: {
    take: "HMR = 编译期拆出「热边界」+ 运行期三个动作（rerender/rereload/unmount）+ Vite 当快递员。",
    pts: [
      "SFC 编译时拆成多个带 import.meta.hot 边界的模块：template 变了只 rerender，script 变了才 reload。",
      "运行侧 <code class=\"inline\">__VUE_HMR_RUNTIME__</code> 三动作：rerender（换 render 函数）、reload（组件级重挂）、unmount（清理）。",
      "rerender 的底气：<b>组件实例还在</b>，只把 instance.render 换掉重跑 —— 状态因此保留。",
      "Vite 的角色只是 WebSocket 快递员：文件变了 → 通知浏览器 → 浏览器 import 新模块 → 调 HMR runtime。",
      "HMR 失效回退 full reload 的场景：根组件改动、模板结构大改、检测不到边界。"
    ]
  },
  devtools: {
    take: "devtools 靠一条全局钩子广播：应用启动播 add 事件，组件树、状态、时间线都从钩子里读走。",
    pts: [
      "<code class=\"inline\">__VUE_DEVTOOLS_GLOBAL_HOOK__</code> 是约定好的广播频道：app 创建时 emit 'app:add'。",
      "组件树读取：通过 instance 链遍历 + emit 'component' 事件系列 —— devtools 面板里的树就是这么来的。",
      "时间线（timeline）：性能/状态事件按层分组推送 —— Pinia 的 mutation 面板也走它。",
      "30 行就能写个调试插件：hook.on('app:add') 里拿 app._instance 开玩 —— 本章有完整示例。"
    ]
  },
  router: {
    take: "Router = 一个 reactive 的 currentRoute + matcher 表 + 守卫队列，install 时把全局属性挂上 app。",
    pts: [
      "createRouter：内部 currentRoute 是 <b>reactive</b> 的 —— 所以 <code class=\"inline\">useRoute()</code> 才是响应式的。",
      "history 层统一接口：createWebHistory/HashHistory 把 popstate/hashchange 包装成统一的 listen + push。",
      "matcher：路由表编译成正则 + 参数提取器，resolve 时 path → 匹配记录（拿到组件与 params）。",
      "导航守卫流水线：beforeEach → 组件内 beforeRouteUpdate/Enter → beforeResolve → afterEach，异步串行管道。",
      "<code class=\"inline\">RouterView</code> 本质是按 currentRoute 匹配记录渲染组件的函数组件（嵌套路由靠 depth 递归）。"
    ]
  },
  pinia: {
    take: "Pinia = defineStore 返回惰性 useStore：第一次调用时用 reactive 建好 state，之后全是同一个单例。",
    pts: [
      "createPinia 的 install 四件事：挂全局 _s 注册表、setActivePinia、provide、挂 devtools。",
      "defineStore 返回的 useStore 是<b>惰性工厂</b>：首次调用才 createSetupStore/createOptionsStore。",
      "state 就是一个 reactive 对象；getters 用 computed 包；actions 直接拿到 this（store 实例）调用。",
      "$patch 批量改 + $subscribe 监听变更（走 store.$onAction/订阅机制，devtools 时间线同步）。",
      "与内核对应表：state↔reactive、getter↔computed、action↔普通函数、store↔effectScope 管理的集合 —— 你已经全部学过。"
    ]
  },
  vueuse: {
    take: "VueUse 的秘密 = 三件套范式：onScopeDispose 清理、ref 马甲包原生 API、纯函数防抖节流。",
    pts: [
      "useEventListener：正常 addEventListener + <code class=\"inline\">onScopeDispose(remove)</code> —— 组件卸载自动清理的标准姿势。",
      "useDebounceFn/useThrottleFn：纯函数包装，与响应式无关 —— 工具和响应式分层。",
      "useLocalStorage：ref + JSON 序列化 + storage 事件跨标签页同步。",
      "useIntersectionObserver/useMediaQuery：原生 API 的响应式马甲 —— 拿到值包成 ref，监听变化写回。",
      "读 VueUse 源码的正确姿势：只看「谁在什么时候被创建、谁清理」两件事。"
    ]
  },
  testing: {
    take: "测试是行为的说明书：读官方 __tests__ 先看断言，再回实现；给 mini 写测试从三组用例起步。",
    pts: [
      "官方测试读法：describe 是功能模块、it 是行为契约、断言里藏着边界 —— 比 README 准确一万倍。",
      "给 mini-vue3 起步三组：reactive 基本读写、effect 依赖收集与触发、computed 缓存 —— 45 行内跑通信心。",
      "<code class=\"inline\">@vue/runtime-test</code> 是官方自己的「假 DOM」：nodeOps 换成内存对象树，测试不需要浏览器。",
      "这正好印证第 15 章：nodeOps 是接口 —— <b>接口设计对了，连测试都能换台机器</b>。"
    ]
  },

  /* ---------- build 44~48 ---------- */
  build1: {
    take: "施工①：把 patch/processElement/mountElement/patchChildren 抄进 runtime-core —— 跑通第一个计数器。",
    pts: [
      "施工图：createRenderer 注入 nodeOps + patchProp，patch 按 shapeFlag 分流。",
      "实现清单按依赖顺序：patch → mountElement → patchElement → patchChildren（先无 key 版）。",
      "常见坑：insert 时机（先子后父）、事件挂载要在入文档前、unmount 先摘 el 引用。",
      "验收标准：计数器 + 列表增删 + 事件更新三个 demo 全绿。"
    ]
  },
  build2: {
    take: "施工②：Text/Comment/Fragment —— 多根模板从此可用，双锚点定位是关键。",
    pts: [
      "processText：el = createText，更新只改 nodeValue。",
      "processFragment：不建真实容器，首尾两个空文本锚点定位 —— 多根模板、v-if 占位全靠它。",
      "静态节点走免检通道：整段克隆直接 insert，diff 跳过。",
      "验收：多根组件 + 文本插值 + v-if 注释占位三个 demo。"
    ]
  },
  build3: {
    take: "施工③：withDirectives 四触发点 + 内置三指令 + 最简 Transition。",
    pts: [
      "withDirectives 把 dirs 挂上 vnode；patch 在挂载/更新/卸载四处顺路调用钩子。",
      "内置三指令：v-show（display 切换 + transition 兼容）、v-html、v-model(文本)。",
      "最简 Transition：enter/leave 六 class + whenTransitionEnds 掐表。",
      "验收：v-model 输入框 + v-show 切换动画两个 demo。"
    ]
  },
  build4: {
    take: "施工④：生产级 queueJob + 组件三大件接线 —— 真正的组件树跑起来。",
    pts: [
      "调度器直接抄 23 章：flag 去重 + id 有序插入 + flush 校验 + nextTick。",
      "三大件接线：initProps 分家、emit 两次变换、initSlots 函数袋。",
      "组件更新走 scheduler：渲染 effect 的 job 入队而非同步重跑。",
      "验收四连：嵌套组件 + props 更新 + emit 事件 + nextTick 拿 DOM。"
    ]
  },
  build5: {
    take: "施工⑤：集合拦截器补上最后一块拼图，全家福测试全绿 —— 你的 mini-vue3 与官方同构。",
    pts: [
      "集合拦截器照第 13 章接线：instrumentations 埋 track/trigger + identity 双版本 get。",
      "补齐 effectScope 停止逻辑与 customRef 手动挡。",
      "最终验收：全家福测试（reactive/ref/computed/watch/渲染器/组件/指令/Transition）全绿。",
      "毕业动作：打开 vuejs/core 仓库，从 __tests__ 开始对照读 —— 90% 似曾相识。"
    ]
  },

  /* ---------- masters 49~50 ---------- */
  perf: {
    take: "性能八招一句话：识别不变量，跳过它 —— 编译期标注 + 运行时豁免。",
    pts: [
      "八招速查：v-once / v-memo / 静态提升 / patchFlag / Block Tree / cacheHandlers / shallow 系 API / KeepAlive。",
      "v-memo 是手动挡缓存：依赖数组没变整段子树跳过 diff —— 长列表局部优化的核武器。",
      "运行时三招：shallowRef 省深度代理、markRaw 拒绝代理、v-show 优于频繁 v-if。",
      "排查工作流：先 Performance 面板定位（渲染/计算/更新）→ 用 devtools 高亮更新组件 → 再对症下药，别背口诀。"
    ]
  },
  interview: {
    take: "答题公式：先结论、再原理、最后画图 —— 27 道分级题按🟢🟡🔴🟣四档练。",
    pts: [
      "🟢 基础档（答不出回炉）：响应式原理、ref vs reactive、v-if vs v-show、computed vs watch。",
      "🟡 进阶档（拉开差距）：为什么 Proxy 配 Reflect+receiver、依赖清理 3.5 方案、nextTick 原理、diff 与 LIS。",
      "🔴 高手档（谈判筹码）：invoker 事件缓存、Block Tree 边界、KeepAlive 挪移、HMR 三动作。",
      "🟣 拓展档：3.5 双向链表内核、alien-signals 与 Vapor 模式 —— 展示你在追前沿。",
      "手写题必练三件套：mini reactive（10 行）、mini computed（15 行）、LIS（25 行）—— 全在本站实验室里。"
    ]
  },

  /* ---------- 51 roadmap ---------- */
  roadmap: {
    take: "四代内核换了又换，不变量只有一个：读取时登记，写入时通知，值没变不打扰。",
    pts: [
      "知识地图：响应式（track/trigger 两大动作）→ 渲染器（h/mount/patch/diff）→ 组件（render 包进 effect）→ 编译器（三大优化反哺运行时）。",
      "下一步施工：按 44~48 章把 mini-vue3 写完，再对照官方 __tests__ 朝圣。",
      "三处彩蛋别忘了找：tarckEffect 拼写、RefImpl 少一次 toReactive、traverse 的 if 短路。",
      "Vue 3.6 在路上：alien-signals 重写内核 + Vapor 无虚拟 DOM —— 心智模型依然全部有效。",
      "源码不是用来背的，是用来「哦——原来如此」的。现在打开编辑器，把实验室每一行再敲一遍。👋"
    ]
  }
};
