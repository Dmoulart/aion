import { defineCollisionGroup } from "aion-preset";

const ENEMY_COLLISION_ID = 0b01;
const OBSTACLE_COLLISION_ID = 0b10;

export const OBSTACLE_COLLISION_GROUP = defineCollisionGroup()
  .isPartOfGroups(OBSTACLE_COLLISION_ID)
  .canInteractWith(OBSTACLE_COLLISION_ID, ENEMY_COLLISION_ID)
  .get();

export const ENEMY_COLLISION_GROUP = defineCollisionGroup()
  .isPartOfGroups(ENEMY_COLLISION_ID)
  .canInteractWith(OBSTACLE_COLLISION_ID)
  .get();
