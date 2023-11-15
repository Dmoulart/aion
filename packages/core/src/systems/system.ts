import type {Resource} from "../resources/resource.js";
import type {Resources} from "../engine/engine.js";

export interface System<R extends Array<Resource> = any> {
  boot?: (resources: Resources<R>) => void;

  update(resources: Resources<R>): void;
}

export type SystemResources<S extends System> = S extends System<infer R>
  ? R
  : never;

export type SystemConfig<S extends System> = {
  [key in SystemResources<S>[number]["type"]]: Omit<
    SystemResources<S>[number],
    "type"
  >;
};

export type SystemsConfig<S extends Array<System>> = {
  [key in SystemResources<S[number]>[number]["type"]]: Omit<
    SystemResources<S[number]>[number],
    "type"
  >;
};
