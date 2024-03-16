import { beginPath, getContext2D, lineTo, stroke } from "aion-render";
import { SCALE_FACTOR } from "./bindings.js";
import { usePhysics } from "./init.js";
import type { Entity } from "aion-ecs";
import { Transform } from "../components.js";
import { postDraw, preDraw } from "../index.js";

export function debugRender(camera: Entity) {
  const { world } = usePhysics();
  const buffers = world.debugRender();

  const ctx = getContext2D();

  preDraw(ctx, Transform[camera]!);

  for (let i = 0; i < buffers.vertices.length; i += 4) {
    beginPath();

    const x1 = buffers.vertices[i]!;
    const y1 = buffers.vertices[i + 1]!;

    lineTo(x1 * SCALE_FACTOR, y1 * SCALE_FACTOR);

    const x2 = buffers.vertices[i + 2]!;
    const y2 = buffers.vertices[i + 3]!;

    lineTo(x2 * SCALE_FACTOR, y2 * SCALE_FACTOR);

    stroke("pink");
  }

  postDraw(ctx);
}
