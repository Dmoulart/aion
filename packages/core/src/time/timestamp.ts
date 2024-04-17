import { millitimestamp } from "./millitimestamp.js";

export const timestamp = () => Math.floor(millitimestamp() / 1000);
