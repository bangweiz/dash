import { Hono } from "hono";
import { docsetService } from "../services/docsetService";

const app = new Hono();

// 1. List Installed Docsets
app.get("/", async (c) => {
	const docsets = await docsetService.getDocsets();
	return c.json(docsets);
});

// 2. Install Docset
app.post("/install", async (c) => {
	const body = await c.req.json();
	const { url, name } = body;

	if (!url || !name) {
		return c.json({ error: "Missing url or name" }, 400);
	}

	try {
		await docsetService.installDocset(url, name);
		return c.json({ success: true });
	} catch (e: any) {
		console.error(e);
		return c.json({ error: e.message }, 500);
	}
});

// 3. Delete Docset
app.delete("/:id", async (c) => {
	const id = c.req.param("id");
	try {
		await docsetService.deleteDocset(id);
		return c.json({ success: true });
	} catch (e: any) {
		console.error(e);
		return c.json({ error: e.message }, 500);
	}
});

// 4. Get Sections
app.get("/:id/sections", (c) => {
	const id = c.req.param("id");
	try {
		const sections = docsetService.getSections(id);
		return c.json(sections);
	} catch (e: any) {
		console.error(e);
		return c.json({ error: e.message }, 500);
	}
});

// 5. Serve Files
app.get("/:id/file/*", async (c) => {
	const id = c.req.param("id");
	const url = new URL(c.req.url);

    // Find relative path
    // The path pattern is /api/docsets/:id/file/...
	// The router is mounted at /api/docsets, so the path here is /:id/file/*
    // But c.req.path will be the full path.
    // Let's rely on string manipulation as before or use c.req.param('*') if available?
    // Hono's wildcard param is stored in `c.req.param('0')`? or just not easily accessible if inside `*`.

    // Let's use the logic from original code, adjusted for the mount point.
    // If mounted at /api/docsets, then the URL is /api/docsets/ID/file/PATH

	const prefix = `/api/docsets/${id}/file/`;
	const idx = url.pathname.indexOf(prefix);

	if (idx === -1) return c.text("Bad Request", 400);

	const relativePath = url.pathname.substring(idx + prefix.length);
	const decodedPath = decodeURIComponent(relativePath);

    const fullPath = docsetService.getFilePath(id, decodedPath);
    if (!fullPath) {
        return c.text(`Not Found: ${decodedPath}`, 404);
    }

    // Check if security check failed (returns null) vs file not found (returns null)
    // docsetService.getFilePath handles both.
    // If we want specific error for Access Denied, we might need to change service.
    // But for now, 404 is safe enough.

	const file = Bun.file(fullPath);
	return new Response(file);
});

export default app;
