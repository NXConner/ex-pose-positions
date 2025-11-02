import { useState } from "react";
import { performanceMonitor } from "@/utils/performance-monitor";
import { analytics } from "@/services/analytics";
import { keyboardShortcuts } from "@/utils/keyboard-shortcuts";

export function DevTools() {
  const [activeTab, setActiveTab] = useState<"performance" | "analytics" | "shortcuts">("performance");

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="neon-card rounded-lg p-4 w-80 max-h-96 overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold neon-accent">Dev Tools</h4>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("performance")}
              className={`text-xs px-2 py-1 rounded ${activeTab === "performance" ? "bg-pink-600" : "bg-slate-700"}`}
            >
              Perf
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`text-xs px-2 py-1 rounded ${activeTab === "analytics" ? "bg-pink-600" : "bg-slate-700"}`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab("shortcuts")}
              className={`text-xs px-2 py-1 rounded ${activeTab === "shortcuts" ? "bg-pink-600" : "bg-slate-700"}`}
            >
              Keys
            </button>
          </div>
        </div>

        {activeTab === "performance" && (
          <div className="text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span>Metrics:</span>
              <button
                onClick={() => performanceMonitor.clear()}
                className="text-xs bg-slate-700 px-2 py-1 rounded"
              >
                Clear
              </button>
            </div>
            <div className="max-h-60 overflow-auto space-y-1">
              {performanceMonitor.getSummary() && Object.entries(performanceMonitor.getSummary()).map(([name, data]) => (
                <div key={name} className="bg-slate-900 p-2 rounded text-xs">
                  <div className="font-semibold">{name}</div>
                  <div>Count: {data.count}</div>
                  <div>Avg: {data.avg.toFixed(2)}ms</div>
                  <div>Min: {data.min.toFixed(2)}ms</div>
                  <div>Max: {data.max.toFixed(2)}ms</div>
                </div>
              ))}
              {Object.keys(performanceMonitor.getSummary()).length === 0 && (
                <div className="text-slate-400">No metrics yet</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span>Analytics:</span>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={analytics.isEnabled()}
                  onChange={(e) => analytics.setEnabled(e.target.checked)}
                  className="w-3 h-3"
                />
                Enable
              </label>
            </div>
            <div className="max-h-60 overflow-auto space-y-1">
              {Object.entries(analytics.getSummary()).map(([key, count]) => (
                <div key={key} className="bg-slate-900 p-2 rounded text-xs">
                  {key}: {count}
                </div>
              ))}
              {Object.keys(analytics.getSummary()).length === 0 && (
                <div className="text-slate-400">No events</div>
              )}
            </div>
            <button
              onClick={() => analytics.clear()}
              className="text-xs bg-slate-700 px-2 py-1 rounded w-full"
            >
              Clear Analytics
            </button>
          </div>
        )}

        {activeTab === "shortcuts" && (
          <div className="text-xs space-y-1 max-h-60 overflow-auto">
            {keyboardShortcuts.getAll().map((shortcut, idx) => {
              const keys: string[] = [];
              if (shortcut.ctrlKey || shortcut.metaKey) keys.push("Ctrl");
              if (shortcut.shiftKey) keys.push("Shift");
              if (shortcut.altKey) keys.push("Alt");
              keys.push(shortcut.key);
              
              return (
                <div key={idx} className="bg-slate-900 p-2 rounded">
                  <div className="font-semibold">{shortcut.description}</div>
                  <div className="text-slate-400">{keys.join(" + ")}</div>
                </div>
              );
            })}
            {keyboardShortcuts.getAll().length === 0 && (
              <div className="text-slate-400">No shortcuts registered</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

