const API_BASE = "http://localhost:3000/api";

export interface Docset {
	id: string;
	name: string;
	icon: string;
	version: string;
}

export interface DocSection {
	id: string;
	title: string;
	path: string;
}

export const api = {
	async getDocsets(): Promise<Docset[]> {
		const res = await fetch(`${API_BASE}/docsets`);
		return res.json();
	},

	async installDocset(url: string, name: string): Promise<void> {
		const res = await fetch(`${API_BASE}/docsets/install`, {
			method: "POST",
			body: JSON.stringify({ url, name }),
			headers: { "Content-Type": "application/json" },
		});
		if (!res.ok) throw new Error("Failed to install docset");
	},

	async getSections(id: string): Promise<DocSection[]> {
		const res = await fetch(`${API_BASE}/docsets/${id}/sections`);
		return res.json();
	},
};
