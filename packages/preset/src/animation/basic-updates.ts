import {
  getX,
  setX,
  getY,
  setY,
  getRotation,
  setRotation,
  getScaleX,
  setScaleX,
  getScaleY,
  setScaleY,
  type AnimationUpdate,
} from "../index.js";

export const BASIC_UPDATES = {
  x: { get: getX, set: setX },
  y: { get: getY, set: setY },
  rotation: { get: getRotation, set: setRotation },
  scaleX: { get: getScaleX, set: setScaleX },
  scaleY: { get: getScaleY, set: setScaleY },
} as const;

export function animate(
  config: Record<keyof typeof BASIC_UPDATES, number>,
): Record<string, AnimationUpdate> {
  const updates: Record<string, AnimationUpdate> = {};

  for (const key in config) {
    const update = {
      ...BASIC_UPDATES[key as keyof typeof BASIC_UPDATES],
    } as AnimationUpdate;

    update.value = config[key as keyof typeof BASIC_UPDATES];

    updates[key] = update;
  }
  return updates;
}
