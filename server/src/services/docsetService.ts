import { Database } from "bun:sqlite";
import { readdir, mkdir, unlink, rm } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import * as tar from "tar";
import AdmZip from "adm-zip";

const DOCS_DIR = join(process.cwd(), "docs");

// Ensure docs dir exists
if (!existsSync(DOCS_DIR)) {
	await mkdir(DOCS_DIR, { recursive: true });
}

export interface Docset {
	id: string;
	name: string;
	icon: string;
	version: string;
	sections: any[];
}

export const docsetService = {
	async getDocsets(): Promise<Docset[]> {
		try {
			const entries = await readdir(DOCS_DIR, { withFileTypes: true });
			return entries
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
		} catch (e) {
			console.error("Error reading docsets directory:", e);
			return [];
		}
	},

	async installDocset(url: string, name: string): Promise<void> {
		console.log(`Downloading ${name} from ${url}...`);

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
			throw new Error("Unsupported file format");
		}
	},

	async deleteDocset(id: string): Promise<void> {
		const docsetId = id.endsWith(".docset") ? id : `${id}.docset`;
		const fullPath = join(DOCS_DIR, docsetId);

		// Security check
		if (!fullPath.startsWith(DOCS_DIR)) {
			throw new Error("Access Denied");
		}

		if (existsSync(fullPath)) {
			console.log(`Deleting ${fullPath}...`);
			await rm(fullPath, { recursive: true, force: true });
		} else {
            throw new Error("Docset not found");
        }
	},

	getSections(id: string) {
		const docsetId = id.endsWith(".docset") ? id : `${id}.docset`;
		const dbPath = join(
			DOCS_DIR,
			docsetId,
			"Contents",
			"Resources",
			"docSet.dsidx",
		);

		if (!existsSync(dbPath)) {
			throw new Error("Docset index not found");
		}

		const db = new Database(dbPath, { readonly: true });
		// Some docsets use 'searchIndex', others might vary.
		// Standard Dash docsets use 'searchIndex'.
		const query = db.query("SELECT name, type, path FROM searchIndex");
		const entries = query.all() as {
			name: string;
			type: string;
			path: string;
		}[];
        db.close();

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

		return entries
			.filter((e) => ALLOWED_TYPES.has(e.type))
			.map((e) => ({
				id: `${e.type}-${e.name}`.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase(),
				title: `${e.type}: ${e.name}`,
				content: "", // Content is fetched on demand
				path: e.path,
			}))
			.sort((a, b) => a.title.localeCompare(b.title));
	},

	getFilePath(id: string, relativePath: string): string | null {
		const docsetId = id.endsWith(".docset") ? id : `${id}.docset`;
		const fullPath = join(
			DOCS_DIR,
			docsetId,
			"Contents",
			"Resources",
			"Documents",
			relativePath,
		);

		// Security check
		if (!fullPath.startsWith(DOCS_DIR)) {
            // Check if it's strictly inside docs dir.
            // join resolves '..' so if someone sends relativePath as '../../' it might go up.
            // However, we append docsetId/... which is deeper.
            // So checking startsWith DOCS_DIR is good.
			return null;
		}

		if (existsSync(fullPath)) {
			return fullPath;
		}

		return null;
	}
};
