export type RoomArtifactSet = {
  window: string;
  plant: string;
  toy: string;
};

const BASE_ARTIFACT_SET: RoomArtifactSet = {
  window: "/room/Clock.png",
  plant: "/room/Plant.png",
  toy: "/room/Flag_crop.png",
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
