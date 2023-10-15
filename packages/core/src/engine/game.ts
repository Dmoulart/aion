import type {System} from "../systems/system.js";
import type {Resource} from "../resources/resource.js";

export type GameConfig<R extends Resource[], S extends System<R>[]> = {
  /**
   * The systems are the game logic modules wich modify the game state at each update.
   */
  systems: S;
  /**
   * The global game resources used by the systems.
   */
  resources: R;
};

export class Game<R extends Resource[], S extends System<R>[]> {
  resources: Resources<R> = {} as Resources<R>;

  #systems!: S;

  constructor({resources, systems}: GameConfig<R, S>) {
    this.#systems = systems;

    // build game resources map
    for (const resource of resources) {
      type ResourceKey = keyof Resources<R>;
      type ResourceValue = Resources<R>[typeof resource.type];
      this.resources[resource.type as ResourceKey] = resource as ResourceValue;
    }
  }

  boot() {
    this.#systems.forEach((system) => system.boot?.(this.resources));

    this.#step();
  }

  getSystem<T extends new (...args: any) => System<R>>(
    ctor: T
  ): InstanceType<T> {
    return this.#systems.find(
      (system) => system instanceof ctor
    ) as InstanceType<T>;
  }

  /**
   * Game loop
   */
  #step() {
    // update state
    this.#systems.forEach((system) => system.update?.(this.resources));

    requestAnimationFrame(() => this.#step());
  }
}

/**
 * The game resources type describes a map of game resources
 * with resource type as key and resource object as value.
 * It accomplish a sort of reduce operation from an array of resource.
 * @example from [{type: 'server-id', id: 1}, {type: 'client-id', id: 1}]
 * to {'server-id': {type: 'server-id', id: 1},'server-id': {type: 'client-id', id: 1}}
 */
export type Resources<T extends Array<Resource>> = {
  [key in T[number]["type"]]: T[number] extends infer Type
    ? Type extends {type: key}
      ? Type
      : never
    : never;
};
