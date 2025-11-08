export const CLUE_IDS = ["window", "plant", "toy"] as const;

export type ClueId = (typeof CLUE_IDS)[number];

export const CLUE_ID_TO_INDEX: Record<ClueId, number> = {
  window: 0,
  plant: 1,
  toy: 2,
};
