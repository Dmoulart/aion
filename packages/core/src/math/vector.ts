export interface Vector {
  x: number;
  y: number;
}

export class Vec implements Vector {
  constructor(
    public x = 0,
    public y = x,
  ) {}

  /**
   * Multiply the two axes of a vector by a given number.
   *
   * @param size
   * @returns scaled vector
   */
  scale(x: number, y = x): Vec {
    return new Vec(this.x * x, this.y * y);
  }

  /**
   * Multiply this vector by another vector.
   * Warning: this vector is modified in place.
   *
   * @param size
   * @returns scaled vector
   */
  scaleEq(x: number, y = x): Vec {
    this.x *= x;
    this.y *= y;
    return this;
  }

  /**
   * Substract two vectors together and returns the resulting vector.
   *
   * @param vector
   * @returns difference vector
   */
  sub(vector: Vector): Vec {
    return new Vec(this.x - vector.x, this.y - vector.y);
  }

  /**
   * Substract another vector with this one and return this one for chaining.
   * Warning: this vector is modified in place.
   *
   * @param vector
   * @returns this vector
   */
  subEq(vector: Vector): this {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  /**
   * Add two vectors together and returns the resulting vector.
   *
   * @param vector
   * @returns sum vector
   */
  add(vector: Vector): Vec {
    return new Vec(this.x + vector.x, this.y + vector.y);
  }

  /**
   * Add another vector to this one and return this one for chaining.
   * Warning: this vector is modified in place.
   *
   * @param vector
   * @returns this vector
   */
  addEq(vector: Vector): this {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  /**
   * Divide two vectors together and returns the resulting vector.
   *
   * @param vector
   * @returns divided vector
   */
  div(vector: Vector): Vec {
    return new Vec(this.x / vector.x, this.y / vector.y);
  }

  /**
   * Divide another vector with this one and return this one for chaining.
   * Warning: this vector is modified in place.
   *
   * @param vector
   * @returns this vector
   */
  divEq(vector: Vector): this {
    this.x /= vector.x;
    this.y /= vector.y;
    return this;
  }

  /**
   * Returns a vector that is equal to the vector multiplied by -1.
   *
   * @returns negative vector
   */
  negate(): Vec {
    return this.scale(-1);
  }

  /**
   * Make this vector negative.
   * Warning: this vector is modified in place.
   *
   * @returns this vector
   */
  negateEq(): this {
    this.x *= -1;
    this.y *= -1;
    return this;
  }

  /**
   * Returns a vector that is equal to the vector multiplied by the other vector.
   *
   * @param vector
   * @returns multiplicated vector
   */
  mult(vector: Vector): Vec {
    return new Vec(this.x * vector.x, this.y * vector.y);
  }

  /**
   * Multiply this vector by another one.
   * Warning: this vector is modified in place.
   *
   * @returns this vector
   */
  multEq(vector: Vector): this {
    this.x *= vector.x;
    this.y *= vector.y;
    return this;
  }

  /**
   * Returns the dot product of a vector resulting from the multiplication of two vectors together,
   * and the some of their axes.
   *
   * @param vector
   * @returns dot product
   */
  dot(vector: Vector): number {
    return this.x * vector.x + this.y * vector.y;
  }

  /**
   * Returns the normal of the vector. The normal is also known as the unit vector. It is a vector of
   * size 1, pointing in the same direction as the original vector.
   *
   * @returns normal
   */
  norm(): Vec {
    const mag = this.mag();
    if (mag > 0) {
      return new Vec(this.x / mag, this.y / mag);
    } else {
      return new Vec(0, 1);
    }
  }

  /**
   * Normalize this vector.
   * Warning: this vector is modified in place.
   *
   * @returns this vector
   */
  normEq(): this {
    const mag = this.mag();
    if (mag > 0) {
      this.x /= mag;
      this.y /= mag;
      return this;
    } else {
      this.x = 0;
      this.y = 1;
      return this;
    }
  }

  /**
   * Returns the magnitude or the length of the vector.
   *
   * @returns magnitude
   */
  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Returns the distance between two vectors.
   *
   * @returns this
   */
  dist(vector: Vector): number {
    return Math.sqrt(
      (vector.x - this.x) * (vector.x - this.x) +
        (vector.y - this.y) * (vector.y - this.y),
    );
  }

  /**
   * Return a vector that is perpendicular to itself.
   *
   * @returns this
   */
  perp(): Vec {
    return new Vec(-this.y, this.x);
  }

  /**
   * Make this vector perendicular to itself.
   *
   * @returns this
   */
  perpEq(): this {
    const temp = this.x;
    this.x = -this.y;
    this.y = temp;
    return this;
  }

  /**
   * Returns true if two vectors have the same x and y values.
   *
   * @param vector
   * @returns vector are equals
   */
  equals(vector: Vector): boolean {
    return this.x === vector.x && this.y === vector.y;
  }

  /**
   * Apply the values of the given vector to this vector.
   *
   * @param vector
   * @returns this vector
   */
  copy(vector: Vector): this {
    this.x = vector.x;
    this.y = vector.y;
    return this;
  }

  /**
   * Set the x and y values of this vector.
   * The vector is modified in place.
   *
   * @param x
   * @param y
   * @returns this vector
   */
  set(x: number, y: number = x): this {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Return a new vector with rounded x and y values.
   *
   * @returns rounded vector
   */
  round(): Vec {
    return new Vec(Math.round(this.x), Math.round(this.y));
  }

  /**
   * Clone the vector instance.
   *
   * @param vector
   * @returns cloned vector
   */
  clone(): Vec {
    return new Vec(this.x, this.y);
  }

  /**
   * Interpolate this vector with another vector and return it.
   * The vector is modified in place.
   *
   * @param vector
   * @param amount
   * @returns this vector
   */
  lerpEq(vector: Vector, amount: number): this {
    this.x += (vector.x - this.x) * amount;
    this.y += (vector.y - this.y) * amount;
    return this;
  }

  /**
   * Create a linear interpolation between two vectors and return the resulting vector.
   *
   * @param vector
   * @param amount
   * @returns new interpolated vector
   */
  lerp(vector: Vec, amount: number): Vec {
    return this.add(vector.sub(this).scale(amount));
  }

  /**
   * Limit the magnitude of the vector to the specified amount.
   * @param amount
   * @returns new vector
   */
  limit(amount: number): Vec {
    if (this.x > amount || this.y > amount) {
      return this.norm().scale(amount);
    }
    return this;
  }

  /**
   * Create a vector from an object with a x and y properties.
   *
   * @param object
   * @returns new vector
   */
  fromAlike(vector: { x: number; y: number }): Vec {
    return new Vec(vector.x, vector.y);
  }

  /**
   * Assign x and y properties to this vector from an object with a x and y properties.
   * Warning: this vector is modified in place.
   *
   * @param object
   * @returns this vector
   */
  assign(vector: { x: number; y: number }): this {
    return this.set(vector.x, vector.y);
  }

  /**
   * Returns true if all the vectors components equal to zero.
   *
   * @returns vector equal to zero
   */
  isZero(): boolean {
    return this.equals(origin);
  }

  /**
   * Returns a string representation of this vector.
   */
  toString(): string {
    return `vec(${this.x}, ${this.y})`;
  }
}

/**
 * Create a new vector. Alias function for instanciating vectors.
 *
 * @param x
 * @param y
 * @returns vector
 */
export function vec(xOrVec: number | Vector = 0, y = xOrVec): Vec {
  if (typeof xOrVec === "object") {
    return new Vec(xOrVec.x, xOrVec.y);
  }
  return new Vec(xOrVec, y as number);
}

/**
 * Return a vector of value zero, representing the origin of the coordinate system.
 */
export function zero(): Vec {
  return new Vec(0, 0);
}

export const origin = Object.freeze(zero());

/**
 * Return a vector pointing to the up direction.
 */
export function upDirection(): Vec {
  return new Vec(0, -1);
}

/**
 * Return a vector pointing to up the left direction.
 */
export function upLeftDirection(): Vec {
  return new Vec(-1, -1);
}

/**
 * Return a vector pointing to up the right direction.
 */
export function upRightDirection(): Vec {
  return new Vec(1, -1);
}

/**
 * Return a vector pointing to the down direction.
 */
export function downDirection(): Vec {
  return new Vec(0, 1);
}

/**
 * Return a vector pointing to the down left direction.
 */
export function downLeftDirection(): Vec {
  return new Vec(-1, 1);
}

/**
 * Return a vector pointing to the down right direction.
 */
export function downRightDirection(): Vec {
  return new Vec(1, 1);
}

/**
 * Return a vector pointing to the left direction.
 */
export function leftDirection(): Vec {
  return new Vec(-1, 0);
}

/**
 * Return a vector pointing to the right direction.
 */
export function rightDirection(): Vec {
  return new Vec(1, 0);
}

export function compareByDistance(a: Vec, b: Vec, o = origin) {
  a.dist(o) > b.dist(o) ? 1 : -1;
}
