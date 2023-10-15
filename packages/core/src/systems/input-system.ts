// import {Resources} from "../game";
// import {GameState} from "../game-state";
// import {getPlayer} from "../helper/get-player";
// import {ClientID} from "../resources/client-id";
// import {System} from "./system.js";

// export class InputSystem implements System<[ClientID]> {
//   public update(state: GameState): void {}

//   public boot(state: GameState, resources: Resources<[ClientID]>) {
//     const player = getPlayer(state, resources);

//     document.addEventListener("keydown", ({key}) => {
//       switch (key) {
//         case "ArrowLeft":
//           player.velocity.x = -1 * player.speed;
//           break;
//         case "ArrowRight":
//           player.velocity.x = 1 * player.speed;
//           break;
//         case "ArrowUp":
//           player.velocity.y = -1 * player.speed;
//           break;
//         case "ArrowDown":
//           player.velocity.y = 1 * player.speed;
//           break;
//         default:
//           player.velocity.x = 0;
//           player.velocity.y = 0;
//           break;
//       }
//     });
//   }
// }
