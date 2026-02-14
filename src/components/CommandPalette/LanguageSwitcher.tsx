import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, Keyboard } from "lucide-react";
import type { Plugin } from "../../types";
import { PluginIcon } from "../PluginIcon";

interface LanguageSwitcherProps {
	plugins: Plugin[];
	onClose: () => void;
	onSelectPlugin: (id: string) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
	plugins,
	onClose,
	onSelectPlugin,
}) => {
	const [switcherQuery, setSwitcherQuery] = useState("");
	const [switcherSelectedIndex, setSwitcherSelectedIndex] = useState(0);
	const switcherInputRef = useRef<HTMLInputElement>(null);
	const switcherListRef = useRef<HTMLDivElement>(null);

	// Filter plugins based on query
	const filteredPlugins = useMemo(() => {
		if (!switcherQuery) return plugins;
		return plugins.filter((p) =>
			p.name.toLowerCase().includes(switcherQuery.toLowerCase()),
		);
	}, [plugins, switcherQuery]);

	// Reset selected index when query changes
	useEffect(() => {
		setSwitcherSelectedIndex(0);
	}, [switcherQuery]);

	// Focus input on mount
	useEffect(() => {
		const timer = setTimeout(() => {
			switcherInputRef.current?.focus();
		}, 50);
		return () => clearTimeout(timer);
	}, []);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSwitcherSelectedIndex((prev) => (prev + 1) % filteredPlugins.length);
			// Optional: scroll into view logic here if list is long
			// switcherListRef.current?.children[switcherSelectedIndex]?.scrollIntoView({ block: "nearest" });
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSwitcherSelectedIndex(
				(prev) => (prev - 1 + filteredPlugins.length) % filteredPlugins.length,
			);
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (filteredPlugins.length > 0) {
				const selected = filteredPlugins[switcherSelectedIndex];
				onSelectPlugin(selected.id);
				onClose();
			}
		} else if (e.key === "Escape") {
			onClose();
		}
	};

	return (
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
						onKeyDown={handleKeyDown}
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
								onClick={() => {
									onSelectPlugin(plugin.id);
									onClose();
								}}
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
									className={`p-1 rounded ${
										idx === switcherSelectedIndex
											? "bg-white/20"
											: "bg-slate-100 dark:bg-slate-800"
									}`}
								>
									<PluginIcon
										type={plugin.icon}
										className={`w-4 h-4 ${
											idx === switcherSelectedIndex ? "text-white" : ""
										}`}
									/>
								</div>
								<div className="flex-1">
									<div className="font-medium text-sm">{plugin.name}</div>
									<div
										className={`text-xs ${
											idx === switcherSelectedIndex
												? "text-blue-100"
												: "text-slate-500"
										}`}
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
	);
};
