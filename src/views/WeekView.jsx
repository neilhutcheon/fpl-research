import { useMemo } from "react";
import { teamBadgeUrl } from "../api/fpl.js";
import { useFpl } from "../context/FplData.jsx";
import { fixturesByEvent, scoreline } from "../lib/fixtures.js";
import { formatKickoff, formatOne } from "../lib/format.js";
import { differentials, pickResearchXi } from "../lib/rank.js";
import { FdrBadge } from "../components/FdrBadge.jsx";
import { PlayerTable } from "../components/PlayerTable.jsx";

export function WeekView() {
  const { fixtures, researchEvent, teamsById, players, difficultyMap, setSelectedPlayer } = useFpl();
  const weekFixtures = useMemo(
    () => fixturesByEvent(fixtures, researchEvent?.id),
    [fixtures, researchEvent],
  );
  const xi = useMemo(() => pickResearchXi(players, difficultyMap), [players, difficultyMap]);
  const diffs = useMemo(() => differentials(players, difficultyMap), [players, difficultyMap]);
  const news = useMemo(
    () =>
      players
        .filter((p) => p.news && p.status !== "a")
        .sort((a, b) => b.own - a.own)
        .slice(0, 8),
    [players],
  );

  const byPos = { 1: [], 2: [], 3: [], 4: [] };
  for (const player of xi) byPos[player.element_type].push(player);

  return (
    <>
      <div className="section-title">
        <h2>{researchEvent?.name ?? "Gameweek"} fixtures</h2>
        <span>Click a player anywhere to open full history</span>
      </div>
      <div className="fixture-row">
        {weekFixtures.map((fx) => {
          const home = teamsById[fx.team_h];
          const away = teamsById[fx.team_a];
          return (
            <div key={fx.id} className="fx-card" style={{ cursor: "default" }}>
              <header>
                <span>{formatKickoff(fx.kickoff_time)}</span>
                <span>{fx.finished || fx.started ? "Live/done" : "Upcoming"}</span>
              </header>
              <div className="clubs">
                <span>
                  {home && <img src={teamBadgeUrl(home)} alt="" />} {home?.short_name}
                </span>
                <span className="score">{scoreline(fx) || "vs"}</span>
                <span>
                  {away?.short_name} {away && <img src={teamBadgeUrl(away)} alt="" />}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <FdrBadge difficulty={fx.team_h_difficulty} />
                <FdrBadge difficulty={fx.team_a_difficulty} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid-2">
        <section className="panel">
          <div className="section-title">
            <h2>Research XI</h2>
            <span>Form + xPts + fixture ease, 1-4-4-2</span>
          </div>
          <div className="xi">
            {[1, 2, 3, 4].map((pos) => (
              <div className="xi-row" key={pos}>
                {byPos[pos].map((player) => (
                  <button key={player.id} className="xi-card" onClick={() => setSelectedPlayer(player)}>
                    <span className="sub">{player.teamShort} {player.position}</span>
                    <b>{player.web_name}</b>
                    <span className="sub">
                      xPts {formatOne(player.ep_next)} · FDR {player.nextFixture?.difficulty ?? "–"}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="section-title">
            <h2>Differentials & flags</h2>
            <span>Low ownership, in form, likely to play</span>
          </div>
          {diffs.map((player) => (
            <div key={player.id} className="news-item" style={{ cursor: "pointer" }} onClick={() => setSelectedPlayer(player)}>
              <strong>{player.web_name}</strong> ({player.teamShort}) · form {formatOne(player.form)} · {formatOne(player.own)}% owned
            </div>
          ))}
          <h3>Availability news</h3>
          {news.map((player) => (
            <div key={player.id} className="news-item">
              <strong>{player.web_name}</strong> · {player.news}
            </div>
          ))}
        </section>
      </div>
      <section className="panel" style={{ marginTop: 16 }}>
        <div className="section-title">
          <h2>All players this week</h2>
          <span>Sorted by start score</span>
        </div>
        <PlayerTable players={players.filter((p) => p.minutes > 0 || p.status === "a")} />
      </section>
    </>
  );
}
