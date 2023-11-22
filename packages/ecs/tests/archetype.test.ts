import "jest";
import {createArchetype, deriveArchetype} from "../src/archetype.js";
import {defineComponent, createWorld, makeMask, i8} from "../src/index.js";

describe("Archetype", () => {
  it("can be created without component", () => {
    expect(() => createArchetype()).not.toThrowError();
  });
  it("can be created with component", () => {
    const TestComponent = defineComponent({
      test: i8,
    });

    const archetype = createArchetype(makeMask(TestComponent.id));

    expect(archetype.mask.has(TestComponent.id)).toBeTruthy();
  });
  it("can be augmented", () => {
    const world = createWorld();

    const TestComponent1 = defineComponent({
      test: i8,
    });
    const TestComponent2 = defineComponent({
      test: i8,
    });

    const archetype = createArchetype(makeMask(TestComponent1.id));

    const augmentedArchetype = deriveArchetype(
      archetype,
      TestComponent2.id,
      world
    );

    expect(augmentedArchetype.mask.has(TestComponent1.id)).toBeTruthy();
    expect(augmentedArchetype.mask.has(TestComponent2.id)).toBeTruthy();
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
      makeMask(TestComponent1.id, TestComponent2.id)
    );
    const diminishedArchetype = deriveArchetype(
      archetype,
      TestComponent2.id,
      world
    );

    expect(diminishedArchetype.mask.has(TestComponent1.id)).toBeTruthy();
    expect(diminishedArchetype.mask.has(TestComponent2.id)).toBeFalsy();
  });
  it("can cache augmented archetype", () => {
    const world = createWorld();

    const TestComponent1 = defineComponent({
      test: i8,
    });
    const TestComponent2 = defineComponent({
      test: i8,
    });

    const archetype = createArchetype(makeMask(TestComponent1.id));

    const augmented = deriveArchetype(archetype, TestComponent2.id, world);

    expect(archetype.edge[TestComponent2.id]).toBeTruthy();

    const augmentedCached = deriveArchetype(
      archetype,
      TestComponent2.id,
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
      makeMask(TestComponent1.id, TestComponent2.id)
    );
    const diminished = deriveArchetype(archetype, TestComponent2.id, world);

    expect(archetype.edge[TestComponent2.id]).toBeTruthy();

    const diminishedCached = deriveArchetype(
      archetype,
      TestComponent2.id,
      world
    );
    expect(diminishedCached).toStrictEqual(diminished);
  });
});
