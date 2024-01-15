// {
//     'header':[() => h("p", {}, "footer")]
// }
import { ShapeFlags } from "../shared/index";
export function initSlots(instance: any, children: any) {
  if (instance.vnode.shapeFlags & ShapeFlags.SLOT_CHILDREN) {
    const slots: any = {};
    for (const key in children) {
      const value = children[key];
      slots[key] = (props: any) =>
        Array.isArray(value(props)) ? value(props) : [value(props)];
    }
    instance.slots = slots;
  } else {
    console.warn("不合法的slots");
  }
  //   instance.slots = Array.isArray(children) ? children : [children];
}
