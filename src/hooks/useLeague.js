import { useEffect, useState } from "react";
import {
  fetchDraftChoices,
  fetchDraftDetails,
  fetchDraftElementStatus,
  fetchDraftGame,
  fetchDraftPicks,
} from "../api/draft.js";
import { DRAFT_LEAGUE_ID, mapPool } from "../lib/league.js";

const cache = new Map();

export function useLeague(eventId, leagueId = DRAFT_LEAGUE_ID) {
  const [state, setState] = useState({ status: "idle", error: "", payload: null });

  useEffect(() => {
    if (!eventId || !leagueId) return undefined;
    const key = `${leagueId}:${eventId}`;
    if (cache.has(key)) {
      setState({ status: "ready", error: "", payload: cache.get(key) });
      return undefined;
    }

    let cancelled = false;
    async function load() {
      setState({ status: "loading", error: "", payload: null });
      try {
        const [details, statusPayload, choicesPayload, game] = await Promise.all([
          fetchDraftDetails(leagueId),
          fetchDraftElementStatus(leagueId),
          fetchDraftChoices(leagueId),
          fetchDraftGame().catch(() => null),
        ]);
        const pickEvent = eventId;
        const rosters = await mapPool(details.league_entries ?? [], 4, async (entry) => {
          const picks = await fetchDraftPicks(entry.entry_id, pickEvent).catch(() => ({ picks: [] }));
          return { entry, picks: picks?.picks ?? [] };
        });
        const payload = {
          league: details.league,
          entries: details.league_entries ?? [],
          matches: details.matches ?? [],
          officialStandings: details.standings ?? [],
          elementStatus: statusPayload.element_status ?? [],
          choices: choicesPayload.choices ?? [],
          game,
          rosters,
        };
        cache.set(key, payload);
        if (!cancelled) setState({ status: "ready", error: "", payload });
      } catch (err) {
        if (!cancelled) {
          setState({
            status: "error",
            error: err.message || "Could not load draft league",
            payload: null,
          });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [eventId, leagueId]);

  return state;
}
