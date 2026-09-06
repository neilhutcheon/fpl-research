import { useMemo, useState } from "react";
import { useFpl } from "../context/FplData.jsx";
import { formatOne, formatPrice } from "../lib/format.js";
import { sortPlayers } from "../lib/players.js";
import { FdrPips } from "./FdrBadge.jsx";
import { PlayerCell } from "./PlayerCell.jsx";
import { PosBadge, StatusBadge } from "./StatusBadge.jsx";

const COLUMNS = [
  ["web_name", "Player", "asc"],
  ["position", "Pos", "asc"],
  ["price", "£", "asc"],
  ["formNum", "Form", "desc"],
  ["epNext", "xPts", "desc"],
  ["total_points", "Pts", "desc"],
  ["minutes", "Mins", "desc"],
  ["goals_scored", "G", "desc"],
  ["assists", "A", "desc"],
  ["xgi", "xGI", "desc"],
  ["own", "Own%", "desc"],
  ["startScore", "Start", "desc"],
];

export function PlayerTable({ players }) {
  const { teamsById, setSelectedPlayer } = useFpl();
  const [sortKey, setSortKey] = useState("startScore");
  const [sortDir, setSortDir] = useState("desc");

  const rows = useMemo(() => sortPlayers(players, sortKey, sortDir), [players, sortKey, sortDir]);

  function onSort(key, defaultDir) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(defaultDir);
    }
  }

  if (!players.length) {
    return <div className="empty">No players match these filters.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {COLUMNS.map(([key, label, defaultDir]) => (
              <th key={key} onClick={() => onSort(key, defaultDir)}>
                {label}
                {sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
              </th>
            ))}
            <th>Next 5</th>
            <th>Flag</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((player) => (
            <tr
              key={player.id}
              className="clickable"
              tabIndex={0}
              onClick={() => setSelectedPlayer(player)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelectedPlayer(player);
              }}
            >
              <td>
                <PlayerCell player={player} />
              </td>
              <td>
                <PosBadge position={player.position} />
              </td>
              <td>{formatPrice(player.now_cost)}</td>
              <td>{formatOne(player.form)}</td>
              <td>{formatOne(player.ep_next)}</td>
              <td>{player.total_points}</td>
              <td>{player.minutes}</td>
              <td>{player.goals_scored}</td>
              <td>{player.assists}</td>
              <td>{formatOne(player.xgi)}</td>
              <td>{formatOne(player.own)}</td>
              <td>{formatOne(player.startScore)}</td>
              <td>
                <FdrPips fixtures={player.upcoming} teamsById={teamsById} />
              </td>
              <td>
                <StatusBadge player={player} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
