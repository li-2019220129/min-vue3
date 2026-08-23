export function createRenderer(renderOptions) {

    const {
        insert: hostInsert,
        remove: hostRemove,
        createElement:hostCreateElement,
        setElementText:hostSetElementText,
        setText:hostSetText,
        parentNode:hostParentNode,
        nextSibling:hostNextSibling,
        patchProp:hostPatchProp
    } = renderOptions
  //core 不关心如何渲染
  const render = (vnode, container) => {
    console.log(vnode, container);
  };
  return {
    render,
  };
}
