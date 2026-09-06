export const STATUS_LABELS = {
  a: "Available",
  d: "Doubtful",
  i: "Injured",
  s: "Suspended",
  u: "Unavailable",
  n: "Not available",
};

export function parseNum(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatPrice(nowCost) {
  return `£${(nowCost / 10).toFixed(1)}m`;
}

export function formatPercent(value) {
  const n = parseNum(value);
  return `${n.toFixed(1)}%`;
}

export function formatOne(value) {
  return parseNum(value).toFixed(1);
}

export function formatKickoff(iso) {
  if (!iso) return "TBC";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "TBC";
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDeadline(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function countdownTo(iso) {
  if (!iso) return "";
  const target = new Date(iso).getTime();
  const delta = target - Date.now();
  if (delta <= 0) return "Deadline passed";
  const hours = Math.floor(delta / 3_600_000);
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  if (days > 0) return `${days}d ${remHours}h`;
  const minutes = Math.floor((delta % 3_600_000) / 60_000);
  return `${hours}h ${minutes}m`;
}

export function positionShort(elementType) {
  return { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" }[elementType] ?? "?";
}

export function fdrClass(difficulty) {
  const n = Number(difficulty);
  if (n <= 1) return "fdr-1";
  if (n === 2) return "fdr-2";
  if (n === 3) return "fdr-3";
  if (n === 4) return "fdr-4";
  return "fdr-5";
}
