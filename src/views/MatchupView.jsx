import { useMemo, useState } from "react";
import { teamBadgeUrl } from "../api/fpl.js";
import { useFpl } from "../context/FplData.jsx";
import { fixturesByEvent, scoreline } from "../lib/fixtures.js";
import { formatKickoff, formatOne } from "../lib/format.js";
import { FdrBadge } from "../components/FdrBadge.jsx";
import { PlayerCell } from "../components/PlayerCell.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";

export function MatchupView() {
  const { events, fixtures, teamsById, players, liveById, currentEvent, researchEvent, setSelectedPlayer } =
    useFpl();
  const [eventId, setEventId] = useState(currentEvent?.id ?? researchEvent?.id);
  const weekFixtures = useMemo(() => fixturesByEvent(fixtures, eventId), [eventId, fixtures]);
  const [fixtureId, setFixtureId] = useState(weekFixtures[0]?.id);
  const fixture = weekFixtures.find((fx) => fx.id === fixtureId) || weekFixtures[0];
  const live = liveById[eventId] || {};

  const homePlayers = useMemo(
    () => relevantSquad(players, fixture?.team_h, live),
    [fixture, live, players],
  );
  const awayPlayers = useMemo(
    () => relevantSquad(players, fixture?.team_a, live),
    [fixture, live, players],
  );

  if (!fixture) return <div className="empty">No fixtures for this gameweek.</div>;

  const home = teamsById[fixture.team_h];
  const away = teamsById[fixture.team_a];

  return (
    <div className="match-grid">
      <aside>
        <div className="filters">
          <select value={eventId} onChange={(e) => { setEventId(Number(e.target.value)); setFixtureId(null); }}>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>
        <div className="match-list">
          {weekFixtures.map((fx) => (
            <button
              key={fx.id}
              className={`match-card ${fx.id === fixture.id ? "selected" : ""}`}
              onClick={() => setFixtureId(fx.id)}
            >
              <header>
                <span>{formatKickoff(fx.kickoff_time)}</span>
                <span>{scoreline(fx) || "vs"}</span>
              </header>
              <div className="clubs">
                <span>{teamsById[fx.team_h]?.short_name}</span>
                <span>{teamsById[fx.team_a]?.short_name}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>
      <section className="panel">
        <div className="section-title">
          <h2>
            {home?.name} vs {away?.name}
          </h2>
          <span>{formatKickoff(fixture.kickoff_time)} · {scoreline(fixture) || "Not started"}</span>
        </div>
        <div className="clubs" style={{ marginBottom: 12 }}>
          <span>
            {home && <img src={teamBadgeUrl(home)} alt="" />} {home?.short_name}{" "}
            <FdrBadge difficulty={fixture.team_h_difficulty} />
          </span>
          <span className="score">{scoreline(fixture) || "vs"}</span>
          <span>
            <FdrBadge difficulty={fixture.team_a_difficulty} /> {away?.short_name}{" "}
            {away && <img src={teamBadgeUrl(away)} alt="" />}
          </span>
        </div>
        <div className="sides">
          <SquadSide title={home?.name} players={homePlayers} live={live} onSelect={setSelectedPlayer} />
          <SquadSide title={away?.name} players={awayPlayers} live={live} onSelect={setSelectedPlayer} />
        </div>
      </section>
    </div>
  );
}

function relevantSquad(players, teamId, live) {
  return players
    .filter((p) => p.team === teamId)
    .map((p) => ({ ...p, live: live[p.id]?.stats }))
    .filter((p) => (p.live?.minutes ?? 0) > 0 || p.minutes > 0 || p.status === "a")
    .sort((a, b) => (b.live?.total_points ?? b.startScore) - (a.live?.total_points ?? a.startScore));
}

function SquadSide({ title, players, live, onSelect }) {
  return (
    <div>
      <h3>{title}</h3>
      <div className="table-wrap" style={{ maxHeight: "58vh" }}>
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>GW pts</th>
              <th>Min</th>
              <th>G/A</th>
              <th>xGI</th>
              <th>Form</th>
            </tr>
          </thead>
          <tbody>
            {players.slice(0, 18).map((player) => {
              const stats = live[player.id]?.stats;
              return (
                <tr
                  key={player.id}
                  className="clickable"
                  tabIndex={0}
                  onClick={() => onSelect(player)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onSelect(player);
                  }}
                >
                  <td>
                    <PlayerCell player={player} />
                    <StatusBadge player={player} />
                  </td>
                  <td>{stats?.total_points ?? "–"}</td>
                  <td>{stats?.minutes ?? "–"}</td>
                  <td>
                    {stats ? `${stats.goals_scored}/${stats.assists}` : "–"}
                  </td>
                  <td>{stats ? formatOne(stats.expected_goal_involvements) : formatOne(player.xgi)}</td>
                  <td>{formatOne(player.form)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
