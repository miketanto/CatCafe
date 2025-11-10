export const CLUE_IDS = ["plant", "frame-1", "frame-2", "frame-3", "window"] as const;

export const OVERLAY_CLUE_IDS = ["plant", "window"] as const;

export const FRAME_CLUE_IDS = ["frame-1", "frame-2", "frame-3"] as const;

export type ClueId = (typeof CLUE_IDS)[number];
export type OverlayClueId = (typeof OVERLAY_CLUE_IDS)[number];
export type FrameClueId = (typeof FRAME_CLUE_IDS)[number];

export const CLUE_ID_TO_INDEX: Record<ClueId, number> = {
  plant: 0,
  "frame-1": 1,
  "frame-2": 2,
  "frame-3": 3,
  window: 4,
};
