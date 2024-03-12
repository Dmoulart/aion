export function initPrefabs() {
  const createRect = $ecs.prefab({ Position, Rect, Stroke, Fill });

  const createCircle = $ecs.prefab({ Position, Circle, Stroke, Fill });
}
