import { expect, it, describe, beforeEach } from "vitest";
import {
  createEntity,
  removeEntity,
  createWorld,
  entityExists,
  insertEntity,
} from "../src/index.js";
import { cursor, resetIDCursor } from "../src/id.js";

describe("Entity", () => {
  beforeEach(() => {
    resetIDCursor();
  });

  it("can create a new entity", () => {
    const world = createWorld();
    const eid = createEntity(world);

    expect(eid).toStrictEqual(1);
  });

  it("can keep track of the entities count, starting from 1", () => {
    const world = createWorld();

    createEntity(world);
    createEntity(world);

    expect(createEntity(world)).toStrictEqual(3);
  });

  it("recycle deleted entities", () => {
    const world = createWorld();

    createEntity(world);

    const eidToRemove = createEntity(world);
    removeEntity(world, eidToRemove);

    const eid = createEntity(world);

    expect(eid).toStrictEqual(eidToRemove);
  });

  it("can verify an entity exists", () => {
    const world = createWorld();

    const eid = createEntity(world);

    expect(entityExists(world, eid)).toStrictEqual(true);
  });

  it("can remove an entity", () => {
    const world = createWorld();

    const eid = createEntity(world);
    removeEntity(world, eid);

    expect(entityExists(world, eid)).toStrictEqual(false);
  });

  it("throws an error when trying to remove a non existant entity", () => {
    const world = createWorld();
    expect(() => removeEntity(world, 1)).toThrow();
  });

  it("can insert an entity", () => {
    const world = createWorld();

    insertEntity(world, 1);

    expect(entityExists(world, 1)).toStrictEqual(true);
  });
});
