import {expect, it, describe} from "vitest";
import {
  any,
  attach,
  createEntity,
  createWorld,
  defineQuery,
  defineRelation,
  detach,
  hasComponent,
  runQuery,
} from "../src/index.js";
import {i32} from "../dist/types.js";

describe("Relation", () => {
  it("can be created", () => {
    expect(() => defineRelation()).not.toThrowError();
  });
  it("can be used in queries", () => {
    const world = createWorld(10_000);
    const Likes = defineRelation();

    const dave = createEntity(world);
    const computer = createEntity(world);

    attach(world, Likes(computer), dave);

    const query = defineQuery(any(Likes(computer)));

    expect(runQuery(world, query).length === 1);
    expect(hasComponent(world, Likes(computer), dave));

    detach(world, Likes(computer), dave);
    expect(!hasComponent(world, Likes(computer), dave));
  });
  it("Same relations are same components", () => {
    const world = createWorld(10_000);
    const Likes = defineRelation();

    const computer = createEntity(world);

    expect(Likes(computer) === Likes(computer));
  });
  it("Can use wildcard", () => {
    const world = createWorld(10_000);
    const Likes = defineRelation();

    const computer = createEntity(world);
    const icecreams = createEntity(world);

    const dave = createEntity(world);
    const kevin = createEntity(world);

    attach(world, Likes(computer), dave);
    attach(world, Likes(icecreams), kevin);

    const query = defineQuery(any(...Likes("*")));

    expect(runQuery(world, query).length === 2);
  });
  it("Can define relations with schema", () => {
    const world = createWorld(10_000);

    const Vehicle = defineRelation({
      speed: i32,
    });

    const Boat = createEntity(world);
    const Car = createEntity(world);

    expect("speed" in Vehicle(Boat));
    expect("speed" in Vehicle(Car));
  });
  it("must cache relations components", () => {
    const world = createWorld(10_000);

    const Vehicle = defineRelation({
      speed: i32,
    });

    const Car = createEntity(world);

    const e = createEntity(world);

    attach(world, Vehicle(Car), e);

    const carsA = Vehicle(Car);
    const carsB = Vehicle(Car);

    expect(carsA === carsB && "speed" in carsA);
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
