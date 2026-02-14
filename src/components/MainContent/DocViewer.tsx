import React from "react";
import { Book, Menu } from "lucide-react";
import type { Plugin, Section } from "../../types";

interface DocViewerProps {
  activeDoc: Section | undefined;
  activePlugin: Plugin | undefined;
  sidebarOpen: boolean;
  onOpenSidebar: () => void;
}

export const DocViewer: React.FC<DocViewerProps> = ({
  activeDoc,
  activePlugin,
  sidebarOpen,
  onOpenSidebar,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full relative min-w-0">
      {/* Mobile Header Toggle */}
      {!sidebarOpen && (
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={onOpenSidebar}
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
  );
};
