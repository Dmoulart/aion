import {expect, it, describe} from "vitest";
import {createArchetype, deriveArchetype} from "../src/archetype.js";
import {
  defineComponent,
  createWorld,
  i8,
  makeComponentsMask,
  $cid,
} from "../src/index.js";

describe("Archetype", () => {
  it("can be created without component", () => {
    expect(() => createArchetype()).not.toThrowError();
  });
  it("can be created with component", () => {
    const TestComponent = defineComponent({
      test: i8,
    });

    const archetype = createArchetype(makeComponentsMask([TestComponent]));

    expect(archetype.mask.has(TestComponent[$cid])).toBeTruthy();
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
      TestComponent2[$cid],
      world
    );

    expect(augmentedArchetype.mask.has(TestComponent1[$cid])).toBeTruthy();
    expect(augmentedArchetype.mask.has(TestComponent2[$cid])).toBeTruthy();
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
      TestComponent2[$cid],
      world
    );

    expect(diminishedArchetype.mask.has(TestComponent1[$cid])).toBeTruthy();
    expect(diminishedArchetype.mask.has(TestComponent2[$cid])).toBeFalsy();
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

    const augmented = deriveArchetype(archetype, TestComponent2[$cid], world);

    expect(archetype.edge[TestComponent2[$cid]]).toBeTruthy();

    const augmentedCached = deriveArchetype(
      archetype,
      TestComponent2[$cid],
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
    const diminished = deriveArchetype(archetype, TestComponent2[$cid], world);

    expect(archetype.edge[TestComponent2[$cid]]).toBeTruthy();

    const diminishedCached = deriveArchetype(
      archetype,
      TestComponent2[$cid],
      world
    );
    expect(diminishedCached).toStrictEqual(diminished);
  });
});
