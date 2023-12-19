import { reactive } from "../reactive";
import { effect, stop } from "../effect";
describe("first", () => {
  it("happy path", () => {
    const user = reactive({
      name: "John",
      age: 18,
    });

    let nextUser;
    effect(() => {
      nextUser = user.age + 1;
    });
    expect(nextUser).toBe(19);
    //update
    user.age++;
    expect(nextUser).toBe(20);
  });
  it("", () => {
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return "foo";
    });
    expect(foo).toBe(11);
    const res = runner();
    expect(res).toBe("foo");
    expect(foo).toBe(12);
  });
  it("scheduler", () => {
    //1,通过effect的第二个参数给定的一个scheduler的fn
    //2,effect第一次执行的时候，还会执行fn
    //3,当响应式对象变化的时候，会执行scheduler，不会执行fn
    //4,如果说当执行runner的时候还会重新执行fn
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({
      foo: 1,
    });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    obj.foo++;
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(2);
    expect(dummy).toBe(1);
    run();
    expect(dummy).toBe(3);
  });

  it("stop", () => {
    let dummy;
    const obj = reactive({
      prop: 1,
    });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner);
    obj.prop = 3;
    expect(dummy).toBe(2);
    runner();
    expect(dummy).toBe(3);
  });
  it("onStop", () => {
    const obj = reactive({
      foo: 1,
    });
    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop,
      }
    );
    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });
});
