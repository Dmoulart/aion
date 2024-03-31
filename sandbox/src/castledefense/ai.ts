import { defineGoal } from "aion-preset";
import { useGame } from "../castle-defense";
import { Entity } from "aion-ecs";

const Destroy = (e: Entity) =>
  defineGoal(() => {
    const {
      $ecs: { exists },
    } = useGame();

    return !exists(e);
  });
