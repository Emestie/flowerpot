const packagejson = require("./package.json");

// if (process.env.VITE_APP_VERSION === undefined) {
//     const now = new Date();
//     process.env.VITE_APP_VERSION = `${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}-${
//         now.getUTCHours() * 60 + now.getUTCMinutes()
//     }`;
// }

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
    directories: {
        output: "dist",
        buildResources: "build-resources",
    },
    files: ["host/**/dist/**", "build/**"],
    extraMetadata: {
        version: packagejson.version,
        main: "host/main/dist/index.cjs",
    },
    productName: "Flowerpot",
    appId: "mst.flowerpot",
    copyright: "Copyright © 2019 ${author}",
    win: {
        icon: "build-resources/icons/ico/flower4.ico",
    },
    mac: {
        icon: "build-resources/icons/macicon.icns",
        category: "public.app-category.utilities",
    },
    publish: {
        provider: "github",
    },
};

module.exports = config;
