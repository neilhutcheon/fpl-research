import { useMemo, useState } from "react";
import { useFpl } from "../context/FplData.jsx";
import { useLeague } from "../hooks/useLeague.js";
import {
  DRAFT_LEAGUE_ID,
  OUR_ENTRY_ID,
  freeAgentIds,
  gwScore,
  indexEntries,
  liveStandings,
  matchForEntry,
  matchesForEvent,
  opponentLeagueEntry,
  ownerByElement,
  recordString,
  waiverOrder,
} from "../lib/league.js";
import { formatOne } from "../lib/format.js";
import { ManagerDrawer } from "../components/ManagerDrawer.jsx";
import { PlayerCell } from "../components/PlayerCell.jsx";

export function LeagueView() {
  const { currentEvent, nextEvent, players, liveById, setSelectedPlayer } = useFpl();
  const eventId = currentEvent?.id ?? 3;
  const { status, error, payload } = useLeague(eventId, DRAFT_LEAGUE_ID);
  const [manager, setManager] = useState(null);
  const [pos, setPos] = useState("ALL");
  const [showBoard, setShowBoard] = useState(false);

  const playersById = useMemo(
    () => Object.fromEntries(players.map((player) => [player.id, player])),
    [players],
  );

  const derived = useMemo(() => {
    if (!payload) return null;
    const { byLeagueEntry, byEntryId } = indexEntries(payload.entries);
    const table = liveStandings(payload.entries, payload.matches);
    const thisWeek = matchesForEvent(payload.matches, eventId);
    const nextWeek = matchesForEvent(payload.matches, nextEvent?.id ?? eventId + 1);
    const waivers = waiverOrder(payload.entries);
    const owners = ownerByElement(payload.elementStatus);
    const faIds = freeAgentIds(payload.elementStatus);
    const live = liveById[eventId] || {};
    const fa = faIds
      .map((id) => playersById[id])
      .filter(Boolean)
      .sort((a, b) => b.startScore - a.startScore);
    const rostersByEntry = Object.fromEntries(payload.rosters.map((row) => [row.entry.entry_id, row]));
    return { byLeagueEntry, byEntryId, table, thisWeek, nextWeek, waivers, owners, fa, live, rostersByEntry };
  }, [payload, eventId, nextEvent, liveById, playersById]);

  if (status === "loading" || status === "idle") {
    return <div className="loading">Loading draft league {DRAFT_LEAGUE_ID}…</div>;
  }
  if (status === "error") {
    return <div className="error">{error}</div>;
  }

  const { league, entries, choices, game } = payload;
  const { byLeagueEntry, table, thisWeek, nextWeek, waivers, fa, live, rostersByEntry } = derived;
  const filteredFa = pos === "ALL" ? fa : fa.filter((player) => player.position === pos);
  const ours = entries.find((entry) => entry.entry_id === OUR_ENTRY_ID);

  return (
    <>
      <section className="panel">
        <div className="section-title">
          <h2>{league.name}</h2>
          <span>
            12-team H2H draft · waivers · ID {league.id}
            {ours ? ` · you: ${ours.entry_name}` : ""}
          </span>
        </div>
        <div className="meta">
          <div className="pill">
            Draft <strong>{league.draft_status === "post" ? "complete" : league.draft_status}</strong>
          </div>
          <div className="pill">
            Scoring <strong>H2H (3/1/0)</strong>
          </div>
          <div className="pill">
            Season <strong>GW{league.start_event}–{league.stop_event}</strong>
          </div>
          {game && (
            <div className="pill">
              Waivers <strong>{game.waivers_processed ? "processed" : "pending"}</strong>
            </div>
          )}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <div className="section-title">
          <h2>Live table</h2>
          <span>Projected from live H2H scores — official W-D-L posts when the GW finishes</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                <th>W-D-L</th>
                <th>Pts</th>
                <th>PF</th>
                <th>PA</th>
                <th>GW</th>
                <th>Opp</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => {
                const match = matchForEntry(payload.matches, row.leagueEntryId, eventId);
                const oppId = opponentLeagueEntry(match, row.leagueEntryId);
                const opp = oppId ? byLeagueEntry[oppId] : null;
                const mine = row.entry.entry_id === OUR_ENTRY_ID;
                return (
                  <tr
                    key={row.leagueEntryId}
                    className={`clickable ${mine ? "mine" : ""}`}
                    tabIndex={0}
                    onClick={() => setManager(rostersByEntry[row.entry.entry_id])}
                  >
                    <td>{i + 1}</td>
                    <td>
                      <div className="name">{row.entry.entry_name}</div>
                      <div className="sub">
                        {row.entry.player_first_name} {row.entry.player_last_name}
                        {mine ? " · you" : ""}
                      </div>
                    </td>
                    <td>{recordString(row)}</td>
                    <td>{row.total}</td>
                    <td>{row.pointsFor}</td>
                    <td>{row.pointsAgainst}</td>
                    <td>{gwScore(match, row.leagueEntryId) ?? "–"}</td>
                    <td>{opp ? `${gwScore(match, opp.id)} ${opp.short_name}` : "–"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <MatchList
          title={`Gameweek ${eventId} matchups`}
          matches={thisWeek}
          byLeagueEntry={byLeagueEntry}
          oursId={ours?.id}
          onSelect={(leagueEntryId) => {
            const entry = byLeagueEntry[leagueEntryId];
            if (entry) setManager(rostersByEntry[entry.entry_id]);
          }}
        />
        <MatchList
          title={`Gameweek ${nextEvent?.id ?? eventId + 1} (next)`}
          matches={nextWeek}
          byLeagueEntry={byLeagueEntry}
          oursId={ours?.id}
          onSelect={(leagueEntryId) => {
            const entry = byLeagueEntry[leagueEntryId];
            if (entry) setManager(rostersByEntry[entry.entry_id]);
          }}
        />
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <section className="panel">
          <div className="section-title">
            <h2>Waiver order</h2>
            <span>Priority for the next waiver run</span>
          </div>
          {waivers.map((entry) => (
            <div
              key={entry.id}
              className={`news-item ${entry.entry_id === OUR_ENTRY_ID ? "mine-text" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => setManager(rostersByEntry[entry.entry_id])}
            >
              <strong>{entry.waiver_pick}.</strong> {entry.entry_name}{" "}
              <span className="sub">
                ({entry.player_first_name} {entry.player_last_name})
              </span>
            </div>
          ))}
        </section>
        <section className="panel">
          <div className="section-title">
            <h2>Free agents</h2>
            <span>{filteredFa.length} available · ranked by start score</span>
          </div>
          <div className="filters">
            {["ALL", "GKP", "DEF", "MID", "FWD"].map((code) => (
              <button
                key={code}
                onClick={() => setPos(code)}
                style={{
                  border: 0,
                  borderRadius: 999,
                  padding: "8px 12px",
                  background: pos === code ? "var(--green)" : "var(--bg-2)",
                  color: pos === code ? "#042015" : "inherit",
                  cursor: "pointer",
                }}
              >
                {code}
              </button>
            ))}
          </div>
          <div className="table-wrap" style={{ maxHeight: "42vh" }}>
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Form</th>
                  <th>xPts</th>
                  <th>Pts</th>
                  <th>FDR</th>
                </tr>
              </thead>
              <tbody>
                {filteredFa.slice(0, 40).map((player) => (
                  <tr key={player.id} className="clickable" onClick={() => setSelectedPlayer(player)}>
                    <td>
                      <PlayerCell player={player} />
                    </td>
                    <td>{formatOne(player.form)}</td>
                    <td>{formatOne(player.ep_next)}</td>
                    <td>{player.total_points}</td>
                    <td>{player.nextFixture?.difficulty ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 16 }}>
        <div className="section-title">
          <h2>Draft board</h2>
          <button className="pill" onClick={() => setShowBoard((v) => !v)}>
            {showBoard ? "Hide" : "Show"} 15 rounds
          </button>
        </div>
        {showBoard && <DraftBoard choices={choices} playersById={playersById} />}
      </section>

      {manager && (
        <ManagerDrawer
          roster={manager}
          league={league}
          live={live}
          eventId={eventId}
          matches={payload.matches}
          byLeagueEntry={byLeagueEntry}
          choices={choices}
          playersById={playersById}
          onClose={() => setManager(null)}
        />
      )}
    </>
  );
}

function MatchList({ title, matches, byLeagueEntry, oursId, onSelect }) {
  return (
    <section className="panel">
      <div className="section-title">
        <h2>{title}</h2>
        <span>{matches.length} games</span>
      </div>
      {matches.map((match) => {
        const a = byLeagueEntry[match.league_entry_1];
        const b = byLeagueEntry[match.league_entry_2];
        const mine = match.league_entry_1 === oursId || match.league_entry_2 === oursId;
        return (
          <button
            key={`${match.event}-${match.league_entry_1}-${match.league_entry_2}`}
            className={`match-card ${mine ? "mine" : ""}`}
            onClick={() => onSelect(oursId && mine ? oursId : match.league_entry_1)}
          >
            <header>
              <span>{match.finished ? "Final" : match.started ? "Live" : "Upcoming"}</span>
            </header>
            <div className="clubs">
              <span>{a?.entry_name}</span>
              <span className="score">
                {match.started || match.finished
                  ? `${match.league_entry_1_points}–${match.league_entry_2_points}`
                  : "vs"}
              </span>
              <span>{b?.entry_name}</span>
            </div>
          </button>
        );
      })}
    </section>
  );
}

function DraftBoard({ choices, playersById }) {
  const rounds = {};
  for (const choice of choices) {
    (rounds[choice.round] ??= []).push(choice);
  }
  return (
    <div className="table-wrap" style={{ maxHeight: "48vh" }}>
      <table>
        <thead>
          <tr>
            <th>Rd</th>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
              <th key={n}>{n}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(rounds)
            .map(Number)
            .sort((a, b) => a - b)
            .map((round) => (
              <tr key={round}>
                <td>{round}</td>
                {rounds[round]
                  .sort((a, b) => a.pick - b.pick)
                  .map((choice) => {
                    const player = playersById[choice.element];
                    return (
                      <td key={choice.id} title={choice.entry_name}>
                        <div className="name">{player?.web_name ?? choice.element}</div>
                        <div className="sub">{choice.entry_name}</div>
                      </td>
                    );
                  })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
