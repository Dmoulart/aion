import { defineCollisionGroup } from "aion-preset";

export const ENEMY_COLLISION_MEMBERSHIP_ID = 0b01;
export const OBSTACLE_COLLISION_MEMBERSHIP_ID = 0b10;

export const OBSTACLE_COLLISION_GROUP = defineCollisionGroup()
  .isPartOfGroups(OBSTACLE_COLLISION_MEMBERSHIP_ID)
  .canInteractWith(
    OBSTACLE_COLLISION_MEMBERSHIP_ID,
    ENEMY_COLLISION_MEMBERSHIP_ID,
  )
  .get();

export const ENEMY_COLLISION_GROUP = defineCollisionGroup()
  .isPartOfGroups(ENEMY_COLLISION_MEMBERSHIP_ID)
  .canInteractWith(OBSTACLE_COLLISION_MEMBERSHIP_ID)
  .get();

export const TURRET_COLLISION_GROUP = defineCollisionGroup()
  .isPartOfGroups(OBSTACLE_COLLISION_MEMBERSHIP_ID)
  .canInteractWith(ENEMY_COLLISION_MEMBERSHIP_ID)
  .get();
