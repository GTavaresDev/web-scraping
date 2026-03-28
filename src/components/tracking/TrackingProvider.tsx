"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { TrackingCache, TrackingStoreState } from "@/lib/types";
import { TRACKING_STORAGE_KEY } from "@/utils/constants";

type TrackingContextValue = TrackingStoreState & {
  setTrackingResult: (cache: TrackingCache) => void;
  clearTrackingResult: () => void;
};

const emptyState: TrackingStoreState = {
  cpf: "",
  payload: {
    packages: [],
    detailsById: {},
  },
  scrapedAt: "",
  hydrated: false,
};

const TrackingContext = createContext<TrackingContextValue | null>(null);

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TrackingStoreState>(emptyState);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(TRACKING_STORAGE_KEY);

    if (!raw) {
      window.requestAnimationFrame(() => {
        setState((current) => ({ ...current, hydrated: true }));
      });
      return;
    }

    try {
      const parsed = JSON.parse(raw) as TrackingCache;

      window.requestAnimationFrame(() => {
        setState({
          ...parsed,
          hydrated: true,
        });
      });
    } catch {
      window.sessionStorage.removeItem(TRACKING_STORAGE_KEY);
      window.requestAnimationFrame(() => {
        setState((current) => ({ ...current, hydrated: true }));
      });
    }
  }, []);

  function setTrackingResult(cache: TrackingCache) {
    window.sessionStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(cache));
    setState({
      ...cache,
      hydrated: true,
    });
  }

  function clearTrackingResult() {
    window.sessionStorage.removeItem(TRACKING_STORAGE_KEY);
    setState({
      ...emptyState,
      hydrated: true,
    });
  }

  return (
    <TrackingContext.Provider
      value={{
        ...state,
        setTrackingResult,
        clearTrackingResult,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const context = useContext(TrackingContext);

  if (!context) {
    throw new Error("useTracking deve ser usado dentro de TrackingProvider.");
  }

  return context;
}
