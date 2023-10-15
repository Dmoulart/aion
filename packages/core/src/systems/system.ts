import type {Resource} from "../resources/resource.js";
import type {Resources} from "../engine/game.js";

export interface System<R extends Array<Resource> = any> {
  boot?: (resources: Resources<R>) => void;

  update(resources: Resources<R>): void;
}
