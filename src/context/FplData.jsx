import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchBootstrap, fetchEventLive, fetchFixtures } from "../api/fpl.js";
import { difficultyByTeam, enrichPlayers } from "../lib/players.js";

const FplContext = createContext(null);

export function FplProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [bootstrap, setBootstrap] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [liveById, setLiveById] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setStatus("loading");
        const [boot, fx] = await Promise.all([fetchBootstrap(), fetchFixtures()]);
        if (cancelled) return;
        setBootstrap(boot);
        setFixtures(fx);
        const current = boot.events.find((event) => event.is_current);
        const previous = boot.events.find((event) => event.is_previous);
        const liveIds = [current?.id, previous?.id].filter(Boolean);
        const livePayloads = await Promise.all(liveIds.map((id) => fetchEventLive(id).catch(() => null)));
        if (cancelled) return;
        const map = {};
        livePayloads.forEach((payload, index) => {
          if (!payload?.elements) return;
          map[liveIds[index]] = Object.fromEntries(payload.elements.map((el) => [el.id, el]));
        });
        setLiveById(map);
        setStatus("ready");
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load FPL data");
          setStatus("error");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    if (!bootstrap) {
      return { status, error, selectedPlayer, setSelectedPlayer };
    }
    const currentEvent = bootstrap.events.find((event) => event.is_current);
    const nextEvent = bootstrap.events.find((event) => event.is_next);
    const previousEvent = bootstrap.events.find((event) => event.is_previous);
    const now = Date.now();
    const researchEvent =
      currentEvent && new Date(currentEvent.deadline_time).getTime() > now
        ? currentEvent
        : nextEvent || currentEvent;
    const players = enrichPlayers(bootstrap, fixtures, researchEvent?.id ?? 1);
    const teamsById = Object.fromEntries(bootstrap.teams.map((team) => [team.id, team]));
    return {
      status,
      error,
      bootstrap,
      fixtures,
      players,
      teams: bootstrap.teams,
      teamsById,
      events: bootstrap.events,
      currentEvent,
      nextEvent,
      previousEvent,
      researchEvent,
      liveById,
      difficultyMap: difficultyByTeam(players),
      selectedPlayer,
      setSelectedPlayer,
    };
  }, [bootstrap, error, fixtures, liveById, selectedPlayer, status]);

  return <FplContext.Provider value={value}>{children}</FplContext.Provider>;
}

export function useFpl() {
  const ctx = useContext(FplContext);
  if (!ctx) throw new Error("useFpl must be used inside FplProvider");
  return ctx;
}
