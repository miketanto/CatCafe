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
import { BIRTHDAY_SURPRISE_TREAT } from "@/data/treatRecipes";
import { useInventory } from "@/context/InventoryContext";

const STORAGE_KEY = "virtual-cat-cafe.quest.birthday.v1";

const REQUIRED_TREATS = [
  {
    id: "honeyed-fish-bites",
    treatName: "Honeyed Fish Bites",
    hint: "Where shoreline brine meets sunlit nectar, a milk bottle clinks softly.",
  },
  {
    id: "fluffy-catnip-scones",
    treatName: "Fluffy Catnip Scones",
    hint: "Press meadow sparkles into buttered clouds; a catnip breeze shows the way.",
  },
  {
    id: "sweet-milkbread-twist",
    treatName: "Sweet Milkbread Twist",
    hint: "Braid the dawnlight with a silky pour and two scoops of molten gold.",
  },
] as const;

type RequiredTreatName = (typeof REQUIRED_TREATS)[number]["treatName"];

const BASE_TREAT_STATE: Record<RequiredTreatName, boolean> = REQUIRED_TREATS.reduce(
  (accumulator, entry) => {
    accumulator[entry.treatName] = false;
    return accumulator;
  },
  {} as Record<RequiredTreatName, boolean>
);

type QuestStatusStep = {
  id: string;
  label: string;
  subtitle: string;
  isComplete: boolean;
};

type QuestStatus = {
  title: string;
  intro: string;
  steps: QuestStatusStep[];
  isComplete: boolean;
  isSurpriseAvailable: boolean;
  isSurpriseClaimed: boolean;
};

type QuestContextValue = {
  status: QuestStatus;
  registerTreatBaked: (treat: TreatRecipe) => void;
  registerTreatFed: (treat: TreatRecipe) => void;
  claimBirthdaySurprise: () => void;
};

const QuestContext = createContext<QuestContextValue | undefined>(undefined);

type PersistedQuestState = {
  completedTreats: Record<string, boolean>;
  surpriseUnlockedAt: number | null;
  isSurpriseClaimed: boolean;
};

function mapToState(record: Record<string, boolean> | undefined) {
  return {
    ...BASE_TREAT_STATE,
    ...Object.fromEntries(
      Object.entries(record ?? {}).filter(([key]) =>
        Object.prototype.hasOwnProperty.call(BASE_TREAT_STATE, key)
      )
    ),
  } satisfies Record<RequiredTreatName, boolean>;
}

export function QuestProvider({ children }: { children: ReactNode }) {
  const { addTreat } = useInventory();
  const [completedTreats, setCompletedTreats] = useState<
    Record<RequiredTreatName, boolean>
  >(BASE_TREAT_STATE);
  const [surpriseUnlockedAt, setSurpriseUnlockedAt] = useState<number | null>(
    null
  );
  const [isSurpriseClaimed, setIsSurpriseClaimed] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setHasLoaded(true);
        return;
      }

      const parsed = JSON.parse(stored) as PersistedQuestState;
      setCompletedTreats(mapToState(parsed?.completedTreats));
      setSurpriseUnlockedAt(parsed?.surpriseUnlockedAt ?? null);
      setIsSurpriseClaimed(Boolean(parsed?.isSurpriseClaimed));
    } catch {
      setCompletedTreats(BASE_TREAT_STATE);
      setSurpriseUnlockedAt(null);
      setIsSurpriseClaimed(false);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded || typeof window === "undefined") {
      return;
    }

    const payload: PersistedQuestState = {
      completedTreats,
      surpriseUnlockedAt,
      isSurpriseClaimed,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [completedTreats, hasLoaded, isSurpriseClaimed, surpriseUnlockedAt]);

  const registerTreatBaked = useCallback((treat: TreatRecipe) => {
    if (!REQUIRED_TREATS.some((entry) => entry.treatName === treat.name)) {
      return;
    }

    setCompletedTreats((previous) => {
      if (previous[treat.name as RequiredTreatName]) {
        return previous;
      }

      return {
        ...previous,
        [treat.name as RequiredTreatName]: true,
      };
    });
  }, []);

  const registerTreatFed = useCallback((treat: TreatRecipe) => {
    // Future hooks can listen for feed events; no-op for now.
    if (!treat) {
      return;
    }
  }, []);

  const allStepsComplete = useMemo(
    () => REQUIRED_TREATS.every((entry) => completedTreats[entry.treatName]),
    [completedTreats]
  );

  useEffect(() => {
    if (allStepsComplete && surpriseUnlockedAt === null) {
      setSurpriseUnlockedAt(Date.now());
    }
  }, [allStepsComplete, surpriseUnlockedAt]);

  const isSurpriseAvailable = surpriseUnlockedAt !== null;

  const claimBirthdaySurprise = useCallback(() => {
    if (!isSurpriseAvailable || isSurpriseClaimed) {
      return;
    }

    addTreat(BIRTHDAY_SURPRISE_TREAT);
    setIsSurpriseClaimed(true);
  }, [addTreat, isSurpriseAvailable, isSurpriseClaimed]);

  const status = useMemo<QuestStatus>(() => {
    const steps: QuestStatusStep[] = REQUIRED_TREATS.map((entry) => ({
      id: entry.id,
      label: entry.treatName,
      subtitle: entry.hint,
      isComplete: completedTreats[entry.treatName],
    }));

    return {
      title: "Birthday Surprise Quest",
      intro:
        "Three whispered riddles hide in the café. Decode them to spring a birthday surprise.",
      steps,
      isComplete: allStepsComplete,
      isSurpriseAvailable,
      isSurpriseClaimed,
    };
  }, [allStepsComplete, completedTreats, isSurpriseAvailable, isSurpriseClaimed]);

  const value = useMemo<QuestContextValue>(
    () => ({
      status,
      registerTreatBaked,
      registerTreatFed,
      claimBirthdaySurprise,
    }),
    [status, registerTreatBaked, registerTreatFed, claimBirthdaySurprise]
  );

  return <QuestContext.Provider value={value}>{children}</QuestContext.Provider>;
}

export function useQuest() {
  const context = useContext(QuestContext);
  if (!context) {
    throw new Error("useQuest must be used within QuestProvider");
  }
  return context;
}
