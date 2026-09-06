import { fdrClass } from "../lib/format.js";

export function FdrBadge({ difficulty }) {
  if (difficulty == null) return <span className="fdr fdr-3">–</span>;
  return <span className={`fdr ${fdrClass(difficulty)}`}>{difficulty}</span>;
}

export function FdrPips({ fixtures, teamsById }) {
  if (!fixtures?.length) return <span className="sub">No fixtures</span>;
  return (
    <span className="fdr-pips">
      {fixtures.map((fx) => (
        <span
          key={fx.id}
          className={`fdr ${fdrClass(fx.difficulty)}`}
          title={`${fx.isHome ? "H" : "A"} ${teamsById?.[fx.opponentId]?.short_name ?? ""}`}
        >
          {teamsById?.[fx.opponentId]?.short_name?.[0] ?? fx.difficulty}
        </span>
      ))}
    </span>
  );
}
