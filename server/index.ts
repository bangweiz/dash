import { Hono } from "hono";
import { cors } from "hono/cors";
import { Database } from "bun:sqlite";
import { readdir, mkdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import * as tar from "tar";
import AdmZip from "adm-zip";

const app = new Hono();
const DOCS_DIR = join(process.cwd(), "docs");

// Middleware
app.use("/*", cors());

// Ensure docs dir exists
if (!existsSync(DOCS_DIR)) {
	await mkdir(DOCS_DIR, { recursive: true });
}

// --- Routes ---

// 1. List Installed Docsets
app.get("/api/docsets", async (c) => {
	try {
		const entries = await readdir(DOCS_DIR, { withFileTypes: true });
		const docsets = entries
			.filter((e) => e.isDirectory() && e.name.endsWith(".docset"))
			.map((e) => {
				const id = e.name;
				const name = e.name.replace(".docset", "");

				let icon = "book";
				const lowerName = name.toLowerCase();
				if (lowerName.includes("go")) icon = "go";
				else if (lowerName.includes("java") || lowerName.includes("jdk"))
					icon = "java";
				else if (lowerName.includes("rust") || lowerName.includes("cargo"))
					icon = "rust";

				return { id, name, icon, version: "1.0", sections: [] };
			});
		return c.json(docsets);
	} catch (e) {
		console.error("Error reading docsets directory:", e);
		return c.json([], 500);
	}
});

// 2. Install Docset
app.post("/api/docsets/install", async (c) => {
	const body = await c.req.json();
	const { url, name } = body;

	if (!url || !name) {
		return c.json({ error: "Missing url or name" }, 400);
	}

	console.log(`Downloading ${name} from ${url}...`);

	try {
		const response = await fetch(url);
		if (!response.ok)
			throw new Error(`Failed to fetch: ${response.statusText}`);

		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Determine type
		if (url.endsWith(".tgz") || url.endsWith(".tar.gz")) {
			const tempFile = join(DOCS_DIR, `${name}.tgz`);
			await Bun.write(tempFile, buffer);

			console.log(`Extracting ${tempFile}...`);
			await tar.x({
				file: tempFile,
				cwd: DOCS_DIR,
			});

			await unlink(tempFile);
		} else if (url.endsWith(".zip")) {
			const tempFile = join(DOCS_DIR, `${name}.zip`);
			await Bun.write(tempFile, buffer);

			console.log(`Extracting ${tempFile}...`);
			const zip = new AdmZip(tempFile);
			zip.extractAllTo(DOCS_DIR, true);

			await unlink(tempFile); // Clean up
		} else {
			// Fallback: try to guess or just fail
			return c.json({ error: "Unsupported file format" }, 400);
		}

		return c.json({ success: true });
	} catch (e: any) {
		console.error(e);
		return c.json({ error: e.message }, 500);
	}
});

// 3. Get Sections (Query SQLite)
app.get("/api/docsets/:id/sections", (c) => {
	const id = c.req.param("id");
	const docsetId = id.endsWith(".docset") ? id : `${id}.docset`;
	const dbPath = join(
		DOCS_DIR,
		docsetId,
		"Contents",
		"Resources",
		"docSet.dsidx",
	);

	if (!existsSync(dbPath)) {
		return c.json({ error: "Docset index not found" }, 404);
	}

	try {
		const db = new Database(dbPath, { readonly: true });
		// Some docsets use 'searchIndex', others might vary.
		// Standard Dash docsets use 'searchIndex'.
		const query = db.query("SELECT name, type, path FROM searchIndex");
		const entries = query.all() as {
			name: string;
			type: string;
			path: string;
		}[];

		const ALLOWED_TYPES = new Set([
			"Package",
			"Module",
			"Class",
			"Struct",
			"Interface",
			"Enum",
			"Trait",
			"Guide",
			"Library",
		]);

		const sections = entries
			.filter((e) => ALLOWED_TYPES.has(e.type))
			.map((e) => ({
				id: `${e.type}-${e.name}`.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase(),
				title: `${e.type}: ${e.name}`,
				content: "", // Content is fetched on demand
				path: e.path,
			}))
			.sort((a, b) => a.title.localeCompare(b.title));

		db.close();
		return c.json(sections);
	} catch (e: any) {
		console.error(e);
		return c.json({ error: e.message }, 500);
	}
});

// 4. Serve Files
app.get("/api/docsets/:id/file/*", async (c) => {
	const id = c.req.param("id");
	const docsetId = id.endsWith(".docset") ? id : `${id}.docset`;

	const url = new URL(c.req.url);
	// Find where /file/ ends
	// We need to robustly find the start of the relative path
	// The path pattern is /api/docsets/:id/file/...
	// So we search for `/api/docsets/${id}/file/`
	const prefix = `/api/docsets/${id}/file/`;
	const idx = url.pathname.indexOf(prefix);

	if (idx === -1) return c.text("Bad Request", 400);

	const relativePath = url.pathname.substring(idx + prefix.length);
	const decodedPath = decodeURIComponent(relativePath);

	const fullPath = join(
		DOCS_DIR,
		docsetId,
		"Contents",
		"Resources",
		"Documents",
		decodedPath,
	);

	// Security check
	if (!fullPath.startsWith(DOCS_DIR)) {
		return c.text("Access Denied", 403);
	}

	if (existsSync(fullPath)) {
		const file = Bun.file(fullPath);
		return new Response(file);
	}

	return c.text(`Not Found: ${decodedPath}`, 404);
});

export default {
	port: 3000,
	fetch: app.fetch,
};
