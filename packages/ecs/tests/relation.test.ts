import {expect, it, describe} from "vitest";
import {
  any,
  attach,
  createEntity,
  createWorld,
  defineRelation,
  detach,
  hasComponent,
} from "../src/index.js";

describe("Relation", () => {
  it("can be created", () => {
    expect(() => defineRelation(10_00)).not.toThrowError();
  });
  it("can be used in queries", () => {
    const world = createWorld(10_000);
    const Likes = defineRelation(10_000);
    const dave = createEntity(world);
    const computer = createEntity(world);

    attach(world, Likes(computer), dave);

    expect(any(Likes(computer)).from(world).length === 1);
    expect(hasComponent(world, Likes(computer), dave));

    detach(world, Likes(computer), dave);
    expect(!hasComponent(world, Likes(computer), dave));
  });
  it("Same relations are same components", () => {
    const world = createWorld(10_000);
    const Likes = defineRelation(10_000);

    const computer = createEntity(world);

    expect(Likes(computer) === Likes(computer));
  });
  it("Can use wildcard", () => {
    const world = createWorld(10_000);
    const Likes = defineRelation(10_000);

    const computer = createEntity(world);
    const icecreams = createEntity(world);

    const dave = createEntity(world);
    const kevin = createEntity(world);

    attach(world, Likes(computer), dave);
    attach(world, Likes(icecreams), kevin);

    expect(any(...Likes("*")).from(world).length === 2);
  });
  // it("Can be inserted into prefabs", () => {
  //   const world = createWorld(10_000);
  //   const Likes = defineRelation(10_000);

  //   const liker = prefab(world, {likes : Likes});

  //   const computer = createEntity(world);
  //   const icecreams = createEntity(world);

  //   const dave = createEntity(world);
  //   const kevin = createEntity(world);

  //   attach(Likes(computer), dave, world);
  //   attach(Likes(icecreams), kevin, world);

  //   expect(any(...Likes("*")).from(world).length === 2);
  // });
});
