// import type { Entity } from "aion-ecs";
// import { defineAction } from "./action.js";
// import { planify } from "./planify.js";
// import { defineWorldState } from "./state.js";

// const CanReach = defineWorldState("CanReach", (_: Entity, target: Entity) => {
//   if (target === 2) {
//     return [DoesNotExist, 3];
//   } else {
//     return true;
//   }
// });

// const IsAdjacentTo = defineWorldState("IsAdjacentTo", () => {
//   return false;
// });

// const DoesNotExist = defineWorldState("IsDead", () => {
//   return false;
// });

// defineAction({
//   effects: IsAdjacentTo,
//   preconditions: CanReach,
//   name: "MoveTo",
// });

// defineAction({
//   effects: DoesNotExist,
//   preconditions: IsAdjacentTo,
//   name: "Kill",
// });

// defineAction({
//   effects: CanReach,
//   preconditions: IsAdjacentTo,
//   name: "ClearWay",
// });

// const plan = planify(1, [DoesNotExist, 2]);
