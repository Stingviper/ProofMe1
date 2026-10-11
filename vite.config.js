import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function proofMeApiPlugin() {
  return {
    name: "proofme-api",
    configureServer(server) {
      server.middlewares.use("/api/judge", async (req, res, next) => {
        if (req.method !== "POST" && req.method !== "OPTIONS") {
          next();
          return;
        }

        try {
          const { default: judgeHandler } = await import("./api/judge.js");

          if (typeof judgeHandler !== "function") {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({
              error: "api/judge.js does not export a default handler."
            }));
            return;
          }

          if (req.method === "OPTIONS") {
            await judgeHandler(req, res);
            return;
          }

          let raw = "";

          req.on("data", (chunk) => {
            raw += chunk;
          });

          req.on("end", async () => {
            try {
              req.body = raw ? JSON.parse(raw) : {};
            } catch {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Invalid JSON body." }));
              return;
            }

            try {
              await judgeHandler(req, res);
            } catch (error) {
              console.error("Judge API error:", error);
              if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Judge API failed." }));
              }
            }
          });
        } catch (error) {
          console.error("Could not load judge handler:", error);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Could not load judge handler." }));
          }
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), proofMeApiPlugin()],
});