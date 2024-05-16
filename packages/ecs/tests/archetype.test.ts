import { expect, it, describe } from "vitest";
import {
  createWorld,
  defineComponent,
  getComponentID,
  i8,
  makeComponentsMask,
  createArchetype,
  deriveArchetype,
} from "../src/index.js";

describe("Archetype", () => {
  it("can be created with component", () => {
    const TestComponent = defineComponent({
      test: i8,
    });

    const archetype = createArchetype(makeComponentsMask([TestComponent]));

    expect(archetype.mask.has(getComponentID(TestComponent))).toBeTruthy();
  });
  it("can be augmented", () => {
    const world = createWorld();

    const TestComponent1 = defineComponent({
      test: i8,
    });
    const TestComponent2 = defineComponent({
      test: i8,
    });

    const archetype = createArchetype(makeComponentsMask([TestComponent1]));

    const augmentedArchetype = deriveArchetype(
      archetype,
      getComponentID(TestComponent2),
      world
    );

    expect(
      augmentedArchetype.mask.has(getComponentID(TestComponent1))
    ).toBeTruthy();
    expect(
      augmentedArchetype.mask.has(getComponentID(TestComponent2))
    ).toBeTruthy();
  });
  it("can be diminished", () => {
    const world = createWorld();

    const TestComponent1 = defineComponent({
      test: i8,
    });
    const TestComponent2 = defineComponent({
      test: i8,
    });

    const archetype = createArchetype(
      makeComponentsMask([TestComponent1, TestComponent2])
    );
    const diminishedArchetype = deriveArchetype(
      archetype,
      getComponentID(TestComponent2),
      world
    );

    expect(
      diminishedArchetype.mask.has(getComponentID(TestComponent1))
    ).toBeTruthy();
    expect(
      diminishedArchetype.mask.has(getComponentID(TestComponent2))
    ).toBeFalsy();
  });
  it("can cache augmented archetype", () => {
    const world = createWorld();

    const TestComponent1 = defineComponent({
      test: i8,
    });
    const TestComponent2 = defineComponent({
      test: i8,
    });

    const archetype = createArchetype(makeComponentsMask([TestComponent1]));

    const augmented = deriveArchetype(
      archetype,
      getComponentID(TestComponent2),
      world
    );

    expect(archetype.edge[getComponentID(TestComponent2)]).toBeTruthy();

    const augmentedCached = deriveArchetype(
      archetype,
      getComponentID(TestComponent2),
      world
    );
    expect(augmentedCached).toStrictEqual(augmented);
  });
  it("can cache diminished archetype", () => {
    const world = createWorld();

    const TestComponent1 = defineComponent({
      test: i8,
    });
    const TestComponent2 = defineComponent({
      test: i8,
    });

    const archetype = createArchetype(
      makeComponentsMask([TestComponent1, TestComponent2])
    );
    const diminished = deriveArchetype(
      archetype,
      getComponentID(TestComponent2),
      world
    );

    expect(archetype.edge[getComponentID(TestComponent2)]).toBeTruthy();

    const diminishedCached = deriveArchetype(
      archetype,
      getComponentID(TestComponent2),
      world
    );
    expect(diminishedCached).toStrictEqual(diminished);
  });
});
