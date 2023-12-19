import { readonly } from "../reactive";

describe("readOnly", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const wrapper = readonly(original);
    expect(wrapper).not.toBe(original);
    expect(wrapper.foo).toBe(1);
  });
});
