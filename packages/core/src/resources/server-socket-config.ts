import Pusher from "pusher";

export type ServerSocketConfig = {type: "pusher-srv-opts"} & Pusher.Options;
