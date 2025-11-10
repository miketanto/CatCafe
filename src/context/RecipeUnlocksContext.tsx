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

const STORAGE_KEY = "virtual-cat-cafe.recipes.v1";

type RecipeUnlocksContextValue = {
  unlockedKeys: string[];
  unlockTreat: (key: string) => void;
  unlockMany: (keys: string[]) => void;
  isReady: boolean;
};

const RecipeUnlocksContext = createContext<RecipeUnlocksContextValue | undefined>(
  undefined
);

function sanitizeKeys(rawKeys: unknown): string[] {
  if (!Array.isArray(rawKeys)) {
    return [];
  }

  return rawKeys
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean)
    .reduce<string[]>((accumulator, key) => {
      if (!accumulator.includes(key)) {
        accumulator.push(key);
      }
      return accumulator;
    }, []);
}

export function RecipeUnlocksProvider({ children }: { children: ReactNode }) {
  const [unlockedKeys, setUnlockedKeys] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUnlockedKeys(sanitizeKeys(parsed));
      }
    } catch {
      setUnlockedKeys([]);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady || typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedKeys));
    } catch {
      // Ignore storage failures silently.
    }
  }, [isReady, unlockedKeys]);

  const unlockTreat = useCallback((key: string) => {
    if (!key) {
      return;
    }

    setUnlockedKeys((previous) => {
      if (previous.includes(key)) {
        return previous;
      }
      return [...previous, key];
    });
  }, []);

  const unlockMany = useCallback((keys: string[]) => {
    if (!keys.length) {
      return;
    }

    setUnlockedKeys((previous) => {
      const merged = new Set(previous);
      keys.forEach((key) => {
        if (key) {
          merged.add(key);
        }
      });
      return Array.from(merged);
    });
  }, []);

  const value = useMemo<RecipeUnlocksContextValue>(
    () => ({ unlockedKeys, unlockTreat, unlockMany, isReady }),
    [unlockedKeys, unlockTreat, unlockMany, isReady]
  );

  return (
    <RecipeUnlocksContext.Provider value={value}>
      {children}
    </RecipeUnlocksContext.Provider>
  );
}

export function useRecipeUnlocks() {
  const context = useContext(RecipeUnlocksContext);
  if (!context) {
    throw new Error("useRecipeUnlocks must be used within RecipeUnlocksProvider");
  }
  return context;
}
