/**
 * @module preload
 */

import { contextBridge } from "electron";
import { eapi } from "./eapi";

contextBridge.exposeInMainWorld("eapi", eapi);

export { eapi };
