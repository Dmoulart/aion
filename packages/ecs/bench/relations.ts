import { attach } from "../src/component.js";
import { createEntity } from "../src/entity.js";
import { pair } from "../src/id.js";
import { all, createQuery, runQuery } from "../src/query.js";
import { createTag } from "../src/tag.js";
import { createWorld } from "../src/world.js";

// {const world = createWorld();

// const Power = createTag();
// const PowerOf = (power: number) => {
//   return pair(Power, power);
// };

// const fireball = createEntity(world);
// const hero = createEntity(world);

// attach(world, PowerOf(fireball), hero);
// const q = createQuery(all(PowerOf(fireball)));
// console.time("query");
// const result = runQuery(world, q);
// console.timeEnd("query");

// console.log(result[0]?.entities.dense[0]);}

const world = createWorld();

const Power = createTag();

const hero = createEntity(world);

attach(world, Power, hero);

const q = createQuery(all(Power));

console.time("query");
const result = runQuery(world, q);
console.timeEnd("query");

console.log(result[0]?.entities.dense[0]);
