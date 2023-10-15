import {Options} from "pusher-js";

export type ClientSocketConfig = {type: "pusher-cli-opts"} & Options & {
    appKey: string;
  };
