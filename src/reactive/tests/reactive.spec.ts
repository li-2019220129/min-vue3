import { reactive } from "../reactive";
import { isReactive, isProxy } from "../utils";
describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const result = reactive(original);
    expect(isReactive(result)).toBe(true);
    expect(isProxy(result)).toBe(true);
    expect(result).not.toBe(original);
    expect(result.foo).toBe(1);
  });
  it("happy path", () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    };
    const observed = reactive(original);
    // expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
  });
});
