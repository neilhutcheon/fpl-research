import { OUR_ENTRY_ID, gwScore, matchForEntry, opponentLeagueEntry } from "../lib/league.js";
import { formatOne } from "../lib/format.js";
import { useFpl } from "../context/FplData.jsx";
import { PlayerCell } from "./PlayerCell.jsx";
import { PosBadge } from "./StatusBadge.jsx";

export function ManagerDrawer({
  roster,
  league,
  live,
  eventId,
  matches,
  byLeagueEntry,
  choices,
  playersById,
  onClose,
}) {
  const { setSelectedPlayer } = useFpl();
  const entry = roster.entry;
  const picks = [...(roster.picks ?? [])].sort((a, b) => a.position - b.position);
  const pickNum = Object.fromEntries(
    (choices ?? []).filter((c) => c.entry === entry.entry_id).map((c) => [c.element, c]),
  );
  const match = matchForEntry(matches, entry.id, eventId);
  const oppId = opponentLeagueEntry(match, entry.id);
  const opp = oppId ? byLeagueEntry[oppId] : null;
  const mine = entry.entry_id === OUR_ENTRY_ID;
  const isAdmin = league.admin_entry === entry.entry_id;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer drawer-wide" onClick={(e) => e.stopPropagation()}>
        <header>
          <div>
            <h2 style={{ margin: 0 }}>{entry.entry_name}</h2>
            <div className="sub">
              {entry.player_first_name} {entry.player_last_name}
              {mine ? " · you" : ""}
              {isAdmin ? " · commissioner" : ""} · waiver {entry.waiver_pick}
            </div>
          </div>
          <button onClick={onClose}>Close</button>
        </header>
        <div className="stat-grid">
          <Mini label="GW pts" value={gwScore(match, entry.id) ?? "–"} />
          <Mini
            label="Opponent"
            value={opp ? `${opp.short_name} ${gwScore(match, opp.id) ?? ""}` : "–"}
          />
          <Mini label="Status" value={match?.finished ? "Final" : match?.started ? "Live" : "Upcoming"} />
          <Mini label="Roster" value={picks.length} />
        </div>
        <h3>Starting XI</h3>
        <PickTable
          picks={picks.filter((p) => p.position <= 11)}
          live={live}
          playersById={playersById}
          pickNum={pickNum}
          onSelect={setSelectedPlayer}
        />
        <h3>Bench</h3>
        <PickTable
          picks={picks.filter((p) => p.position > 11)}
          live={live}
          playersById={playersById}
          pickNum={pickNum}
          onSelect={setSelectedPlayer}
        />
      </aside>
    </div>
  );
}

function PickTable({ picks, live, playersById, pickNum, onSelect }) {
  return (
    <div className="table-wrap" style={{ maxHeight: 280 }}>
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Pos</th>
            <th>Draft</th>
            <th>GW</th>
            <th>Form</th>
          </tr>
        </thead>
        <tbody>
          {picks.map((pick) => {
            const player = playersById[pick.element];
            const pts = live[pick.element]?.stats?.total_points;
            const drafted = pickNum[pick.element];
            return (
              <tr
                key={pick.position}
                className="clickable"
                onClick={() => player && onSelect(player)}
              >
                <td>{player ? <PlayerCell player={player} /> : pick.element}</td>
                <td>{player ? <PosBadge position={player.position} /> : "–"}</td>
                <td>{drafted ? `R${drafted.round} P${drafted.index}` : "–"}</td>
                <td>{pts ?? "–"}</td>
                <td>{player ? formatOne(player.form) : "–"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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
