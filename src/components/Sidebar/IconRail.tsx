import React from "react";
import { Box, Plus } from "lucide-react";
import type { Plugin } from "../../types";
import { PluginIcon } from "../PluginIcon";

interface IconRailProps {
  plugins: Plugin[];
  activePluginId: string;
  onSelectPlugin: (id: string) => void;
  onOpenImportModal: () => void;
}

export const IconRail: React.FC<IconRailProps> = ({
  plugins,
  activePluginId,
  onSelectPlugin,
  onOpenImportModal,
}) => {
  return (
    <div className="w-16 flex-shrink-0 flex flex-col items-center py-4 gap-3 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto scrollbar-hide z-10">
      {/* Brand Logo */}
      <div className="mb-2 p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/30">
        <Box size={20} />
      </div>

      <div className="w-8 h-[1px] bg-slate-200 dark:bg-slate-700 mb-1" />

      {/* Plugin Icons List */}
      {plugins.map((plugin) => (
        <div key={plugin.id} className="relative group">
          <button
            onClick={() => onSelectPlugin(plugin.id)}
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
        onClick={onOpenImportModal}
        className="mt-2 w-10 h-10 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
        title="Import JSON Plugin"
      >
        <Plus size={18} />
      </button>

      <div className="flex-1" />

      {/* Keyboard Hint */}
      <div className="mb-2 text-[10px] text-slate-400 font-mono text-center opacity-60">
        ⌘K
      </div>
    </div>
  );
};
