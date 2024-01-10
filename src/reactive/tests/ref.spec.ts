import { effect } from "../effect";
import { reactive } from "../reactive";
import { ref, isRef, unRef, proxyRefs } from "../ref";
import { isReactive } from "../utils";
describe("shallowReadonly.spec", () => {
  it("happy path", () => {
    const a = ref(1);
    // wrapper.foo = 2;
    expect(a.value).toBe(1);
  });
  it("should not be able to set a readonly property", () => {
    const a = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = a.value;
    });
    expect(calls).toBe(1);
    expect(dummy).toBe(1);
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  });
  it("should make nested properties reactive", () => {
    const a = ref({
      count: {
        b: 12,
      },
    });
    let dummy;
    effect(() => {
      dummy = a.value.count.b;
    });
    expect(dummy).toBe(12);
    a.value.count = {
      b: 13,
    };
    expect(isReactive(a.value.count)).toBe(true);
    expect(dummy).toBe(13);
  });
  it("isRef", () => {
    const a = ref(1);
    const user = reactive({
      age: 1,
    });
    expect(isRef(a)).toBe(true);
    expect(isRef(user)).toBe(false);
    expect(isRef(1)).toBe(false);
  });

  it("unRef", () => {
    const a = ref(1);
    expect(unRef(a)).toBe(1);
  });
  it("proxyRefs", () => {
    const user = {
      age: ref(10),
      name: ref("John"),
      play: "打老虎机",
    };
    const userProxy = proxyRefs(user);
    expect(user.age.value).toBe(10);
    expect(user.name.value).toBe("John");
    expect(userProxy.age).toBe(10);
    expect(userProxy.name).toBe("John");
    expect(userProxy.play).toBe("打老虎机");
    userProxy.age = 20;
    expect(userProxy.age).toBe(20);
    expect(user.age.value).toBe(20);
  });
});
