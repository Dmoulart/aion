import {expect, it, describe} from "vitest";
import {
  BitSet,
  getComponentID,
  createEntity,
  createWorld,
  removeEntity,
  entityExists,
} from "../src/index.js";
import {defineEncoder} from "../src/encoder.js";
import {$cid, attach, defineComponent} from "../src/component.js";
import {i32, u8} from "../src/types.js";

describe("Encoder", () => {
  it("can encode multiple types schemas", () => {
    const TestComponent1 = defineComponent({
      x: i32,
      y: i32,
    });
    const TestComponent2 = defineComponent({
      test: u8,
    });
    console.log(TestComponent1[$cid]);
    const world = createWorld();
    const e = createEntity(world);

    attach(world, TestComponent1, e);
    attach(world, TestComponent2, e);

    TestComponent1.x[e] = 5;
    TestComponent1.y[e] = 10;
    TestComponent2.test[e] = 125;

    const [encode] = defineEncoder([TestComponent1, TestComponent2]);
    const buffer = new ArrayBuffer(1024);
    encode([e], buffer);

    const view = new DataView(buffer);

    const decodedE = view.getInt32(0, true);
    expect(decodedE).toBe(e);

    const decodedComp = view.getInt32(4, true);
    expect(decodedComp).toEqual(getComponentID(TestComponent1));

    const decodedX = view.getInt32(8, true);
    const decodedY = view.getInt32(12, true);
    expect(decodedX).toEqual(TestComponent1.x[e]);
    expect(decodedY).toEqual(TestComponent1.y[e]);

    const decodedComp2 = view.getInt32(16, true);
    expect(decodedComp2).toEqual(getComponentID(TestComponent2));

    const decodedTest = view.getUint8(20);
    expect(decodedTest).toEqual(TestComponent2.test[e]);
  });
  it("can encode and decode", () => {
    const TestComponent1 = defineComponent({
      x: i32,
      y: i32,
    });
    const TestComponent2 = defineComponent({
      test: u8,
    });
    console.log(TestComponent1[$cid]);
    const world = createWorld();
    const e = createEntity(world);

    attach(world, TestComponent1, e);
    attach(world, TestComponent2, e);

    TestComponent1.x[e] = 5;
    TestComponent1.y[e] = 10;
    TestComponent2.test[e] = 125;

    const [encode, decode] = defineEncoder([TestComponent1, TestComponent2]);
    const buffer = encode([e]);

    removeEntity(world, e);

    TestComponent1.x[e] = 0;
    TestComponent1.y[e] = 0;
    TestComponent2.test[e] = 0;

    decode(world, buffer);

    expect(TestComponent1.x[e]).toBe(5);
    expect(TestComponent1.y[e]).toBe(10);
    expect(TestComponent2.test[e]).toBe(125);
  });
});
