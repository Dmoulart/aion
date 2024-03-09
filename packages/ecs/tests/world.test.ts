import { expect, it, describe } from "vitest";
import {
  defineComponent,
  createEntity,
  i8,
  createWorld,
  attach,
  detach,
  hasComponent,
  prefab,
  entityExists,
} from "../src/index.js";

describe("World", () => {
  it("throws when world capacity exceeded", () => {
    const world = createWorld(2);
    createEntity(world);
    createEntity(world);
    expect(() => createEntity(world)).toThrowError();
  });

  it("can create multiple world", () => {
    createWorld(100_000);
    createWorld(100_000);
    expect(() => createWorld(100_000)).not.toThrowError();
  });

  it("can use world API", () => {
    const TestComponent = defineComponent({
      field: i8,
    });
    const TestComponent2 = defineComponent({
      field: i8,
    });

    const world = createWorld();

    const actor = prefab(world, { TestComponent });

    const player = actor({
      TestComponent: {
        field: 1,
      },
    });

    attach(world, TestComponent2, player);
    expect(hasComponent(world, TestComponent2, player)).toStrictEqual(true);

    detach(world, TestComponent2, player);
    expect(hasComponent(world, TestComponent2, player)).toStrictEqual(false);

    expect(entityExists(world, player)).toStrictEqual(true);
  });
});
