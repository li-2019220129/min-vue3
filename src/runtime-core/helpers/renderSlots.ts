import { createVNode } from "../vnode";
import { Fragment } from "../vnode";
export function renderSlots(slots: any, key: string, row: any) {
  const slot = slots[key];
  console.log(slot(row));
  //   const children = slots[key] ? slots[key](row) : [];
  if (slot) {
    if (typeof slot === "function") {
      return createVNode(Fragment, {}, slot(row));
    }
  }
}
