import { Rect } from "../components.js";
import { useECS } from "../ecs.js";
import { Transform } from "./transform.js";

export function actor(...args: any[]) {}

const Rectangle = { Transform, Rect };

const { prefab } = useECS();

const createRectangle = prefab(Rectangle);

export function rect(w = 50, h = 50, ...args: any[]) {
  return actor(create);
}

actor(
    position(10,10),
    rotation(1),
    fill('blue'),
    rect(10, 10)
    
    

);
