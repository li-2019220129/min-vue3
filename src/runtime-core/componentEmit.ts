export function emit(instance: any, event: any, ...args: any[]) {
  const { props } = instance;
  const capilalize = (str: any) => {
    return str.replace(/(?:^|-)(\w)/g, (_, group1) => group1.toUpperCase());
  };
  const toHandlerKey = (str: string) => {
    return str ? "on" + capilalize(str) : "";
  };
  const handleName = toHandlerKey(event);

  const handler = props[handleName];
  handler && handler(...args);
}
