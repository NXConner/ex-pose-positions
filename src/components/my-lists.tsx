import { useMemo } from "react";
import { DEFAULT_LISTS, useLists } from "@/hooks/use-lists";
import { useActions } from "@/hooks";

export function MyLists() {
  const { merged } = useLists();
  const { filteredData } = useActions();
  const { togglePoseInList } = useLists();

  const items = useMemo(() => {
    return merged
      .map((m) => ({
        pose: filteredData.find((p) => p.id === m.poseId),
        lists: m.lists,
      }))
      .filter((x) => x.pose);
  }, [merged, filteredData]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const idxStr = e.dataTransfer.getData('text/pose-index');
    if (!idxStr) return;
    // Open Manage Lists by simulating click on the card's button via a custom event
    document.dispatchEvent(new CustomEvent('open-manage-lists', { detail: { fromDrop: true } }));
  }

  function onDragOver(e: React.DragEvent) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }

  function onDropChip(e: React.DragEvent, listName: string) {
    e.preventDefault();
    const idxStr = e.dataTransfer.getData('text/pose-index');
    const idx = Number(idxStr);
    if (!Number.isFinite(idx)) return;
    const item = filteredData[idx];
    if (!item) return;
    togglePoseInList(item.id, listName, true);
  }

  function onDragOverChip(e: React.DragEvent) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }

  return (
    <section className="w-full neon-card rounded-md p-4 flex flex-col gap-3" onDrop={onDrop} onDragOver={onDragOver}>
      <h4 className="text-lg neon-accent">My Lists</h4>
      <div className="text-xs text-slate-300">Drop the position image onto a list chip to add it instantly.</div>
      <div className="flex gap-2 flex-wrap">
        {DEFAULT_LISTS.map((name) => (
          <span
            key={name}
            onDrop={(e)=>onDropChip(e, name)}
            onDragOver={onDragOverChip}
            className="text-xs bg-slate-800 rounded px-2 py-1 border border-slate-600 hover:border-pink-500"
            title={`Drop here to add to ${name}`}
          >
            {name}
          </span>
        ))}
      </div>
      {items.length === 0 && <div className="text-sm text-slate-400">No saved poses yet</div>}
      <div className="grid gap-2">
        {items.map(({ pose, lists }) => (
          <div key={pose!.id} className="flex items-center justify-between bg-slate-900/60 rounded px-2 py-2">
            <div className="text-sm text-white">#{pose!.id} {pose!.title}</div>
            <div className="flex gap-1 flex-wrap">
              {lists.map((l) => (
                <span key={l} className="text-xs bg-slate-800 rounded px-2 py-0.5">{l}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

