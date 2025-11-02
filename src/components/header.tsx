const GitHubStarsBadgeURL =
  "https://img.shields.io/github/stars/raminr77/random-sex-position?style=social&link=https%3A%2F%2Fgithub.com%2Framinr77%2Frandom-sex-position";

import { VersionBadge } from "./version-badge";
import { RandomDice } from "./random-dice";

export function Header() {
  return (
    <header className="w-full flex flex-col items-center gap-4 my-5 sticky top-0 z-40 backdrop-blur-sm bg-white/60 dark:bg-black/40 border-b border-white/10">
      <div className="w-full flex items-center justify-between gap-3">
        <h3 className="text-2xl lato-bold neon-accent">Random Sex Position</h3>
        <div className="flex items-center gap-3">
          <RandomDice />
          <VersionBadge />
        </div>
      </div>
      <img alt="GitHub Repo stars" src={GitHubStarsBadgeURL} />
    </header>
  );
}
