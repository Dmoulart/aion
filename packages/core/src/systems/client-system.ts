// import {GameState} from "~/game/game-state";
// import {System} from "./system.js";
// import Pusher, {Channel} from "pusher-js";
// import {Resources} from "../game";
// import {ClientSocketConfig} from "../resources/client-socket-config";

// export class ClientSystem implements System<[ClientSocketConfig]> {
//   private socket!: Pusher;
//   private channel!: Channel;

//   public boot(
//     state: GameState,
//     resources: Resources<[ClientSocketConfig]>
//   ): void {
//     // const {appKey} = resources["pusher-cli-opts"];
//     // this.socket = new Pusher(appKey, resources["pusher-cli-opts"]);
//     // console.log("starting client socket");
//     // this.channel = this.socket.subscribe("game");
//     // this.socket.connection.bind("connected", (data: any) => {
//     //   console.log("client connected ", {data, user: this.socket.user});
//     //   this.socket.send_event("game:new-user", {socketId: data.socket_id});
//     // });
//     // this.socket.connection.bind("error", (err: any) => {
//     //   console.error({err});
//     // });
//   }

//   update(state: GameState, resources: Resources<any>): void {
//     // throw new Error("Method not implemented.");
//   }
// }
