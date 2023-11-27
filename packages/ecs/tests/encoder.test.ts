import {expect, it, describe} from "vitest";
import {BitSet, getComponentID} from "../src/index.js";
import {defineEncoder} from "../src/encoder.js";
import {$cid, attach, defineComponent} from "../dist/component.js";
import {i32, u8} from "../dist/types.js";
import {createWorld} from "../dist/world.js";
import {createEntity} from "../dist/entity.js";
import {Position} from "../../../sandbox/src/bomber/shared.js";

describe("Encoder", () => {
  it("can encode multiple types schemas", () => {
    const TestComponent1 = defineComponent({
      x: i32,
      y: i32,
    });
    const TestComponent2 = defineComponent({
      test: u8,
    });

    const world = createWorld();
    const e = createEntity(world);

    attach(world, TestComponent1, e);
    attach(world, TestComponent2, e);

    TestComponent1.x[e] = 5;
    TestComponent1.y[e] = 10;
    TestComponent2.test[e] = 125;

    const [encode] = defineEncoder(TestComponent1, TestComponent2);
    const buffer = new ArrayBuffer(1024);
    console.log(getComponentID(TestComponent1));
    encode([e], buffer);

    const view = new DataView(buffer);

    const decodedE = view.getInt32(0);
    expect(decodedE).toBe(e);

    const decodedComp = view.getInt32(4);
    expect(decodedComp).toEqual(getComponentID(TestComponent1));

    const decodedX = view.getInt32(8);
    const decodedY = view.getInt32(12);
    expect(decodedX).toEqual(TestComponent1.x[e]);
    expect(decodedY).toEqual(TestComponent1.y[e]);

    const decodedComp2 = view.getInt32(16);
    expect(decodedComp2).toEqual(getComponentID(TestComponent2));

    const decodedTest = view.getUint8(20);
    expect(decodedTest).toEqual(TestComponent2.test[e]);
  });
});
