import { useMemo, useState } from "react";
import { useFpl } from "../context/FplData.jsx";
import { formatOne, formatPrice } from "../lib/format.js";
import { FdrPips } from "../components/FdrBadge.jsx";
import { PlayerCell } from "../components/PlayerCell.jsx";

export function CompareView() {
  const { players, teamsById, setSelectedPlayer } = useFpl();
  const [query, setQuery] = useState("");
  const [picks, setPicks] = useState([]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return players
      .filter((p) => p.web_name.toLowerCase().includes(q) || p.second_name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [players, query]);

  function addPlayer(player) {
    setPicks((current) => {
      if (current.some((p) => p.id === player.id) || current.length >= 3) return current;
      return [...current, player];
    });
    setQuery("");
  }

  const verdict = useMemo(() => {
    if (picks.length < 2) return null;
    const best = [...picks].sort((a, b) => b.startScore - a.startScore)[0];
    const rest = picks.filter((p) => p.id !== best.id);
    return { best, rest };
  }, [picks]);

  return (
    <section className="panel">
      <div className="section-title">
        <h2>Trade compare</h2>
        <span>Add 2–3 players to weigh form, fixtures, xGI, and price</span>
      </div>
      <div className="filters">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a player to add"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="compare-picks">
          {suggestions.map((player) => (
            <button key={player.id} className="team-card" onClick={() => addPlayer(player)}>
              {player.web_name} · {player.teamShort} · {formatPrice(player.now_cost)}
            </button>
          ))}
        </div>
      )}
      <div className="compare-picks">
        {picks.map((player) => (
          <button key={player.id} className="pill" onClick={() => setPicks((c) => c.filter((p) => p.id !== player.id))}>
            {player.web_name} ✕
          </button>
        ))}
      </div>
      {picks.length === 0 && <div className="empty">Search and add players you are considering transferring.</div>}
      <div className="compare-grid">
        {picks.map((player) => (
              <article key={player.id} className="fx-card" style={{ cursor: "pointer" }} onClick={() => setSelectedPlayer(player)}>
            <PlayerCell player={player} />
            <div className="stat-grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 10 }}>
              <Mini label="Price" value={formatPrice(player.now_cost)} />
              <Mini label="Form" value={formatOne(player.form)} />
              <Mini label="xPts" value={formatOne(player.ep_next)} />
              <Mini label="Pts" value={player.total_points} />
              <Mini label="xGI" value={formatOne(player.xgi)} />
              <Mini label="Own %" value={formatOne(player.own)} />
              <Mini label="Mins" value={player.minutes} />
              <Mini label="Start" value={formatOne(player.startScore)} />
            </div>
            <div className="sub" style={{ marginTop: 8 }}>
              Next 5 <FdrPips fixtures={player.upcoming} teamsById={teamsById} />
            </div>
          </article>
        ))}
      </div>
      {verdict && (
        <div className="verdict">
          <strong>{verdict.best.web_name}</strong> currently grades best for the upcoming fixtures
          (start score {formatOne(verdict.best.startScore)}
          {verdict.rest.length ? ` vs ${verdict.rest.map((p) => `${p.web_name} ${formatOne(p.startScore)}`).join(", ")}` : ""}
          ). Treat this as a research cue, not a captain lock — check minutes risk and news in the player drawer.
        </div>
      )}
    </section>
  );
}

function Mini({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
