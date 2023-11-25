import {expect, it, describe} from "vitest";
import {
  defineComponent,
  f32,
  addQuery,
  createWorld,
  prefab,
  u8,
  defineQuery,
  all,
  runQuery,
  createQuery,
} from "../src/index.js";

describe("Prefab", () => {
  it("can be created", () => {
    const Position = defineComponent({
      x: f32,
      y: f32,
    });

    const Velocity = defineComponent({
      x: f32,
      y: f32,
    });

    const world = createWorld();

    const actor = prefab(world, {Position, Velocity});

    const ent = actor({
      Position: {
        x: 10,
        y: 10,
      },
      Velocity: {
        x: 10,
        y: 10,
      },
    });

    expect(
      Position.x[ent] === 10 &&
        Position.y[ent] === 10 &&
        Velocity.x[ent] === 10 &&
        Velocity.y[ent] === 10
    ).toBeTruthy();
  });
  it("can be queried", () => {
    const Position = defineComponent({
      x: f32,
      y: f32,
    });
    const Velocity = defineComponent({
      x: f32,
      y: f32,
    });

    const world = createWorld();
    const actor = prefab(world, {Position, Velocity});

    actor({
      Position: {
        x: 1,
        y: 1,
      },
      Velocity: {
        x: 1,
        y: 1,
      },
    });

    const query = createQuery(all(Position, Velocity));
    const archetypes = runQuery(world, query);

    expect(archetypes.length === 1).toBeTruthy();
    expect(archetypes[0]!.entities.count() === 1).toBeTruthy();
  });
  it("can register to existing query", () => {
    const Position = defineComponent({
      x: f32,
      y: f32,
    });
    const Stats = defineComponent({
      strength: u8,
      intelligence: u8,
    });

    const world = createWorld();
    const query = createQuery(all(Position, Stats));
    addQuery(world, query);

    const actor = prefab(world, {Position, Stats});
    actor({
      Position: {x: 10, y: 10},
      Stats: {strength: 10, intelligence: 10},
    });

    expect(query.archetypes.length === 1).toBeTruthy();
    expect(query.archetypes[0]!.entities.count() === 1).toBeTruthy();
  });
  it("can create prefab with defaults", () => {
    const Position = defineComponent({
      x: f32,
      y: f32,
    });
    const Stats = defineComponent({
      strength: u8,
      intelligence: u8,
    });

    const world = createWorld();
    const query = createQuery(all(Position, Stats));
    addQuery(world, query);

    const actor = prefab(
      world,
      {Position, Stats},
      {
        Position: {
          x: 100,
          y: 200,
        },
        Stats: {
          intelligence: 20,
          strength: 10,
        },
      }
    );
    const e = actor({
      Stats: {strength: 5},
    });

    expect(Position.x[e] === 100);
    expect(Position.y[e] === 200);

    expect(Stats.intelligence[e] === 20);
    expect(Stats.strength[e] === 5);
  });
});
