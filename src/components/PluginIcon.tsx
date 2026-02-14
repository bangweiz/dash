import { Book, Coffee, Settings } from "lucide-react";
import React from "react";

interface PluginIconProps {
	type: string;
	className?: string;
}

export const PluginIcon: React.FC<PluginIconProps> = ({ type, className }) => {
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
