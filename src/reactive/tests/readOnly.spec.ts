import { readonly } from "../reactive";
import { isReadonly, isProxy } from "../utils";
describe("readOnly", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const wrapper = readonly(original);
    expect(wrapper).not.toBe(original);
    // wrapper.foo = 2;
    expect(wrapper.foo).toBe(1);
  });
  it("warn then call set", () => {
    console.warn = jest.fn();
    const user = readonly({
      age: 12,
    });
    user.age = 13;
    expect(console.warn).toBeCalled();
  });
  it("isReadonly", () => {
    const original = { foo: 1, bar: { baz: 23 } };
    const wrapper = readonly(original);
    expect(isReadonly(wrapper)).toBe(true);
    expect(isProxy(wrapper)).toBe(true);
    expect(isReadonly(original)).toBe(false);
    expect(isReadonly(wrapper.bar)).toBe(true);
    expect(isReadonly(original.bar)).toBe(false);
  });
});
