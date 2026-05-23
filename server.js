import { createServer } from "node:http";
import { config } from "./server/config.js";
import { handleApiRequest } from "./server/apiRouter.js";
import { serveStatic } from "./server/static.js";

createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (url.pathname.startsWith("/api/")) return handleApiRequest(request, response);
  return serveStatic(url.pathname, response);
}).listen(config.port, () => {
  console.log(`Xander Kreativ server running at http://127.0.0.1:${config.port}`);
  console.log(`Admin dashboard: http://127.0.0.1:${config.port}/admin`);
  if (config.usesDefaultAdminCredentials) {
    console.warn("Using default admin credentials. Set ADMIN_USERNAME and ADMIN_PASSWORD before deployment.");
  }
});
