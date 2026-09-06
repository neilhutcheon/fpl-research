import { STATUS_LABELS } from "../lib/format.js";

export function StatusBadge({ player }) {
  const label = STATUS_LABELS[player.status] || player.status;
  return (
    <span className={`status-${player.status}`} title={player.news || label}>
      {player.status === "a" ? "✓" : label}
    </span>
  );
}

export function PosBadge({ position }) {
  return <span className={`badge pos-${position}`}>{position}</span>;
}
