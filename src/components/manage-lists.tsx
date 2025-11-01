import { DEFAULT_LISTS, useLists } from "@/hooks/use-lists";
import { useActions } from "@/hooks";

type ManageListsProps = {
  open: boolean;
  onClose: () => void;
};

export function ManageLists({ open, onClose }: ManageListsProps) {
  const { activePosition } = useActions();
  const { mine, togglePoseInList } = useLists();

  if (!open || !activePosition) return null;
  const current = mine.find((x) => x.poseId === activePosition.id) || { lists: [] } as any;

  function renderCheckbox(name: string) {
    const checked = current.lists.includes(name);
    return (
      <label key={name} className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => togglePoseInList(activePosition.id, name, e.target.checked)}
        />
        {name}
      </label>
    );
  }

  let customName = "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="neon-card rounded-md p-4 max-w-md w-full">
        <div className="text-lg neon-accent mb-2">Manage Lists</div>
        <div className="grid gap-2 mb-3">
          {DEFAULT_LISTS.map(renderCheckbox)}
        </div>
        <div className="flex items-center gap-2 mb-3">
          <input className="bg-slate-900 text-white rounded px-2 py-1 w-full" placeholder="New list name..." onChange={(e) => { customName = e.target.value; }} />
          <button className="neon-focus bg-slate-800 text-white rounded px-3 py-1" onClick={() => customName && togglePoseInList(activePosition.id, customName, true)}>Add</button>
        </div>
        <div className="text-right">
          <button className="neon-focus bg-slate-800 text-white rounded px-4 py-1" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

