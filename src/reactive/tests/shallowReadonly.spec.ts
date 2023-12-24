import { shallowReadonly } from "../reactive";
import { isReadonly } from "../utils";

describe("shallowReadonly.spec", () => {
  it("happy path", () => {
    const original = { foo: 1, a: { c: 12 } };
    const wrapper = shallowReadonly(original);
    // wrapper.foo = 2;
    expect(isReadonly(wrapper)).toBe(true);
    expect(isReadonly(wrapper.a)).toBe(false);
  });
});
