function createInvoker(value) {
  const invoker = (e) => invoker.value(e);
  invoker.value = value;
  return invoker;
}
export default function patchEvent(el, name, nextValue) {
  const invokers = el._vei || (el._vei = {});
  const eventName = name.slice(2).toLowerCase();
  const existingInvoker = invokers[name];
  if (nextValue && existingInvoker) {
    return (existingInvoker.value = nextValue);
  }
  if (nextValue) {
    const involer = (invokers[name] = createInvoker(nextValue));
    return el.addEventListener(eventName, involer);
  } else if (existingInvoker) {
    el.removeEventListener(eventName, existingInvoker);
    invokers[name] = undefined;
  }
}
