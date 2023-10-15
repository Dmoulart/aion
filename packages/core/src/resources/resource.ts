// import Pusher from "pusher";
// import {ClientID} from "./client-id.js";
// import {ServerID} from "./server-id.js";
// import {ServerSocketConfig} from "./server-socket-config.js";
// import {ClientSocketConfig} from "./client-socket-config.js";

// export type Resource =
//   | ClientID
//   | ServerID
//   | ServerSocketConfig
//   | ClientSocketConfig;

export type Resource = Record<string, any>;
