import { useShared } from "@/hooks/use-shared";
import { usePlans } from "@/hooks/use-plans";
import { useGame } from "@/hooks/use-game";
import { useActions } from "@/hooks";

export function DevDiagnostics() {
  const { filteredData } = useActions();
  const { me, partner, docId, shared } = useShared();
  const { plan } = usePlans();
  const { game } = useGame(filteredData.length);

  return (
    <div className="mt-3 text-xs bg-slate-900/70 text-white rounded p-3 grid gap-1">
      <div>Diagnostics</div>
      <div>me={me}</div>
      <div>partner={partner}</div>
      <div>docId={docId}</div>
      <div>linked={String(shared?.linked)}</div>
      <div>shared.randomPoseId={String(shared?.randomPoseId)}</div>
      <div>plan.status={String(plan?.status)}</div>
      <div>game.active={String(game?.active)}</div>
      <div>game.streak={String(game?.streak)}</div>
    </div>
  );
}

