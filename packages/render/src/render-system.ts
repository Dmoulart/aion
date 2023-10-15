// import type {System} from "#core";
import type {System} from "aion-core";

export class RenderSystem implements System {
  #canvas!: HTMLCanvasElement;
  #ctx!: CanvasRenderingContext2D;

  public boot(): void {
    this.#canvas = document.querySelector("#game-canvas")!;
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
