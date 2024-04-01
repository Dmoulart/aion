import type { Entity } from "aion-ecs";
import { expect, it, describe } from "vitest";
import { defineWorldState, defineAction, planify } from "../src/ai/index.js";

describe("AI", () => {
  it(() => {
    const CanReach = defineWorldState(
      "CanReach",
      (_: Entity, target: Entity) => {
        if (target === 2) {
          return [DoesNotExist, 3];
        } else {
          return true;
        }
      },
    );

    const IsAdjacentTo = defineWorldState("IsAdjacentTo", () => {
      return false;
    });

    const DoesNotExist = defineWorldState("IsDead", () => {
      return false;
    });

    defineAction({
      effects: IsAdjacentTo,
      preconditions: CanReach,
      name: "MoveTo",
    });

    defineAction({
      effects: DoesNotExist,
      preconditions: IsAdjacentTo,
      name: "Kill",
    });

    const plan = planify(1, [DoesNotExist, 2]);

    const [a, b, c, d] = plan;

    expect(a!.action.name === "MoveTo" && a!.target === 3);
    expect(b!.action.name === "Kill" && b!.target === 3);
    expect(c!.action.name === "MoveTo" && b!.target === 2);
    expect(d!.action.name === "Kill" && b!.target === 3);
  });
});
