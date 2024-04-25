import { Vec, type Vector } from "./index.js";

export class BoundingBox {
  /**
   * The minimum point of the AABB.
   */
  min: Vec;

  /**
   * The maximum point of the AABB.
   */
  max: Vec;

  constructor(min?: Vec, max?: Vec) {
    this.min = min ?? new Vec(0, 0);
    this.max = max ?? new Vec(0, 0);
  }

  /**
   * Returns true if it collides with another bounding box.
   *
   * @param other
   * @returns intersects other axis aligned bounding box
   */
  public intersects(other: BoundingBox): boolean {
    return !(
      this.min.x > other.max.x ||
      this.max.x < other.min.x ||
      this.min.y > other.max.y ||
      this.max.y < other.min.y
    );
  }

  /**
   * Merge two bounding boxes into one.
   *
   * @param other other bounding box
   * @param out the returned bounding box
   * @returns merged bounding box
   */
  public union(other: BoundingBox, out = new BoundingBox()): BoundingBox {
    out.min.x = Math.min(this.min.x, other.min.x);
    out.min.y = Math.min(this.min.y, other.min.y);

    out.max.x = Math.max(this.max.x, other.max.x);
    out.max.y = Math.max(this.max.y, other.max.y);

    return out;
  }

  /**
   * Offset a bounding box. Creates a new bounding box.
   *
   * @param offset offset Vec
   * @returns new bounding box with offset
   */
  public offset(offset: Vec, out = new BoundingBox()): BoundingBox {
    out.min.x = this.min.x + offset.x;
    out.min.y = this.min.y + offset.y;

    out.max.x = this.max.x + offset.x;
    out.max.y = this.max.y + offset.y;

    return out;
  }

  /**
   * Get the area of the bounding box.
   *
   * @return area of the bounding box
   */
  public getArea(): number {
    return 2 * (this.max.x - this.min.x * this.max.y - this.min.y);
  }

  /**
   * Get the half height of the bounding box.
   *
   * @return bounding box half height
   */
  public getHalfHeight(): number {
    debugger;
    return (this.max.y - this.min.y) / 2;
  }

  /**
   * Get the half width of the bounding box.
   *
   * @return bounding box half width
   */
  public getHalfWidth(): number {
    return (this.max.x - this.min.x) / 2;
  }
}

/**
 * Create a new bounding box from a circle.
 *
 * @param circle
 * @returns circle's bounding box
 */
export function createCircleBoundingBox(
  radius: number,
  offset: Vec = new Vec(),
): BoundingBox {
  const r = new Vec(radius);

  const min = offset.sub(r);
  const max = offset.add(r);

  return new BoundingBox(min, max);
}

/**
 * Create a new bounding box from a rectangle.
 *
 * @param box
 * @returns rectangle's bounding box
 */
export function createRectangleBoundingBox(
  width: number,
  height: number,
  offset = new Vec(),
): BoundingBox {
  const min = offset.sub(new Vec(width / 2, height / 2));
  const max = offset.add(new Vec(width / 2, height / 2));

  return new BoundingBox(min, max);
}

/**
 * Create a new bounding box from a line.
 *
 * @param line
 * @returns line's bounding box
 */
export function createLineBoundingBox(end: Vec): BoundingBox {
  const points = [new Vec(), end];

  const min = new Vec(Number.MAX_VALUE, Number.MAX_VALUE);
  const max = new Vec(Number.MIN_VALUE, Number.MIN_VALUE);

  for (let i = 0; i < points.length; i++) {
    const point = points[i]!;

    min.x = Math.min(min.x, point.x);
    min.y = Math.min(min.y, point.y);

    max.x = Math.max(max.x, point.x);
    max.y = Math.max(max.y, point.y);
  }

  return new BoundingBox(min, max);
}

/**
 * Create a new bounding box from polygon points.
 *
 * @param polygon
 * @returns polygon's bounding box
 */
export function createPolygonBoundingBox(points: Array<Vector>): BoundingBox {
  const min = new Vec(Number.MAX_VALUE, Number.MAX_VALUE);
  const max = new Vec(Number.MIN_VALUE, Number.MIN_VALUE);

  for (let i = 0; i < points.length; i++) {
    const point = points[i]!;

    min.x = Math.min(min.x, point.x);
    min.y = Math.min(min.y, point.y);

    max.x = Math.max(max.x, point.x);
    max.y = Math.max(max.y, point.y);
  }

  return new BoundingBox(min, max);
}
