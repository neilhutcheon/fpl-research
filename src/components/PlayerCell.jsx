import { playerPhotoUrl } from "../api/fpl.js";

export function PlayerCell({ player }) {
  const src = playerPhotoUrl(player);
  return (
    <div className="player-cell">
      {src ? (
        <img src={src} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      ) : (
        <div className="avatar">{player.web_name.slice(0, 2)}</div>
      )}
      <div>
        <div className="name">{player.web_name}</div>
        <div className="sub">
          {player.teamShort} · {player.position}
        </div>
      </div>
    </div>
  );
}
