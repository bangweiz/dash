export interface Section {
	id: string;
	title: string;
	content?: string;
	path?: string;
}

export interface Plugin {
	id: string;
	name: string;
	version: string;
	icon: string;
	sections: Section[];
}
