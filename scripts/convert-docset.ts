import { Database } from "bun:sqlite";
import { readFile } from "fs/promises";
import { join, dirname, extname } from "path";
import * as cheerio from "cheerio";
import plist from "plist";
import type { Plugin, Section } from "../src/types";

// --- Configuration ---
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

const ICON_MAPPING: Record<string, string> = {
	go: "go",
	golang: "go",
	java: "java",
	jdk: "java",
	rust: "rust",
	cargo: "rust",
};

// --- Main ---

async function main() {
	const args = process.argv.slice(2);
	if (args.length < 1) {
		console.error(
			"Usage: bun run scripts/convert-docset.ts <path-to-docset> [output-json]",
		);
		process.exit(1);
	}

	const docsetPath = args[0];
	const outputPath = args[1] || "output.json";

	console.log(`Processing Docset: ${docsetPath}`);

	// 1. Read Info.plist
	const plistPath = join(docsetPath, "Contents", "Info.plist");
	let plistData: any;
	try {
		const content = await readFile(plistPath, "utf-8");
		plistData = plist.parse(content);
	} catch (e) {
		console.error(`Error reading Info.plist at ${plistPath}:`, e);
		process.exit(1);
	}

	const bundleId = plistData.CFBundleIdentifier || "unknown";
	const bundleName = plistData.CFBundleName || "Unknown Docset";
	const bundleVersion = plistData.CFBundleVersion || "1.0";

	// Determine icon
	let icon = "book";
	const lowerName = bundleName.toLowerCase();
	for (const key in ICON_MAPPING) {
		if (lowerName.includes(key)) {
			icon = ICON_MAPPING[key];
			break;
		}
	}

	console.log(`  Name: ${bundleName}`);
	console.log(`  ID: ${bundleId}`);
	console.log(`  Version: ${bundleVersion}`);
	console.log(`  Icon: ${icon}`);

	// 2. Open SQLite Index
	const dbPath = join(docsetPath, "Contents", "Resources", "docSet.dsidx");
	let db: Database;
	try {
		db = new Database(dbPath, { readonly: true });
	} catch (e) {
		console.error(`Error opening SQLite index at ${dbPath}:`, e);
		process.exit(1);
	}

	// 3. Query Index
	const query = db.query("SELECT name, type, path FROM searchIndex");
	const entries = query.all() as { name: string; type: string; path: string }[];

	console.log(`  Found ${entries.length} entries in index.`);

	const filteredEntries = entries.filter((e) => ALLOWED_TYPES.has(e.type));
	console.log(
		`  Filtered to ${filteredEntries.length} entries of types: ${Array.from(ALLOWED_TYPES).join(", ")}`,
	);

	// Sort entries by type then name
	filteredEntries.sort((a, b) => {
		if (a.type !== b.type) return a.type.localeCompare(b.type);
		return a.name.localeCompare(b.name);
	});

	const sections: Section[] = [];
	const resourcesDir = join(docsetPath, "Contents", "Resources", "Documents");

	// 4. Process Entries
	let processedCount = 0;
	for (const entry of filteredEntries) {
		// Unique ID for section
		const sectionId = `${entry.type}-${entry.name}`
			.replace(/[^a-zA-Z0-9-_]/g, "-")
			.toLowerCase();

		// Check if duplicate ID (could happen with overloaded methods, though we filtered those out mostly)
		if (sections.find((s) => s.id === sectionId)) continue;

		const fullPath = join(resourcesDir, entry.path);
		// Handle anchors in path (e.g. file.html#anchor)
		const [filePath] = fullPath.split("#");

		try {
			const fileContent = await readFile(filePath, "utf-8");
			const $ = cheerio.load(fileContent);

			// Extract content
			// Try to find a main content container.
			// Dash docsets often use specific classes, but it varies.
			// We'll fallback to 'body' if nothing else.
			let $content = $("#content, .content, main, article, .document").first();
			if ($content.length === 0) {
				$content = $("body");
			}

			// If still empty, skip
			if ($content.length === 0) {
				console.warn(`    Skipping ${entry.name}: No content found.`);
				continue;
			}

			// Cleanup
			$content.find("script, style, meta, link[rel='stylesheet']").remove();

			// Inline Images
			const images = $content.find("img");
			for (const img of images) {
				const src = $(img).attr("src");
				if (src && !src.startsWith("http") && !src.startsWith("data:")) {
					try {
						// Resolve path relative to the HTML file
						const imgDir = dirname(filePath);
						const imgPath = join(imgDir, src);
						const imgData = await readFile(imgPath);
						const mimeType = getMimeType(imgPath);
						const base64 = imgData.toString("base64");
						$(img).attr("src", `data:${mimeType};base64,${base64}`);
					} catch (err) {
						// Silently fail for missing images or just warn
						// console.warn(`    Failed to inline image ${src} in ${entry.name}`);
					}
				}
			}

			sections.push({
				id: sectionId,
				title: `${entry.type}: ${entry.name}`,
				content: $content.html() || "",
			});

			processedCount++;
			if (processedCount % 100 === 0) process.stdout.write(".");
		} catch (err) {
			console.warn(`    Error processing ${entry.name} (${entry.path}):`, err);
		}
	}
	console.log("\n");

	const plugin: Plugin = {
		id: bundleId,
		name: bundleName,
		version: bundleVersion,
		icon,
		sections,
	};

	await Bun.write(outputPath, JSON.stringify(plugin, null, 2));
	console.log(
		`Successfully converted ${sections.length} sections to ${outputPath}`,
	);
}

function getMimeType(filename: string): string {
	const ext = extname(filename).toLowerCase();
	switch (ext) {
		case ".png":
			return "image/png";
		case ".jpg":
		case ".jpeg":
			return "image/jpeg";
		case ".gif":
			return "image/gif";
		case ".svg":
			return "image/svg+xml";
		case ".webp":
			return "image/webp";
		default:
			return "application/octet-stream";
	}
}

main().catch(console.error);
