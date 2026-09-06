import { useEffect, useState } from "react";
import { fetchPlayerSummary, playerPhotoUrl, teamBadgeUrl } from "../api/fpl.js";
import { useFpl } from "../context/FplData.jsx";
import { formatKickoff, formatOne, formatPrice } from "../lib/format.js";
import { FdrBadge } from "./FdrBadge.jsx";
import { PosBadge, StatusBadge } from "./StatusBadge.jsx";

export function PlayerDrawer() {
  const { selectedPlayer, setSelectedPlayer, teamsById } = useFpl();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedPlayer) return undefined;
    let cancelled = false;
    setSummary(null);
    setError("");
    fetchPlayerSummary(selectedPlayer.id)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPlayer]);

  if (!selectedPlayer) return null;
  const player = selectedPlayer;
  const team = teamsById[player.team];
  const history = [...(summary?.history ?? [])].reverse();
  const upcoming = summary?.fixtures?.slice(0, 6) ?? [];
  const past = [...(summary?.history_past ?? [])].reverse().slice(0, 4);

  return (
    <div className="drawer-backdrop drawer-front" onClick={() => setSelectedPlayer(null)}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <header>
          <div className="player-cell">
            <img src={playerPhotoUrl(player)} alt="" />
            <div>
              <h2 style={{ margin: 0 }}>{player.web_name}</h2>
              <div className="sub">
                {player.first_name} {player.second_name}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                {team && <img src={teamBadgeUrl(team)} alt="" width="20" height="20" />}
                <PosBadge position={player.position} />
                <StatusBadge player={player} />
              </div>
            </div>
          </div>
          <button onClick={() => setSelectedPlayer(null)}>Close</button>
        </header>
        {player.news && <p className="news-item">{player.news}</p>}
        <div className="stat-grid">
          <Stat label="Price" value={formatPrice(player.now_cost)} />
          <Stat label="Form" value={formatOne(player.form)} />
          <Stat label="xPts next" value={formatOne(player.ep_next)} />
          <Stat label="Total pts" value={player.total_points} />
          <Stat label="xG" value={formatOne(player.xg)} />
          <Stat label="xA" value={formatOne(player.xa)} />
          <Stat label="Own %" value={formatOne(player.own)} />
          <Stat label="Start score" value={formatOne(player.startScore)} />
        </div>
        {error && <p className="error">{error}</p>}
        {!summary && !error && <p className="empty">Loading gameweek history…</p>}
        {summary && (
          <>
            <h3>Recent gameweeks</h3>
            <div className="table-wrap" style={{ maxHeight: 240 }}>
              <table>
                <thead>
                  <tr>
                    <th>GW</th>
                    <th>Opp</th>
                    <th>Pts</th>
                    <th>Min</th>
                    <th>G</th>
                    <th>A</th>
                    <th>xGI</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 8).map((row) => {
                    const opp = teamsById[row.opponent_team];
                    return (
                      <tr key={`${row.round}-${row.fixture}`}>
                        <td>{row.round}</td>
                        <td>
                          {row.was_home ? "H" : "A"} {opp?.short_name}
                        </td>
                        <td>{row.total_points}</td>
                        <td>{row.minutes}</td>
                        <td>{row.goals_scored}</td>
                        <td>{row.assists}</td>
                        <td>{formatOne(row.expected_goal_involvements)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <h3>Upcoming</h3>
            <div className="fdr-pips" style={{ marginBottom: 12 }}>
              {upcoming.map((fx) => (
                <div key={fx.id} title={formatKickoff(fx.kickoff_time)} style={{ textAlign: "center" }}>
                  <FdrBadge difficulty={fx.difficulty} />
                  <div className="sub">
                    {fx.is_home ? "H" : "A"} {teamsById[fx.is_home ? fx.team_a : fx.team_h]?.short_name}
                  </div>
                </div>
              ))}
            </div>
            {past.length > 0 && (
              <>
                <h3>Previous seasons</h3>
                {past.map((season) => (
                  <div key={season.season_name} className="news-item">
                    <strong>{season.season_name}</strong> · {season.total_points} pts · {season.goals_scored}G {season.assists}A · {season.minutes} mins
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
