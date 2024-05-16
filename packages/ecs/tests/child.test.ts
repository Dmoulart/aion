import { expect, it, describe } from "vitest";
import { createWorld, hasComponent, initHierarchy } from "../src/index.js";
import { createEntity, entityExists, removeEntity } from "../src/entity.js";
import { attach, detach } from "../src/component.js";
import { ChildOf, getChildren, getParent } from "../src/child.js";

describe("Children", () => {
  it("can create children and remove it", () => {
    const world = createWorld();
    initHierarchy(world);

    const parent = createEntity(world);
    const child = createEntity(world);

    attach(world, ChildOf(parent), child);

    expect(hasComponent(world, ChildOf(parent), child)).toBeTruthy();

    expect(getChildren(parent)).toContain(child);
    expect(getParent(world, child)).toBe(parent);

    detach(world, ChildOf(parent), child);

    expect(hasComponent(world, ChildOf(parent), child)).toBeFalsy();

    expect(getChildren(parent)).not.toContain(child);
    expect(getParent(world, child)).not.toBe(parent);
  });

  it("can delete parent and children will automatically be removed", () => {
    const world = createWorld();
    initHierarchy(world);

    const parent = createEntity(world);
    const child = createEntity(world);

    attach(world, ChildOf(parent), child);

    removeEntity(world, parent);

    expect(entityExists(world, child)).toBeFalsy();

    expect(getChildren(parent)).not.toContain(child);
  });
});
