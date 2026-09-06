import { useMemo, useState } from "react";
import { teamBadgeUrl } from "../api/fpl.js";
import { useFpl } from "../context/FplData.jsx";
import { averageFdr, upcomingFixtures } from "../lib/fixtures.js";
import { formatOne } from "../lib/format.js";
import { FdrPips } from "../components/FdrBadge.jsx";
import { PlayerTable } from "../components/PlayerTable.jsx";

export function TeamView() {
  const { teams, teamsById, players, fixtures, researchEvent } = useFpl();
  const [teamId, setTeamId] = useState(teams[0]?.id ?? 1);
  const [pos, setPos] = useState("ALL");
  const [query, setQuery] = useState("");

  const upcoming = useMemo(
    () => upcomingFixtures(fixtures, teamId, researchEvent?.id ?? 1, 6),
    [fixtures, researchEvent, teamId],
  );
  const avg = averageFdr(upcoming);
  const squad = useMemo(() => {
    return players.filter((p) => {
      if (p.team !== teamId) return false;
      if (pos !== "ALL" && p.position !== pos) return false;
      if (query && !p.web_name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [players, pos, query, teamId]);

  const team = teamsById[teamId];

  return (
    <>
      <div className="team-grid">
        {teams.map((item) => (
          <button
            key={item.id}
            className={`team-card ${item.id === teamId ? "selected" : ""}`}
            onClick={() => setTeamId(item.id)}
          >
            <img src={teamBadgeUrl(item)} alt="" />
            <div>
              <div className="name">{item.short_name}</div>
              <div className="sub">{item.name}</div>
            </div>
          </button>
        ))}
      </div>
      <section className="panel">
        <div className="section-title">
          <h2>{team?.name} squad</h2>
          <span>
            Next {upcoming.length} FDR avg {avg == null ? "–" : formatOne(avg)}{" "}
            <FdrPips fixtures={upcoming} teamsById={teamsById} />
          </span>
        </div>
        <div className="filters">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search player" />
          {["ALL", "GKP", "DEF", "MID", "FWD"].map((code) => (
            <button key={code} className={pos === code ? "active" : ""} onClick={() => setPos(code)} style={{
              border: 0,
              borderRadius: 999,
              padding: "8px 12px",
              background: pos === code ? "var(--green)" : "var(--bg-2)",
              color: pos === code ? "#042015" : "inherit",
              cursor: "pointer",
            }}>
              {code}
            </button>
          ))}
        </div>
        <PlayerTable players={squad} />
      </section>
    </>
  );
}
