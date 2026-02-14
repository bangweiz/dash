import { useState, useEffect, useMemo, useRef } from "react";
import {
	Book,
	Search,
	Menu,
	X,
	Plus,
	Trash2,
	Settings,
	Code,
	ChevronRight,
	ChevronDown,
	Box,
	Coffee,
	MoreVertical,
	Command,
	Keyboard,
} from "lucide-react";

// --- 模拟的初始数据 (默认插件) ---
const DEFAULT_PLUGINS = [
	{
		id: "go-std-lib",
		name: "Go Standard Library",
		version: "1.21",
		icon: "go",
		sections: [
			{
				id: "fmt",
				title: "Package fmt",
				content: `
          <h1 class="text-3xl font-bold mb-4">Package fmt</h1>
          <p class="mb-4">Package fmt implements formatted I/O with functions analogous to C's printf and scanf.</p>
          <h2 class="text-2xl font-semibold mt-6 mb-2">func Println</h2>
          <code class="bg-gray-100 dark:bg-gray-800 p-2 rounded block mb-4 whitespace-pre-wrap break-words">func Println(a ...any) (n int, err error)</code>
          <p>Println formats using the default formats for its operands and writes to standard output.</p>
        `,
			},
			{
				id: "net-http",
				title: "Package net/http",
				content: `
          <h1 class="text-3xl font-bold mb-4">Package http</h1>
          <p>Package http provides HTTP client and server implementations.</p>
          <div class="bg-blue-50 dark:bg-blue-900/30 p-4 rounded border-l-4 border-blue-500 my-4">
            <strong>Note:</strong> Get, Head, Post, and PostForm make HTTP (or HTTPS) requests.
          </div>
        `,
			},
		],
	},
	{
		id: "java-gradle",
		name: "Java & Gradle Guide",
		version: "8.4",
		icon: "java",
		sections: [
			{
				id: "gradle-basics",
				title: "Gradle Build Lifecycle",
				content: `
          <h1 class="text-3xl font-bold mb-4">Gradle Build Lifecycle</h1>
          <p class="mb-4">Gradle's core is a dependency based programming language.</p>
          <ul class="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Initialization:</strong> Gradle determines which projects are going to take part in the build.</li>
            <li><strong>Configuration:</strong> The project objects are configured.</li>
            <li><strong>Execution:</strong> Gradle determines the subset of the tasks to be executed.</li>
          </ul>
        `,
			},
			{
				id: "java-concurrency",
				title: "Java Concurrency",
				content: `
          <h1 class="text-3xl font-bold mb-4">Java Virtual Threads</h1>
          <p>Virtual threads are lightweight threads that dramatically reduce the effort of writing, maintaining, and observing high-throughput concurrent applications.</p>
          <pre class="bg-gray-900 text-gray-100 p-4 rounded mt-4 whitespace-pre-wrap break-words"><code>Thread.startVirtualThread(() -> {
    System.out.println("Hello from a virtual thread");
});</code></pre>
        `,
			},
		],
	},
	{
		id: "rust-std",
		name: "Rust Documentation",
		version: "1.75",
		icon: "rust",
		sections: [
			{
				id: "vec",
				title: "Struct std::vec::Vec",
				content: "<h1>Vec</h1><p>A contiguous growable array type.</p>",
			},
			{
				id: "option",
				title: "Enum std::option::Option",
				content:
					"<h1>Option</h1><p>Type Option represents an optional value.</p>",
			},
		],
	},
];

// --- 图标映射组件 ---
const PluginIcon = ({ type, className }) => {
	if (type === "go")
		return (
			<div
				className={`font-bold text-cyan-600 dark:text-cyan-400 ${className}`}
				style={{ fontSize: "0.7rem", lineHeight: "1rem" }}
			>
				GO
			</div>
		);
	if (type === "java")
		return (
			<Coffee className={`text-orange-600 dark:text-orange-400 ${className}`} />
		);
	if (type === "rust")
		return (
			<Settings
				className={`text-orange-500 dark:text-orange-400 ${className}`}
			/>
		);
	return <Book className={`text-slate-600 dark:text-slate-400 ${className}`} />;
};

export default function App() {
	// --- State ---
	const [plugins, setPlugins] = useState(DEFAULT_PLUGINS);
	const [activePluginId, setActivePluginId] = useState(DEFAULT_PLUGINS[0].id);
	const [activeDocId, setActiveDocId] = useState(
		DEFAULT_PLUGINS[0].sections[0].id,
	);
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	// Modals
	const [showImportModal, setShowImportModal] = useState(false);
	const [importJson, setImportJson] = useState("");

	// Command Palette State
	const [showLangSwitcher, setShowLangSwitcher] = useState(false);
	const [switcherQuery, setSwitcherQuery] = useState("");
	const [switcherSelectedIndex, setSwitcherSelectedIndex] = useState(0);

	// Refs
	const searchInputRef = useRef(null);
	const switcherInputRef = useRef(null);
	const switcherListRef = useRef(null);

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
				s.content.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [activePlugin, searchQuery]);

	// Command Palette filtered plugins
	const filteredPlugins = useMemo(() => {
		if (!switcherQuery) return plugins;
		return plugins.filter((p) =>
			p.name.toLowerCase().includes(switcherQuery.toLowerCase()),
		);
	}, [plugins, switcherQuery]);

	// --- Effects ---

	// Global Keyboard Shortcuts
	useEffect(() => {
		const handleKeyDown = (e) => {
			// Toggle Language Switcher: Cmd+K or Ctrl+K
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setShowLangSwitcher((prev) => !prev);
				setSwitcherQuery(""); // Reset query
				setSwitcherSelectedIndex(0);
			}

			// Close Modals on Escape
			if (e.key === "Escape") {
				if (showLangSwitcher) setShowLangSwitcher(false);
				if (showImportModal) setShowImportModal(false);
			}

			// Focus Search on '/' (if not in input)
			if (e.key === "/" && !showLangSwitcher && !showImportModal) {
				if (
					document.activeElement.tagName !== "INPUT" &&
					document.activeElement.tagName !== "TEXTAREA"
				) {
					e.preventDefault();
					searchInputRef.current?.focus();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [showLangSwitcher, showImportModal]);

	// Auto-focus switcher input
	useEffect(() => {
		if (showLangSwitcher) {
			setTimeout(() => switcherInputRef.current?.focus(), 50);
		}
	}, [showLangSwitcher]);

	// Reset selected index when query changes
	useEffect(() => {
		setSwitcherSelectedIndex(0);
	}, [switcherQuery]);

	// --- Handlers ---

	const handleSwitcherKeyDown = (e) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSwitcherSelectedIndex((prev) => (prev + 1) % filteredPlugins.length);
			// Optional: scroll into view logic here if list is long
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSwitcherSelectedIndex(
				(prev) => (prev - 1 + filteredPlugins.length) % filteredPlugins.length,
			);
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (filteredPlugins.length > 0) {
				const selected = filteredPlugins[switcherSelectedIndex];
				selectPlugin(selected.id);
			}
		}
	};

	const selectPlugin = (id) => {
		const plugin = plugins.find((p) => p.id === id);
		if (plugin) {
			setActivePluginId(id);
			if (plugin.sections.length > 0) setActiveDocId(plugin.sections[0].id);
			setShowLangSwitcher(false);
		}
	};

	const handleImportPlugin = () => {
		try {
			const newPlugin = JSON.parse(importJson);
			if (
				!newPlugin.id ||
				!newPlugin.name ||
				!Array.isArray(newPlugin.sections)
			) {
				alert("Invalid Plugin Format");
				return;
			}
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
			setShowImportModal(false);
			setImportJson("");
		} catch (e) {
			alert("Invalid JSON: " + e.message);
		}
	};

	const removePlugin = (e, id) => {
		e.stopPropagation();
		if (confirm("Delete this documentation plugin?")) {
			const newPlugins = plugins.filter((p) => p.id !== id);
			setPlugins(newPlugins);
			if (id === activePluginId && newPlugins.length > 0) {
				selectPlugin(newPlugins[0].id);
			} else if (newPlugins.length === 0) {
				setActivePluginId(null);
				setActiveDocId(null);
			}
		}
	};

	return (
		<div className="flex h-screen w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
			{/* --- Sidebar Container (Split into Rail and Panel) --- */}
			<div
				className={`${sidebarOpen ? "w-80" : "w-0"} flex-shrink-0 flex flex-row transition-all duration-300 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950`}
			>
				{/* 1. Icon Rail */}
				<div className="w-16 flex-shrink-0 flex flex-col items-center py-4 gap-3 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto scrollbar-hide z-10">
					{/* Brand Logo */}
					<div className="mb-2 p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/30">
						<Box size={20} />
					</div>

					<div className="w-8 h-[1px] bg-slate-200 dark:bg-slate-700 mb-1"></div>

					{/* Plugin Icons List */}
					{plugins.map((plugin) => (
						<div key={plugin.id} className="relative group">
							<button
								onClick={() => selectPlugin(plugin.id)}
								className={`
                  w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200
                  ${
										activePluginId === plugin.id
											? "bg-white dark:bg-slate-800 shadow-md ring-2 ring-blue-500/20"
											: "text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600"
									}
                `}
								title={plugin.name}
							>
								<PluginIcon type={plugin.icon} className="w-5 h-5" />
							</button>

							{activePluginId === plugin.id && (
								<div className="absolute -left-2 top-3 w-1 h-4 bg-blue-500 rounded-r-full" />
							)}
						</div>
					))}

					{/* Add Plugin Button */}
					<button
						onClick={() => setShowImportModal(true)}
						className="mt-2 w-10 h-10 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
						title="Import JSON Plugin"
					>
						<Plus size={18} />
					</button>

					<div className="flex-1"></div>

					{/* Keyboard Hint */}
					<div className="mb-2 text-[10px] text-slate-400 font-mono text-center opacity-60">
						⌘K
					</div>
				</div>

				{/* 2. Navigation Panel */}
				<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
					{/* Panel Header */}
					<div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm">
						<div className="min-w-0">
							<h2 className="font-bold text-sm truncate leading-tight">
								{activePlugin?.name || "DevDocs"}
							</h2>
							<p className="text-[10px] text-slate-500 font-mono truncate">
								{activePlugin
									? `v${activePlugin.version}`
									: "No plugin selected"}
							</p>
						</div>
						<button
							onClick={() => setSidebarOpen(false)}
							className="md:hidden text-slate-500"
						>
							<X size={18} />
						</button>
					</div>

					{/* Search Bar */}
					<div className="p-3">
						<div className="relative group">
							<Search className="absolute left-2.5 top-2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
							<input
								ref={searchInputRef}
								id="doc-search"
								type="text"
								placeholder="Search..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-8 pr-8 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400"
							/>
							<div className="absolute right-2 top-1.5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-400 font-mono">
								/
							</div>
						</div>
					</div>

					{/* Navigation Tree */}
					<div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
						{filteredSections.length === 0 ? (
							<div className="text-center text-slate-400 text-xs mt-10 px-4">
								{activePlugin
									? "No matching documents"
									: "Select a plugin on the left"}
							</div>
						) : (
							<div className="space-y-0.5">
								{filteredSections.map((section) => (
									<button
										key={section.id}
										onClick={() => setActiveDocId(section.id)}
										className={`
                      w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between group transition-colors
                      ${
												activeDocId === section.id
													? "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
													: "hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
											}
                    `}
									>
										<span className="truncate">{section.title}</span>
										{activeDocId === section.id && (
											<ChevronRight size={14} className="opacity-50" />
										)}
									</button>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* --- 主要内容区域 --- */}
			<div className="flex-1 flex flex-col h-full relative min-w-0">
				{/* Mobile Header Toggle */}
				{!sidebarOpen && (
					<div className="absolute top-4 left-4 z-20">
						<button
							onClick={() => setSidebarOpen(true)}
							className="p-2 bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
						>
							<Menu size={20} />
						</button>
					</div>
				)}

				{/* Doc Content */}
				<div className="flex-1 overflow-y-auto p-6 md:p-12 lg:px-20 scroll-smooth">
					{activeDoc ? (
						<div className="max-w-4xl mx-auto">
							<div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 md:hidden">
								<span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
									{activePlugin?.name}
								</span>
							</div>
							<div className="prose dark:prose-invert prose-blue prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 max-w-none">
								<div dangerouslySetInnerHTML={{ __html: activeDoc.content }} />
							</div>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
							<div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
								<Book size={32} className="opacity-50" />
							</div>
							<p className="font-medium">Select a document to view</p>
							<div className="flex gap-4 text-xs text-slate-500 font-mono mt-4">
								<span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
									⌘K to switch
								</span>
								<span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
									/ to search
								</span>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* --- Language Switcher Modal (Command Palette) --- */}
			{showLangSwitcher && (
				<div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-[2px] z-[100] flex items-start justify-center pt-[20vh] px-4">
					<div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
						<div className="flex items-center p-3 border-b border-slate-100 dark:border-slate-800">
							<Search className="w-5 h-5 text-slate-400 ml-1" />
							<input
								ref={switcherInputRef}
								type="text"
								placeholder="Switch documentation..."
								value={switcherQuery}
								onChange={(e) => setSwitcherQuery(e.target.value)}
								onKeyDown={handleSwitcherKeyDown}
								className="flex-1 bg-transparent border-none outline-none px-3 text-lg placeholder:text-slate-400 text-slate-700 dark:text-slate-200"
							/>
							<div className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 font-mono">
								ESC
							</div>
						</div>

						<div
							className="max-h-[300px] overflow-y-auto p-2"
							ref={switcherListRef}
						>
							{filteredPlugins.length === 0 ? (
								<div className="p-4 text-center text-slate-500 text-sm">
									No documentation found.
								</div>
							) : (
								filteredPlugins.map((plugin, idx) => (
									<button
										key={plugin.id}
										onClick={() => selectPlugin(plugin.id)}
										onMouseEnter={() => setSwitcherSelectedIndex(idx)}
										className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors
                      ${
												idx === switcherSelectedIndex
													? "bg-blue-600 text-white"
													: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
											}
                    `}
									>
										<div
											className={`p-1 rounded ${idx === switcherSelectedIndex ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"}`}
										>
											<PluginIcon
												type={plugin.icon}
												className={`w-4 h-4 ${idx === switcherSelectedIndex ? "text-white" : ""}`}
											/>
										</div>
										<div className="flex-1">
											<div className="font-medium text-sm">{plugin.name}</div>
											<div
												className={`text-xs ${idx === switcherSelectedIndex ? "text-blue-100" : "text-slate-500"}`}
											>
												v{plugin.version}
											</div>
										</div>
										{idx === switcherSelectedIndex && (
											<Keyboard className="w-4 h-4 opacity-50" />
										)}
									</button>
								))
							)}
						</div>
						{filteredPlugins.length > 0 && (
							<div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] text-slate-400 flex justify-between px-4">
								<span>Select</span>
								<span>⇅ Navigate</span>
							</div>
						)}
					</div>
				</div>
			)}

			{/* --- Import Modal --- */}
			{showImportModal && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
					<div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] ring-1 ring-slate-200 dark:ring-slate-800">
						<div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
							<h2 className="text-xl font-bold flex items-center gap-2">
								<Plus className="w-5 h-5 text-blue-500" />
								Import Plugin
							</h2>
							<button
								onClick={() => setShowImportModal(false)}
								className="text-slate-500 hover:text-slate-700"
							>
								<X size={24} />
							</button>
						</div>

						<div className="p-6 flex-1 overflow-hidden flex flex-col">
							<p className="text-sm text-slate-500 mb-4">
								Paste the JSON generated by your conversion script here.
							</p>
							<textarea
								value={importJson}
								onChange={(e) => setImportJson(e.target.value)}
								placeholder='{"id": "rust-std", "name": "Rust Standard Library", ...}'
								className="flex-1 w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
							/>
						</div>

						<div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
							<button
								onClick={() => setShowImportModal(false)}
								className="px-4 py-2 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={handleImportPlugin}
								className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-95"
							>
								Load Plugin
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
