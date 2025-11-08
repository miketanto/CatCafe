"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { TreatRecipe } from "@/data/treatRecipes";
import { getTreatByKey } from "@/data/treatRecipes";

const STORAGE_KEY = "virtual-cat-cafe.inventory.v1";

type InventoryEntry = {
  id: string;
  treatKey: string;
  acquiredAt: number;
};

type InventoryItem = InventoryEntry & {
  treat: TreatRecipe;
};

type InventoryContextValue = {
  items: InventoryItem[];
  addTreat: (treat: TreatRecipe) => void;
  removeItem: (id: string) => void;
  feedTreat: (id: string) => TreatRecipe | null;
  isReady: boolean;
};

const InventoryContext = createContext<InventoryContextValue | undefined>(
  undefined
);

function safeParseEntries(rawValue: string | null): InventoryEntry[] {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as InventoryEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((entry) => typeof entry?.treatKey === "string")
      .map((entry, index) => ({
        id:
          typeof entry.id === "string"
            ? entry.id
            : `treat-${Date.now()}-${index}`,
        treatKey: entry.treatKey,
        acquiredAt:
          typeof entry.acquiredAt === "number"
            ? entry.acquiredAt
            : Date.now(),
      }));
  } catch {
    return [];
  }
}

export function InventoryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [entries, setEntries] = useState<InventoryEntry[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    setEntries(safeParseEntries(stored));
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries, isReady]);

  const addTreat = useCallback((treat: TreatRecipe) => {
    setEntries((previous) => {
      const id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `treat-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      return [
        ...previous,
        {
          id,
          treatKey: treat.key,
          acquiredAt: Date.now(),
        },
      ];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setEntries((previous) => previous.filter((entry) => entry.id !== id));
  }, []);

  const feedTreat = useCallback(
    (id: string) => {
      let treated: TreatRecipe | null = null;

      setEntries((previous) => {
        const target = previous.find((entry) => entry.id === id);
        if (!target) {
          return previous;
        }

        treated = getTreatByKey(target.treatKey);
        return previous.filter((entry) => entry.id !== id);
      });

      return treated;
    },
    []
  );

  const value = useMemo<InventoryContextValue>(() => {
    const items = entries.map((entry) => ({
      ...entry,
      treat: getTreatByKey(entry.treatKey),
    }));

    return {
      items,
      addTreat,
      removeItem,
      feedTreat,
      isReady,
    };
  }, [entries, addTreat, removeItem, feedTreat, isReady]);

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within InventoryProvider");
  }
  return context;
}
