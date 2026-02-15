import { useState, useEffect, useMemo, useRef } from "react";
import { DEFAULT_PLUGINS } from "./data/defaultPlugins";
import type { Plugin } from "./types";
import { IconRail } from "./components/Sidebar/IconRail";
import { NavigationPanel } from "./components/Sidebar/NavigationPanel";
import { DocViewer } from "./components/MainContent/DocViewer";
import { ImportModal } from "./components/Modals/ImportModal";
import { LanguageSwitcher } from "./components/CommandPalette/LanguageSwitcher";
import { api } from "./api";

export default function App() {
	// --- State ---
	const [plugins, setPlugins] = useState<Plugin[]>(DEFAULT_PLUGINS);
	const [activePluginId, setActivePluginId] = useState<string | null>(
		DEFAULT_PLUGINS[0].id,
	);
	const [activeDocId, setActiveDocId] = useState<string | null>(
		DEFAULT_PLUGINS[0].sections[0].id,
	);
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	// Modals
	const [showImportModal, setShowImportModal] = useState(false);
	const [showLangSwitcher, setShowLangSwitcher] = useState(false);

	// Refs
	const searchInputRef = useRef<HTMLInputElement>(null);

	// --- Derived State ---
	const activePlugin = useMemo(
		() => plugins.find((p) => p.id === activePluginId),
		[plugins, activePluginId],
	);

	const activeDoc = useMemo(
		() => activePlugin?.sections.find((s) => s.id === activeDocId),
		[activePlugin, activeDocId],
	);

	const filteredSections = useMemo(() => {
		if (!activePlugin) return [];
		if (!searchQuery) return activePlugin.sections;
		return activePlugin.sections.filter(
			(s) =>
				s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(s.content
					? s.content.toLowerCase().includes(searchQuery.toLowerCase())
					: false),
		);
	}, [activePlugin, searchQuery]);

	// --- Effects ---

	// Load Installed Docsets on Mount
	useEffect(() => {
		api.getDocsets().then((docsets) => {
			if (docsets.length > 0) {
				const newPlugins: Plugin[] = docsets.map((d) => ({
					...d,
					sections: [],
				}));
				// Merge with default plugins or replace
				setPlugins((prev) => {
					// Avoid duplicates
					const unique = [...prev];
					for (const p of newPlugins) {
						if (!unique.find((u) => u.id === p.id)) {
							unique.push(p);
						}
					}
					return unique;
				});
			}
		});
	}, []);

	// Load Sections when Plugin Selected
	useEffect(() => {
		if (activePluginId && activePlugin) {
			// If no sections loaded yet, fetch them (only for docsets, not default plugins)
			const isDefault = DEFAULT_PLUGINS.some((p) => p.id === activePluginId);
			if (!isDefault && activePlugin.sections.length === 0) {
				api.getSections(activePluginId).then((sections) => {
					setPlugins((prev) =>
						prev.map((p) =>
							p.id === activePluginId
								? {
										...p,
										sections: sections.map((s) => ({
											id: s.id,
											title: s.title,
											path: s.path,
											content: "", // Content loaded on demand by DocViewer
										})),
									}
								: p,
						),
					);
				});
			}
		}
	}, [activePluginId, activePlugin]);

	// Global Keyboard Shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Toggle Language Switcher: Cmd+K or Ctrl+K
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setShowLangSwitcher((prev) => !prev);
			}

			// Close Modals on Escape
			if (e.key === "Escape") {
				if (showLangSwitcher) setShowLangSwitcher(false);
				if (showImportModal) setShowImportModal(false);
			}

			// Focus Search on '/' (if not in input)
			if (e.key === "/" && !showLangSwitcher && !showImportModal) {
				const activeEl = document.activeElement;
				if (
					activeEl &&
					activeEl.tagName !== "INPUT" &&
					activeEl.tagName !== "TEXTAREA"
				) {
					e.preventDefault();
					searchInputRef.current?.focus();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [showLangSwitcher, showImportModal]);

	// --- Handlers ---

	const selectPlugin = (id: string) => {
		const plugin = plugins.find((p) => p.id === id);
		if (plugin) {
			setActivePluginId(id);
			if (plugin.sections.length > 0) setActiveDocId(plugin.sections[0].id);
			setShowLangSwitcher(false);
		}
	};

	const handleImportPlugin = (newPlugin: Plugin) => {
		setPlugins((prev) => {
			const existingIdx = prev.findIndex((p) => p.id === newPlugin.id);
			if (existingIdx >= 0) {
				const newPlugins = [...prev];
				newPlugins[existingIdx] = newPlugin;
				return newPlugins;
			}
			return [...prev, newPlugin];
		});
		selectPlugin(newPlugin.id);
	};

	const handleInstallDocset = async (url: string, name: string) => {
		try {
			await api.installDocset(url, name);
			// Reload docsets
			const docsets = await api.getDocsets();
			const newPlugin = docsets.find((d) => d.name === name);
			if (newPlugin) {
				handleImportPlugin({ ...newPlugin, sections: [] });
			}
		} catch (e) {
			alert("Installation Failed: " + e);
		}
	};

	return (
		<div className="flex h-screen w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
			{/* --- Sidebar Container (Split into Rail and Panel) --- */}
			<div
				className={`${
					sidebarOpen ? "w-80" : "w-0"
				} flex-shrink-0 flex flex-row transition-all duration-300 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950`}
			>
				<IconRail
					plugins={plugins}
					activePluginId={activePluginId || ""}
					onSelectPlugin={selectPlugin}
					onOpenImportModal={() => setShowImportModal(true)}
				/>

				<NavigationPanel
					activePlugin={activePlugin}
					activeDocId={activeDocId}
					onSelectDoc={setActiveDocId}
					onCloseSidebar={() => setSidebarOpen(false)}
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					filteredSections={filteredSections}
					searchInputRef={searchInputRef}
				/>
			</div>

			<DocViewer
				activeDoc={activeDoc}
				activePlugin={activePlugin}
				sidebarOpen={sidebarOpen}
				onOpenSidebar={() => setSidebarOpen(true)}
			/>

			{/* --- Modals --- */}
			{showLangSwitcher && (
				<LanguageSwitcher
					plugins={plugins}
					onClose={() => setShowLangSwitcher(false)}
					onSelectPlugin={selectPlugin}
				/>
			)}

			{showImportModal && (
				<ImportModal
					onClose={() => setShowImportModal(false)}
					onImport={handleImportPlugin}
					onInstall={handleInstallDocset}
				/>
			)}
		</div>
	);
}
