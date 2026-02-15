import React, { useState } from "react";
import { Plus, X, Download } from "lucide-react";
import type { Plugin } from "../../types";

interface ImportModalProps {
	onClose: () => void;
	onImport: (plugin: Plugin) => void;
	onInstall: (url: string, name: string) => Promise<void>;
}

export const ImportModal: React.FC<ImportModalProps> = ({
	onClose,
	onImport,
	onInstall,
}) => {
	const [activeTab, setActiveTab] = useState<"install" | "json">("install");
	const [importJson, setImportJson] = useState("");
	const [loading, setLoading] = useState(false);

	// Hardcoded popular feeds for demo purposes
	// In a real app, we'd fetch the XML feed from Zeal
	const AVAILABLE_DOCSETS = [
		{
			id: "go",
			name: "Go",
			url: "http://tokyo.kapeli.com/feeds/Go.tgz",
			icon: "go",
		},
		{
			id: "java",
			name: "Java SE 11",
			url: "http://tokyo.kapeli.com/feeds/Java_SE11.tgz",
			icon: "java",
		},
		{
			id: "rust",
			name: "Rust",
			url: "http://tokyo.kapeli.com/feeds/Rust.tgz",
			icon: "rust",
		},
	];

	const handleImportJson = () => {
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
			onImport(newPlugin);
			setImportJson("");
			onClose();
		} catch (e: any) {
			alert("Invalid JSON: " + e.message);
		}
	};

	const handleInstall = async (docset: (typeof AVAILABLE_DOCSETS)[0]) => {
		setLoading(true);
		try {
			await onInstall(docset.url, docset.name);
			onClose();
		} catch (e: any) {
			alert("Failed to install: " + e.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
			<div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] ring-1 ring-slate-200 dark:ring-slate-800">
				{/* Header */}
				<div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
					<h2 className="text-xl font-bold flex items-center gap-2">
						<Plus className="w-5 h-5 text-blue-500" />
						Add Documentation
					</h2>
					<button
						onClick={onClose}
						className="text-slate-500 hover:text-slate-700"
					>
						<X size={24} />
					</button>
				</div>

				{/* Tabs */}
				<div className="flex border-b border-slate-200 dark:border-slate-800 px-6 gap-6">
					<button
						className={`py-3 text-sm font-medium border-b-2 transition-colors ${
							activeTab === "install"
								? "border-blue-500 text-blue-600"
								: "border-transparent text-slate-500 hover:text-slate-700"
						}`}
						onClick={() => setActiveTab("install")}
					>
						Install from Feed
					</button>
					<button
						className={`py-3 text-sm font-medium border-b-2 transition-colors ${
							activeTab === "json"
								? "border-blue-500 text-blue-600"
								: "border-transparent text-slate-500 hover:text-slate-700"
						}`}
						onClick={() => setActiveTab("json")}
					>
						Import JSON
					</button>
				</div>

				<div className="p-6 flex-1 overflow-hidden flex flex-col">
					{activeTab === "install" ? (
						<div className="space-y-4 overflow-y-auto">
							<p className="text-sm text-slate-500">
								Select a documentation set to download and install.
							</p>
							<div className="grid grid-cols-1 gap-3">
								{AVAILABLE_DOCSETS.map((docset) => (
									<div
										key={docset.id}
										className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors"
									>
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm text-lg font-bold text-slate-700 dark:text-slate-300">
												{docset.name.substring(0, 2)}
											</div>
											<div>
												<div className="font-medium">{docset.name}</div>
												<div className="text-xs text-slate-500">
													Official Docset
												</div>
											</div>
										</div>
										<button
											onClick={() => handleInstall(docset)}
											disabled={loading}
											className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2"
										>
											{loading ? (
												"Installing..."
											) : (
												<>
													<Download size={14} /> Install
												</>
											)}
										</button>
									</div>
								))}
							</div>
						</div>
					) : (
						<div className="flex-1 flex flex-col h-full">
							<p className="text-sm text-slate-500 mb-4">
								Paste JSON content directly.
							</p>
							<textarea
								value={importJson}
								onChange={(e) => setImportJson(e.target.value)}
								placeholder='{"id": "custom", ...}'
								className="flex-1 w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
							/>
						</div>
					)}
				</div>

				{activeTab === "json" && (
					<div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
						<button
							onClick={onClose}
							className="px-4 py-2 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={handleImportJson}
							className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-95"
						>
							Load Plugin
						</button>
					</div>
				)}
			</div>
		</div>
	);
};
