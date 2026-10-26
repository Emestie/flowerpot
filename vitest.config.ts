import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
    //intentionally not reusing vite.config.ts: it pulls in vite-plugin-checker,
    //electron-vendors and dev-server settings that make no sense for tests
    plugins: [react()],
    test: {
        //jsdom globally: even "node-level" tests import modules that touch
        //localStorage (helpers/Query.getWIStorage, platforms/web/WebStore)
        environment: "jsdom",
        include: ["src/__tests__/**/*.test.{ts,tsx}"],
    },
});
