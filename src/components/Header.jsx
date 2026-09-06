import { useEffect, useState } from "react";
import { useFpl } from "../context/FplData.jsx";
import { countdownTo, formatDeadline } from "../lib/format.js";

const VIEWS = [
  ["league", "Our draft"],
  ["week", "This week"],
  ["team", "By team"],
  ["matchup", "By matchup"],
  ["trades", "Trades"],
];

export function Header({ view, onView }) {
  return (
    <>
      <header className="topbar">
        <div className="brand">
          <h1>FPL Research Desk</h1>
          <p>Start/sit and trade research from live Fantasy Premier League data.</p>
        </div>
        <DeadlinePills />
      </header>
      <nav className="tabs">
        {VIEWS.map(([id, label]) => (
          <button key={id} className={view === id ? "active" : ""} onClick={() => onView(id)}>
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}

function DeadlinePills() {
  const { currentEvent, nextEvent, researchEvent, players } = useFpl();
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const flagged = players?.filter((p) => p.status !== "a" && p.news).length ?? 0;

  return (
    <div className="meta">
      {currentEvent && (
        <div className="pill">
          Live <strong>{currentEvent.name}</strong>
        </div>
      )}
      {researchEvent && (
        <div className="pill">
          Researching <strong>{researchEvent.name}</strong>
          <div>{countdownTo(researchEvent.deadline_time)} · {formatDeadline(researchEvent.deadline_time)}</div>
        </div>
      )}
      {nextEvent && nextEvent.id !== researchEvent?.id && (
        <div className="pill">
          Next <strong>{nextEvent.name}</strong>
        </div>
      )}
      <div className="pill">
        News flags <strong>{flagged}</strong>
      </div>
    </div>
  );
}
