import { reactive } from "../reactive";
describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const result = reactive(original);
    expect(result).not.toBe(original);
    expect(result.foo).toBe(1);
  });
});
