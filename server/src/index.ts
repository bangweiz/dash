import { Hono } from "hono";
import { cors } from "hono/cors";
import docsetsRouter from "./routes/docsets";
import uiRouter from "./routes/ui";

const app = new Hono();

// Middleware
app.use("/*", cors());

// Routes
// UI served at root / and /dashboard (via redirect)
app.route("/", uiRouter);

// API routes
app.route("/api/docsets", docsetsRouter);

console.log("Server running on http://localhost:3000");

export default {
	port: 3000,
	fetch: app.fetch,
};
