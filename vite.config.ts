import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as packagejson from "./package.json";

process.env.VITE_APP_VERSION = packagejson.version;
process.env.VITE_APP_BUILD_TIME = new Date().toISOString().substring(0, 16);

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 5009,
    },
    build: { outDir: "./build" },
    plugins: [react()],
    define: {
        "process.env": {},
    },
});
