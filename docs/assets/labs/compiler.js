/* compiler.html 实验室引擎 */
"use strict";
(function initCompilerPlayground() {
  var astEl = $("cpAst");
  if (!astEl) return;
  var logAst = mkLog(astEl), logCode = mkLog($("cpCode"));
  var tipEl = $("cpTip");

  var EX = [
    {
      tip: "示例①：文本与插值混排 → 合并为 CompoundExpressionNode，codegen 打印成字符串拼接。",
      ast: [
        ["sys", "parse 产物（AST）："],
        ["run", "RootNode"],
        ["info", "└ ElementNode <span>"],
        ["track", "   └ CompoundExpressionNode（混排节点）"],
        ["info", "      ├ \"hello \"            ← TextNode 并入"],
        ["out", "      └ {{ name }}          ← InterpolationNode"],
      ],
      code: [
        ["sys", "generate 产物："],
        ["run", "function render(_ctx, _cache) {"],
        ["info", "  return _createVNode(\"span\", null,"],
        ["track", "    _toDisplayString(\"hello \" + _ctx.name))"],
        ["info", "}"],
        ["out", "helpers 注入：createVNode、toDisplayString"],
      ],
    },
    {
      tip: "示例②：v-if 在 transform 阶段变身条件表达式；没有 else 分支时补注释 vnode 占位 —— 这就是 <!----> 的由来。",
      ast: [
        ["sys", "parse 产物："],
        ["run", "ElementNode <p>"],
        ["info", "  directives: [ v-if (exp: ok) ]"],
        ["info", "  children: [ TextNode(\"hi\") ]"],
        ["clean", "── transform（transformIf）之后 ──"],
        ["track", "codegenNode = IF {"],
        ["track", "  branches: [ { condition: ok, content: <p>hi</p> } ],"],
        ["info", "  （无 else 分支）"],
        ["track", "}"],
      ],
      code: [
        ["sys", "generate 产物："],
        ["run", "function render(_ctx, _cache) {"],
        ["info", "  return _ctx.ok"],
        ["track", "    ? (_createVNode(\"p\", null, \"hi\"))"],
        ["clean", "    : (_createCommentVNode(\"v-if\", true))"],
        ["info", "}"],
        ["out", "helpers 注入：createVNode、createCommentVNode"],
      ],
    },
    {
      tip: "示例③：v-for 生成 _renderList + createBlock；@click 编译成 onXxx prop（第 22 章结论）；patchFlag 标出「列表 + key」。",
      ast: [
        ["sys", "parse 产物："],
        ["run", "ElementNode <ul>"],
        ["info", "└ ElementNode <li>"],
        ["track", "   directives: [ v-for (t in todos) ]"],
        ["track", "   props: [ :key=\"t.id\" ]"],
        ["track", "   directives: [ v-on:click=\"del(t.id)\" ]"],
        ["info", "   children: [ {{ t.text }} ]"],
        ["clean", "── transform（vFor + on）之后 ──"],
        ["track", "codegenNode = FOR { source: todos, key: t.id, ... }"],
      ],
      code: [
        ["sys", "generate 产物（预编译版）："],
        ["run", "return (_openBlock(), _createBlock(\"ul\", null, ["],
        ["info", "  (_openBlock(true), _createBlock(_Fragment, { key: 0 },"],
        ["track", "    _renderList(_ctx.todos, (t) => ("],
        ["track", "      _createVNode(\"li\", { key: t.id, onClick: () => del(t.id) },"],
        ["out", "        _toDisplayString(t.text), 64 /* KEYED_FRAGMENT */))"],
        ["info", "  ), 128 /* KEYED_FRAGMENT */))]))"],
      ],
    },
  ];

  function show(i) {
    astEl.innerHTML = "";
    $("cpCode").innerHTML = "";
    function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    EX[i].ast.forEach(function (ln) { logAst(ln[0], esc(ln[1])); });
    EX[i].code.forEach(function (ln) { logCode(ln[0], esc(ln[1])); });
    tipEl.textContent = "💡 " + EX[i].tip;
  }
  $("cpSteps").addEventListener("click", function (e) {
    var b = e.target.closest(".step-btn");
    if (!b) return;
    show(+b.getAttribute("data-cp"));
  });
  show(0);
})();
