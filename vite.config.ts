import { chrome } from "./.electron-vendors.cache.json";
import { join } from "path";
import { renderer } from "unplugin-auto-expose";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as packagejson from "./package.json";

const PACKAGE_ROOT = __dirname;

process.env.VITE_APP_VERSION = packagejson.version;
process.env.VITE_APP_BUILD_TIME = new Date().toISOString().substring(0, 16);

console.log("Renderer is on.");

// https://vitejs.dev/config/
export default defineConfig({
    mode: process.env.MODE,
    root: PACKAGE_ROOT,
    resolve: {
        alias: {
            "/@/": join(PACKAGE_ROOT, "src") + "/",
            "src/": join(PACKAGE_ROOT, "src") + "/",
        },
    },
    base: "",
    server: {
        port: 5009,
        fs: {
            strict: true,
        },
    },
    build: {
        outDir: "./build",
        sourcemap: true,
        target: `chrome${chrome}`,
        assetsDir: ".",
        rollupOptions: {
            input: join(PACKAGE_ROOT, "index.html"),
        },
        emptyOutDir: true,
    },
    plugins: [
        react(),
        renderer.vite({
            preloadEntry: join(PACKAGE_ROOT, "./host/preload/src/index.ts"),
        }),
    ],
    define: {
        "process.env": {},
    },
});
