import React, { type RefObject } from "react";
import { ChevronRight, Search, X } from "lucide-react";
import type { Plugin, Section } from "../../types";

interface NavigationPanelProps {
  activePlugin: Plugin | undefined;
  activeDocId: string | null;
  onSelectDoc: (id: string) => void;
  onCloseSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredSections: Section[];
  searchInputRef: RefObject<HTMLInputElement | null>;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  activePlugin,
  activeDocId,
  onSelectDoc,
  onCloseSidebar,
  searchQuery,
  setSearchQuery,
  filteredSections,
  searchInputRef,
}) => {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Panel Header */}
      <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="min-w-0">
          <h2 className="font-bold text-sm truncate leading-tight">
            {activePlugin?.name || "DevDocs"}
          </h2>
          <p className="text-[10px] text-slate-500 font-mono truncate">
            {activePlugin ? `v${activePlugin.version}` : "No plugin selected"}
          </p>
        </div>
        <button
          onClick={onCloseSidebar}
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
                onClick={() => onSelectDoc(section.id)}
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
  );
};
