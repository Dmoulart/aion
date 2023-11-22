import {expect, it, describe} from "vitest";
import {
  attach,
  defineComponent,
  hasComponent,
  detach,
  createEntity,
  createWorld,
  i32,
  i8,
} from "../src/index.js";

describe("Component", () => {
  it("can be created", () => {
    expect(() => defineComponent({})).not.toThrowError();
  });
  it("sees its array types fields instanciated", () => {
    const TestComponent = defineComponent({
      field: i8,
    });

    const world = createWorld(1_000_000);

    expect(TestComponent.field).toBeInstanceOf(Int8Array);
  });
  it("sees its array types fields instanciated and preallocated", () => {
    const TestComponent = defineComponent(
      {
        field: i8,
      },
      1_000_000
    );

    const world = createWorld(1_000_000);

    expect(TestComponent.field).toHaveLength(1_000_000);
  });
  it("can have arrays of arrays as data types", () => {
    const TestComponent = defineComponent(
      {
        nested: [i8, 5],
      },
      1_000_000
    );

    const world = createWorld(1_000_000);

    expect(TestComponent.nested).toBeInstanceOf(Array);
    expect(TestComponent.nested).toHaveLength(1_000_000);
    expect(TestComponent.nested[0]).toHaveLength(5);
  });
  it("can be added to entities without throwing error", () => {
    const TestComponent = defineComponent({
      test: i8,
    });

    const world = createWorld();

    const eid = createEntity(world);

    expect(() => attach(world, TestComponent, eid)).not.toThrowError();
  });
  it("adding to non existant entities does throw error", () => {
    const TestComponent = defineComponent({
      test: i8,
    });

    const world = createWorld();

    expect(() => attach(world, TestComponent, 123)).toThrowError();
  });
  it("can be detected on an entity", () => {
    const TestComponent = defineComponent({
      test: i8,
    });

    const world = createWorld();

    const eid = createEntity(world);

    attach(world, TestComponent, eid);

    expect(hasComponent(world, TestComponent, eid)).toStrictEqual(true);
  });
  it("cannot be detected on an entity if not added", () => {
    const TestComponent = defineComponent({
      test: i8,
    });

    const world = createWorld();

    const eid = createEntity(world);

    expect(hasComponent(world, TestComponent, eid)).toStrictEqual(false);
  });
  it("can be removed", () => {
    const TestComponent = defineComponent({
      test: i8,
    });

    const world = createWorld();

    const eid = createEntity(world);

    attach(world, TestComponent, eid);
    detach(world, TestComponent, eid);

    expect(hasComponent(world, TestComponent, eid)).toStrictEqual(false);
  });
  it("can add multiple components", () => {
    const TestComponent = defineComponent({
      test: i8,
    });
    const TestComponent2 = defineComponent({
      test: i32,
    });

    const world = createWorld();

    const eid = createEntity(world);

    attach(world, TestComponent, eid);
    attach(world, TestComponent2, eid);

    expect(hasComponent(world, TestComponent, eid)).toStrictEqual(true);
    expect(hasComponent(world, TestComponent2, eid)).toStrictEqual(true);
  });
  it("does not throw when trying to remove a non existant component", () => {
    const TestComponent = defineComponent({
      test: i8,
    });

    const world = createWorld();

    const eid = createEntity(world);

    expect(() => detach(world, TestComponent, eid)).not.toThrowError();
  });
});