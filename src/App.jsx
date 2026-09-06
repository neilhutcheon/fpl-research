import { useState } from "react";
import { FplProvider, useFpl } from "./context/FplData.jsx";
import { Header } from "./components/Header.jsx";
import { PlayerDrawer } from "./components/PlayerDrawer.jsx";
import { WeekView } from "./views/WeekView.jsx";
import { TeamView } from "./views/TeamView.jsx";
import { MatchupView } from "./views/MatchupView.jsx";
import { CompareView } from "./views/CompareView.jsx";
import { LeagueView } from "./views/LeagueView.jsx";

function Shell() {
  const { status, error } = useFpl();
  const [view, setView] = useState("league");

  if (status === "loading") {
    return <div className="loading">Loading live FPL data…</div>;
  }
  if (status === "error") {
    return <div className="error">{error}. Is the dev server proxy running?</div>;
  }

  return (
    <div className="app">
      <Header view={view} onView={setView} />
      {view === "league" && <LeagueView />}
      {view === "week" && <WeekView />}
      {view === "team" && <TeamView />}
      {view === "matchup" && <MatchupView />}
      {view === "trades" && <CompareView />}
      <PlayerDrawer />
    </div>
  );
}

export default function App() {
  return (
    <FplProvider>
      <Shell />
    </FplProvider>
  );
}
