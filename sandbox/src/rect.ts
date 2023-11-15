import "./style.css";
import {Engine} from "aion-core";
import {Renderer} from "aion-render";
import type {Resources} from "aion-core/dist/engine/engine";

const game = new Engine({
  systems: [new Renderer()],
  resources: [],
});
debugger;
game.boot();

let t: Resources<{}>;
