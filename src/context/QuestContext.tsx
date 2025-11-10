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
import { useInventory } from "@/context/InventoryContext";
import {
  BAKEABLE_TREATS,
  BIRTHDAY_SURPRISE_TREAT,
  getTreatByKey,
  toIngredientKey,
  type TreatRecipe,
} from "@/data/treatRecipes";
import { CLUE_IDS, type ClueId } from "@/data/mysteryClues";

const STORAGE_KEY = "virtual-cat-cafe.quest.birthday.v2";
const LEGACY_STORAGE_KEYS = ["virtual-cat-cafe.quest.birthday.v1"] as const;

type ClueRequirement = {
  id: string;
  clueId: ClueId;
  placeholderLabel: string;
  subtitle: string;
  treatCombos: string[][];
};

type NormalizedClueRequirement = ClueRequirement & {
  treatKeys: string[];
};

const RAW_CLUE_REQUIREMENTS: ClueRequirement[] = [
  {
    id: "clue-plant-snack",
    clueId: "plant",
    placeholderLabel: "Plant Riddle Solved",
    subtitle: "Kitty loves a snack that mixes things Mia eats for lunch and something that hurts her",
    treatCombos: [
      ["milk", "fish"],
      ["milk", "fish", "honey"],
    ],
  },
  {
    id: "clue-frame-one",
    clueId: "frame-1",
    placeholderLabel: "Sleepy Frame Secret",
    subtitle: "Make Kitty a high carb and rich treat that'll make her sleepy just like Mia :)",
    treatCombos: [
      ["flour", "butter", "catnip"],
      ["flour", "catnip"],
    ],
  },
  {
    id: "clue-frame-two",
    clueId: "frame-2",
    placeholderLabel: "Golden Gallery Wish",
    subtitle: "Make Kitty something golden just like how the sun shines on Mia",
    treatCombos: [
      ["flour", "butter", "honey"],
      ["butter", "fish", "honey"],
      ["butter", "honey"],
    ],
  },
  {
    id: "clue-frame-three",
    clueId: "frame-3",
    placeholderLabel: "Shared Kitchen Dream",
    subtitle: "Kitty overheard the conversation the other day of what Mia wants to bake together!",
    treatCombos: [
      ["milk", "flour", "cream"],
      ["milk", "butter"],
    ],
  },
  {
    id: "clue-window-energy",
    clueId: "window",
    placeholderLabel: "Sunlit Hype",
    subtitle: "Kitty wants something that will get her hype! Not for Mia because it'll send her to toilet",
    treatCombos: [
      ["milk", "butter", "catnip"],
      ["milk", "flour", "catnip"],
    ],
  },
];

const CLUE_REQUIREMENTS: NormalizedClueRequirement[] = RAW_CLUE_REQUIREMENTS.map((entry) => {
  const treatKeys = entry.treatCombos.map((combo) => toIngredientKey(combo));
  return { ...entry, treatKeys };
});

const TREAT_KEY_TO_CLUE_IDS = CLUE_REQUIREMENTS.reduce<Map<string, ClueId[]>>(
  (accumulator, requirement) => {
    requirement.treatKeys.forEach((key) => {
      const existing = accumulator.get(key);
      if (existing) {
        if (!existing.includes(requirement.clueId)) {
          existing.push(requirement.clueId);
        }
      } else {
        accumulator.set(key, [requirement.clueId]);
      }
    });
    return accumulator;
  },
  new Map<string, ClueId[]>()
);

const BASE_CLUE_PROGRESS: Record<ClueId, string | null> = CLUE_IDS.reduce(
  (accumulator, clueId) => {
    accumulator[clueId] = null;
    return accumulator;
  },
  {} as Record<ClueId, string | null>
);

const TREAT_NAME_TO_KEY = BAKEABLE_TREATS.reduce<Record<string, string>>(
  (accumulator, treat) => {
    accumulator[treat.name] = treat.key;
    return accumulator;
  },
  {}
);

export type QuestStatusStep = {
  id: string;
  label: string;
  subtitle: string;
  isComplete: boolean;
  treatKey: string | null;
};

export type QuestStatus = {
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
  clueTreatKeys: Record<ClueId, string | null>;
  surpriseUnlockedAt: number | null;
  isSurpriseClaimed: boolean;
};

type LegacyPersistedQuestState = {
  completedTreats?: Record<string, boolean>;
  surpriseUnlockedAt?: number | null;
  isSurpriseClaimed?: boolean;
};

function normalizeClueTreats(record: Record<string, unknown> | undefined) {
  const base: Record<ClueId, string | null> = { ...BASE_CLUE_PROGRESS };
  if (!record) {
    return base;
  }

  for (const clueId of CLUE_IDS) {
    const value = record[clueId];
    if (typeof value === "string" && value.length > 0) {
      base[clueId] = value;
    }
  }

  if (!base.window) {
    const toyValue = record["toy"];
    if (typeof toyValue === "string" && toyValue.length > 0) {
      base.window = toyValue;
    }
  }

  return base;
}

function migrateLegacyTreats(record: Record<string, boolean> | undefined) {
  const base: Record<ClueId, string | null> = { ...BASE_CLUE_PROGRESS };
  if (!record) {
    return base;
  }

  Object.entries(record).forEach(([treatName, isComplete]) => {
    if (!isComplete) {
      return;
    }

    const treatKey = TREAT_NAME_TO_KEY[treatName];
    if (!treatKey) {
      return;
    }

    const clueIds = TREAT_KEY_TO_CLUE_IDS.get(treatKey);
    if (!clueIds) {
      return;
    }

    clueIds.forEach((clueId) => {
      if (!base[clueId]) {
        base[clueId] = treatKey;
      }
    });
  });

  return base;
}

export function QuestProvider({ children }: { children: ReactNode }) {
  const { addTreat } = useInventory();
  const [completedTreats, setCompletedTreats] = useState<
    Record<ClueId, string | null>
  >(() => ({ ...BASE_CLUE_PROGRESS }));
  const [surpriseUnlockedAt, setSurpriseUnlockedAt] = useState<number | null>(
    null
  );
  const [isSurpriseClaimed, setIsSurpriseClaimed] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const loadState = () => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PersistedQuestState;
        setCompletedTreats(normalizeClueTreats(parsed?.clueTreatKeys));
        setSurpriseUnlockedAt(parsed?.surpriseUnlockedAt ?? null);
        setIsSurpriseClaimed(Boolean(parsed?.isSurpriseClaimed));
        return true;
      }

      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        const legacyStored = window.localStorage.getItem(legacyKey);
        if (!legacyStored) {
          continue;
        }

        const parsedLegacy = JSON.parse(legacyStored) as LegacyPersistedQuestState;
        setCompletedTreats(migrateLegacyTreats(parsedLegacy?.completedTreats));
        setSurpriseUnlockedAt(parsedLegacy?.surpriseUnlockedAt ?? null);
        setIsSurpriseClaimed(Boolean(parsedLegacy?.isSurpriseClaimed));
        return true;
      }

      return false;
    };

    try {
      const didLoad = loadState();
      if (!didLoad) {
        setCompletedTreats({ ...BASE_CLUE_PROGRESS });
        setSurpriseUnlockedAt(null);
        setIsSurpriseClaimed(false);
      }
    } catch {
      setCompletedTreats({ ...BASE_CLUE_PROGRESS });
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
      clueTreatKeys: completedTreats,
      surpriseUnlockedAt,
      isSurpriseClaimed,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [completedTreats, hasLoaded, isSurpriseClaimed, surpriseUnlockedAt]);

  const registerTreatBaked = useCallback((treat: TreatRecipe) => {
    const clueIds = TREAT_KEY_TO_CLUE_IDS.get(treat.key);
    if (!clueIds?.length) {
      return;
    }

    setCompletedTreats((previous) => {
      let didUpdate = false;
      const next = { ...previous };

      clueIds.forEach((clueId) => {
        if (!next[clueId]) {
          next[clueId] = treat.key;
          didUpdate = true;
        }
      });

      return didUpdate ? next : previous;
    });
  }, []);

  const registerTreatFed = useCallback((treat: TreatRecipe) => {
    // Future hooks can listen for feed events; no-op for now.
    if (!treat) {
      return;
    }
  }, []);

  const allStepsComplete = useMemo(
    () => CLUE_IDS.every((clueId) => Boolean(completedTreats[clueId])),
    [completedTreats]
  );

  useEffect(() => {
    if (!allStepsComplete) {
      return;
    }

    if (surpriseUnlockedAt === null) {
      setSurpriseUnlockedAt(Date.now());
    }

    if (!isSurpriseClaimed) {
      addTreat(BIRTHDAY_SURPRISE_TREAT);
      setIsSurpriseClaimed(true);
    }
  }, [addTreat, allStepsComplete, isSurpriseClaimed, surpriseUnlockedAt]);

  const isSurpriseAvailable = surpriseUnlockedAt !== null;

  const claimBirthdaySurprise = useCallback(() => {
    if (!isSurpriseAvailable || isSurpriseClaimed) {
      return;
    }

    addTreat(BIRTHDAY_SURPRISE_TREAT);
    setIsSurpriseClaimed(true);
  }, [addTreat, isSurpriseAvailable, isSurpriseClaimed]);

  const status = useMemo<QuestStatus>(() => {
    const steps: QuestStatusStep[] = CLUE_REQUIREMENTS.map((requirement) => {
      const treatKey = completedTreats[requirement.clueId];
      const treat = treatKey ? getTreatByKey(treatKey) : null;
      const isComplete = Boolean(treat);
      const subtitle = isComplete
        ? `Solution: ${treat!.name}`
        : requirement.subtitle;

      return {
        id: requirement.id,
        label: treat ? treat.name : requirement.placeholderLabel,
        subtitle,
        isComplete,
        treatKey: treatKey ?? null,
      };
    });

    return {
      title: "Birthday Surprise Quest",
      intro:
        "Five whispered riddles hide in the café. Decode them to spring a birthday surprise.",
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
