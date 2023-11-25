import {expect, it, describe} from "vitest";
import {
  addQuery,
  createWorld,
  attach,
  detach,
  defineComponent,
  createEntity,
  onEnterQuery,
  onExitQuery,
  AlreadyRegisteredQueryError,
  removeQuery,
  RemoveQueryError,
  all,
  any,
  i32,
  i8,
  type Entity,
  runQuery,
  defineQuery,
  not,
  none,
  createQuery,
} from "../src/index.js";

describe("Query", () => {
  it("can be created ", () => {
    expect(() => defineQuery()).not.toThrowError();
  });
  it("can query complete sets of components", () => {
    const world = createWorld();

    const TestComponent = defineComponent({
      test: i8,
    });
    const TestComponent2 = defineComponent({
      test: i32,
    });

    const eid = createEntity(world);
    attach(world, TestComponent, eid);
    attach(world, TestComponent2, eid);

    const eid2 = createEntity(world);
    attach(world, TestComponent, eid2);

    const queryA = defineQuery(all(TestComponent, TestComponent2));
    expect(queryA(world).archetypes.length).toStrictEqual(1);

    const queryB = defineQuery(all(TestComponent));
    expect(queryB(world).archetypes.length).toStrictEqual(2);
  });
  it("can query some components", () => {
    const world = createWorld();

    const TestComponent = defineComponent({
      test: i8,
    });
    const TestComponent2 = defineComponent({
      test: i32,
    });

    const eid = createEntity(world);
    attach(world, TestComponent, eid);
    attach(world, TestComponent2, eid);

    const eid2 = createEntity(world);
    attach(world, TestComponent, eid2);

    const queryA = defineQuery(any(TestComponent, TestComponent2));
    expect(queryA(world).archetypes.length).toStrictEqual(2);

    const queryB = defineQuery(any(TestComponent));
    expect(queryB(world).archetypes.length).toStrictEqual(2);
  });
  it("can exclude some components from query", () => {
    const world = createWorld();

    const TestComponent = defineComponent({
      test: i8,
    });
    const TestComponent2 = defineComponent({
      test: i32,
    });

    const eid = createEntity(world);
    attach(world, TestComponent, eid);
    attach(world, TestComponent2, eid);

    const eid2 = createEntity(world);
    attach(world, TestComponent, eid2);

    const query = defineQuery(any(TestComponent), not(TestComponent2));

    expect(query(world).archetypes.length).toStrictEqual(1);
  });
  it("can exclude group of components from query", () => {
    const world = createWorld();

    const TestComponent = defineComponent({
      test: i8,
    });
    const TestComponent2 = defineComponent({
      test: i32,
    });
    const TestComponent3 = defineComponent({
      test: i32,
    });

    const eid = createEntity(world);
    attach(world, TestComponent, eid);
    attach(world, TestComponent2, eid);
    attach(world, TestComponent3, eid);

    const eid2 = createEntity(world);
    attach(world, TestComponent, eid2);
    attach(world, TestComponent2, eid);

    const query = defineQuery(
      any(TestComponent),
      none(TestComponent2, TestComponent3)
    );
    expect(query(world).archetypes.length).toStrictEqual(2);
  });
  it("can be added to world and update automatically", () => {
    const world = createWorld();

    const TestComponent = defineComponent({
      test: i8,
    });
    const TestComponent2 = defineComponent({
      test: i32,
    });

    const eid = createEntity(world);
    attach(world, TestComponent2, eid);

    const query = createQuery(any(TestComponent, TestComponent2));

    addQuery(world, query);

    expect(query.archetypes.length).toStrictEqual(1);
    expect(query.archetypes[0]!.entities.count()).toStrictEqual(1);

    const eid2 = createEntity(world);
    attach(world, TestComponent, eid2);

    expect(query.archetypes.length).toStrictEqual(2);
    expect(query.archetypes[1]!.entities.count()).toStrictEqual(1);

    detach(world, TestComponent, eid2);
    expect(query.archetypes[1]!.entities.count()).toStrictEqual(0);
  });
  it("can track whenever entities enter the query", () => {
    const world = createWorld();

    const TestComponent = defineComponent({
      test: i8,
    });
    const TestComponent2 = defineComponent({
      test: i32,
    });

    const query = createQuery(all(TestComponent, TestComponent2));
    addQuery(world, query);

    let added = 0;

    const onEnter = onEnterQuery(query);
    onEnter((entity) => {
      added++;
    });

    const eid = createEntity(world);

    attach(world, TestComponent, eid);
    expect(added).toStrictEqual(0);

    attach(world, TestComponent2, eid);
    expect(added).toStrictEqual(1);
  });
  it("can track whenever entities exit the query", () => {
    const world = createWorld();

    const TestComponent = defineComponent({
      test: i8,
    });
    const TestComponent2 = defineComponent({
      test: i32,
    });

    const query = createQuery(all(TestComponent, TestComponent2));
    addQuery(world, query);

    const eid = createEntity(world);

    attach(world, TestComponent, eid);
    attach(world, TestComponent2, eid);

    let removed = 0;

    const onExit = onExitQuery(query);
    onExit(() => {
      removed++;
    });

    expect(removed).toStrictEqual(0);

    detach(world, TestComponent2, eid);
    expect(removed).toStrictEqual(1);
  });
  it("can track whenever entities enter the query even if handlers have been defined before the query has been registered", () => {
    const world = createWorld();

    const TestComponent = defineComponent({
      test: i8,
    });
    const TestComponent2 = defineComponent({
      test: i32,
    });

    const query = createQuery(all(TestComponent, TestComponent2));

    let added = 0;

    const onEnter = onEnterQuery(query);
    onEnter(() => {
      added++;
    });

    const eid = createEntity(world);
    addQuery(world, query);

    attach(world, TestComponent, eid);
    expect(added).toStrictEqual(0);

    attach(world, TestComponent2, eid);
    expect(added).toStrictEqual(1);
  });
  it("can track whenever entities exit the query even if handlers have been defined before the query has been registered", () => {
    const world = createWorld();

    const TestComponent = defineComponent({
      test: i8,
    });
    const TestComponent2 = defineComponent({
      test: i32,
    });

    const query = createQuery(all(TestComponent, TestComponent2));

    const eid = createEntity(world);

    attach(world, TestComponent, eid);
    attach(world, TestComponent2, eid);

    let removed = 0;

    const onExit = onExitQuery(query);

    onExit(() => {
      removed++;
    });

    addQuery(world, query);
    console.log(query.archetypes);

    expect(query.archetypes[0]!.entities.count() === 1);

    expect(removed).toStrictEqual(0);

    detach(world, TestComponent2, eid);

    expect(query.archetypes[0]!.entities.count() === 0);
    expect(removed).toStrictEqual(1);
  });
  it("can cannot be registered to multiple worlds", () => {
    const worldA = createWorld();
    const worldB = createWorld();

    const TestComponent = defineComponent({
      test: i8,
    });
    const TestComponent2 = defineComponent({
      test: i32,
    });

    const query = createQuery(all(TestComponent, TestComponent2));
    addQuery(worldA, query);

    expect(() => addQuery(worldB, query)).toThrowError(
      AlreadyRegisteredQueryError
    );
  });
  it("can be removed", () => {
    const world = createWorld();

    const TestComponent = defineComponent({
      test: i8,
    });

    const query = createQuery(all(TestComponent));
    addQuery(world, query);
    removeQuery(world, query);

    expect(world.queries).not.toContain(query);
  });
  it("throw an error when trying to remove a query from the wrong world", () => {
    const world = createWorld();
    const worldB = createWorld();

    const TestComponent = defineComponent({
      test: i8,
    });

    const query = createQuery(all(TestComponent));
    addQuery(world, query);

    expect(() => removeQuery(worldB, query)).toThrowError(RemoveQueryError);
  });
  it("clears its query handlers when query is removed from world", () => {
    const world = createWorld();

    const TestComponent = defineComponent({
      test: i8,
    });

    const query = createQuery(all(TestComponent));
    addQuery(world, query);

    const onEnter = onEnterQuery(query);
    const enterHandler = () => {};
    onEnter(enterHandler);

    const onExit = onExitQuery(query);
    const exitHandler = () => {};
    onExit(exitHandler);

    const eid = createEntity(world);
    attach(world, TestComponent, eid);

    removeQuery(world, query);

    const arch = world.entitiesArchetypes[eid]!;

    expect(
      world.handlers.enter[arch.id]!.find((fn) => fn === enterHandler)
    ).toBeFalsy();
    expect(
      world.handlers.exit[arch.id]!.find((fn) => fn === exitHandler)
    ).toBeFalsy();
  });
  // it("api", () => {
  //   const world = createWorld();

  //   const TestComponent = defineComponent({
  //     test: i8,
  //   });
  //   const TestComponent2 = defineComponent({
  //     test: i32,
  //   });

  //   const query = all(TestComponent).any(TestComponent2);
  //   addQuery(world, query);
  // });
});
