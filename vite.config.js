import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import judgeHandler from "./api/judge.js";

function proofMeApiPlugin() {
  return {
    name: "proofme-api",
    configureServer(server) {
      server.middlewares.use("/api/judge", async (req, res) => {
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
            req.body = {};
          }

          await judgeHandler(req, res);
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), proofMeApiPlugin()],
});
