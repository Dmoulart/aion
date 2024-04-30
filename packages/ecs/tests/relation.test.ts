import { expect, it, describe } from "vitest";
import {
  addQuery,
  all,
  any,
  attach,
  createEntity,
  createQuery,
  createWorld,
  defineRelation,
  detach,
  hasComponent,
  i32,
  removeEntity,
  runQuery,
} from "../src/index.js";

describe("Relation", () => {
  it("can be used in queries", () => {
    const world = createWorld(10_000);
    const Likes = defineRelation();

    const dave = createEntity(world);
    const computer = createEntity(world);

    attach(world, Likes(computer), dave);

    const query = createQuery(any(Likes(computer)));

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

    const query = createQuery(any(...(Likes("*") as any)));

    expect(runQuery(world, query).length === 2);
  });

  it.skip("Can define relations with schema", () => {
    const world = createWorld(10_000);

    const Vehicle = defineRelation({
      speed: i32,
    });

    const Boat = createEntity(world);
    const Car = createEntity(world);

    expect("speed" in Vehicle(Boat));
    expect("speed" in Vehicle(Car));
  });

  it.skip("must cache relations components", () => {
    const world = createWorld(10_000);

    const Vehicle = defineRelation({
      speed: i32,
    });

    const Car = createEntity(world);

    const ent = createEntity(world);

    attach(world, Vehicle(Car), ent);

    const carsA = Vehicle(Car);
    const carsB = Vehicle(Car);

    expect(carsA === carsB && "speed" in carsA);
  });
  it("can add children", () => {
    const world = createWorld(100);

    const ChildOf = defineRelation();

    const parent = createEntity(world);
    const child = createEntity(world);

    attach(world, ChildOf(parent), child);

    const query = createQuery(all(ChildOf(parent)));

    addQuery(world, query);

    expect(query.first() === child);

    removeEntity(world, child);

    expect(query.first() === 0);

    const child2 = createEntity(world);

    attach(world, ChildOf(parent), child2);

    expect(query.first() === child2);

    const allChildrenQuery = createQuery(all(...ChildOf("*")));

    addQuery(world, allChildrenQuery);

    let hasNewChild = false;

    allChildrenQuery.each((ent) => {
      if (ent === child2) {
        hasNewChild = true;
      }
    });

    expect(hasNewChild);
  });
  it("can automatically remove children", () => {
    const world = createWorld(100);

    const ChildOf = defineRelation();

    const parent = createEntity(world);
    const child = createEntity(world);

    attach(world, ChildOf(parent), child);

    console.log(ChildOf(parent));
    console.log(hasComponent(world, ChildOf(parent), child));
    const query = createQuery(all(ChildOf(parent)));

    addQuery(world, query);

    expect(query.first() === 1);

    removeEntity(world, parent);
    console.log(hasComponent(world, ChildOf(parent), child));
    console.log(query.archetypes[0]?.entities.dense);
    console.log(query.first());

    expect(query.first() === 0);
  });
});
