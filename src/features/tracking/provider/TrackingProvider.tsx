"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { TrackingCache, TrackingStoreState } from "@/types";
import { sanitizeRecipientName } from "@/utils/formatters/date.formatter";
import { TRACKING_STORAGE_KEY } from "@/utils/constants";

type TrackingResultInput = Omit<TrackingCache, "userName">;

type TrackingContextValue = TrackingStoreState & {
  setTrackingResult: (cache: TrackingResultInput) => void;
  clearTrackingResult: () => void;
};

const emptyState: TrackingStoreState = {
  cpf: "",
  payload: {
    packages: [],
  },
  scrapedAt: "",
  userName: null,
  hydrated: false,
};

function getUserName(cache: Pick<TrackingCache, "payload">): string | null {
  const recipient = cache.payload.packages[0]?.recipient ?? null;

  if (!recipient) {
    return null;
  }

  const trimmedRecipient = sanitizeRecipientName(recipient);

  return trimmedRecipient || null;
}

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
      const parsed = JSON.parse(raw) as Partial<TrackingCache> &
        TrackingResultInput;
      const cache: TrackingCache = {
        cpf: parsed.cpf,
        payload: parsed.payload,
        scrapedAt: parsed.scrapedAt,
        userName: parsed.userName ?? getUserName(parsed),
      };

      window.requestAnimationFrame(() => {
        setState({
          ...cache,
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

  function setTrackingResult(cache: TrackingResultInput) {
    const nextCache: TrackingCache = {
      ...cache,
      userName: getUserName(cache),
    };

    window.sessionStorage.setItem(
      TRACKING_STORAGE_KEY,
      JSON.stringify(nextCache),
    );
    setState({
      ...nextCache,
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
