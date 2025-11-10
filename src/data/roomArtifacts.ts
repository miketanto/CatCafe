import type { OverlayClueId } from "@/data/mysteryClues";

export type RoomArtifactSet = Record<OverlayClueId, string>;

const BASE_ARTIFACT_SET: RoomArtifactSet = {
  plant: "/room/Plant.png",
  window: "/room/Clock.png",
};

const ROOM_ARTIFACTS: Record<string, RoomArtifactSet> = {
  curious: { ...BASE_ARTIFACT_SET },
  happy: { ...BASE_ARTIFACT_SET },
  sleepy: { ...BASE_ARTIFACT_SET },
  playful: { ...BASE_ARTIFACT_SET },
};

export const DEFAULT_ROOM_ARTIFACTS: RoomArtifactSet = ROOM_ARTIFACTS.curious;

export function getArtifactsForMood(mood: string): RoomArtifactSet {
  return ROOM_ARTIFACTS[mood] ?? DEFAULT_ROOM_ARTIFACTS;
}
