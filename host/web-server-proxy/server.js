// server.js
const express = require("express");
const http = require("http");
const https = require("https");
const { URL } = require("url");

const envJson = require("../../.env.json");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = express();
const TARGET = envJson.target; // process.env.TARGET_URL;

// Allow large bodies if needed
app.use(express.raw({ type: "*/*", limit: "10mb" }));

// Add CORS header to every response
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    // Optional: expose common headers and allow methods/headers
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

// Proxy handler: forward to TARGET preserving path and query
app.use(async (req, res) => {
    try {
        const targetUrl = new URL(TARGET);
        // build path: keep original path and query
        const path = req.originalUrl || req.url || "/";
        const options = {
            protocol: targetUrl.protocol,
            hostname: targetUrl.hostname,
            port: targetUrl.port || (targetUrl.protocol === "https:" ? 443 : 80),
            path,
            method: req.method,
            headers: {
                // copy incoming headers but override host
                ...req.headers,
                host: targetUrl.host,
            },
            timeout: 30000,
        };

        const agent = new https.Agent({ rejectUnauthorized: false });
        const proxyReqLib = targetUrl.protocol === "https:" ? https : http;
        const proxyReq = proxyReqLib.request(
            options,
            (proxyRes) => {
                // copy status and headers (except hop-by-hop headers)
                const hopByHop = new Set([
                    "connection",
                    "keep-alive",
                    "proxy-authenticate",
                    "proxy-authorization",
                    "te",
                    "trailer",
                    "transfer-encoding",
                    "upgrade",
                ]);
                for (const [k, v] of Object.entries(proxyRes.headers)) {
                    if (!hopByHop.has(k.toLowerCase())) res.setHeader(k, v);
                }
                // ensure CORS header remains
                res.setHeader("Access-Control-Allow-Origin", "*");

                res.statusCode = proxyRes.statusCode;
                proxyRes.pipe(res);
            },
            { agent }
        );

        proxyReq.on("error", (err) => {
            console.error("Proxy request error:", err);
            if (!res.headersSent) res.status(502).send("Bad Gateway");
            else res.destroy();
        });

        // pipe body (raw) if present
        if (req.body && req.body.length) {
            proxyReq.write(req.body);
        } else if (req.readable) {
            req.pipe(proxyReq);
            return;
        }

        proxyReq.end();
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy listening on http://localhost:${PORT} -> ${TARGET}`));
