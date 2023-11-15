// import type {System} from "#core";
import type {System} from "aion-core";
import type {Resources} from "aion-core";

export type RendererOptions = {type: "renderer"; canvas: HTMLCanvasElement};

export class Renderer implements System<[RendererOptions]> {
  #canvas!: HTMLCanvasElement;
  #ctx!: CanvasRenderingContext2D;

  public boot({renderer}: Resources<[RendererOptions]>): void {
    this.#canvas = renderer.canvas;
    this.#canvas.width = 1000;
    this.#canvas.height = 600;
    this.#ctx = this.#canvas.getContext("2d")!;
  }

  public update(): void {
    // for (const player of players) {
    //   this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //   this.ctx.strokeRect(player.position.x, player.position.y, 20, 20);
    // }
  }
}
