export function QuickJump() {
  const items = [
    { id: 'tonight', label: 'Tonight' },
    { id: 'plans', label: "Tonight's Plans" },
    { id: 'lists', label: 'My Lists' },
    { id: 'game', label: 'Game' },
    { id: 'stats', label: 'Stats' },
    { id: 'settings', label: 'Settings' },
    { id: 'profile', label: 'Profile' },
  ];
  return (
    <nav className="sticky top-16 z-30 w-full overflow-auto py-2 scrollbar-none">
      <ul className="flex gap-2 flex-wrap">
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className="text-xs bg-slate-900/70 text-white rounded px-2 py-1 neon-focus">
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

