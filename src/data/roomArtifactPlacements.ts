import type { ClueId } from "@/data/mysteryClues";

// Artifact placement coordinates rely on viewport units so new assets can be positioned quickly.
export type ArtifactCoordinates = {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  width?: string;
  height?: string;
};

export type ArtifactPlacement = {
  base: ArtifactCoordinates;
  large?: ArtifactCoordinates;
};

export const ROOM_ARTIFACT_PLACEMENTS: Record<ClueId, ArtifactPlacement> = {
  window: {
    base: {
      top: "49vh",
      right: "6vw",
      width: "25vw",
    },
    large: {
      top: "18vh",
      right: "12vw",
      width: "9vw",
    },
  },
  plant: {
    base: {
      top: "35vh",
      right: "65vw",
      width: "22vw",
    },
    large: {
      top: "28vh",
      right: "58vw",
      width: "12vw",
    },
  },
  toy: {
    base: {
      top: "8vh",
      left: "10vw",
      width: "15vw",
    },
    large: {
      top: "12vh",
      left: "20vw",
      width: "18vw",
    },
  },
};

export type StaticArtifactId = "frame-1" | "frame-2" | "frame-3" | "letter" | "shelf";

export const STATIC_ARTIFACT_PLACEMENTS: Record<StaticArtifactId, ArtifactPlacement> = {
  "frame-1": {
    base: {
      top: "15vh",
      left: "52vw",
      width: "15vw",
    },
    large: {
      top: "10vh",
      left: "24vw",
      width: "7vw",
    },
  },
  "frame-2": {
    base: {
      top: "15vh",
      left: "70vw",
      width: "15vw",
    },
    large: {
      top: "10vh",
      left: "39vw",
      width: "7.2vw",
    },
  },
  "frame-3": {
    base: {
     top: "22vh",
      left: "63vw",
      width: "13vw",
    },
    large: {
      top: "10vh",
      right: "24vw",
      width: "7vw",
    },
  },
  letter: {
    base: {
      bottom: "34vh",
      right: "68vw",
      width: "23vw",
    },
    large: {
      bottom: "24vh",
      right: "30vw",
      width: "10vw",
    },
  },
  shelf: {
    base: {
      top: "27vh",
      left: "50vw",
      width: "35vw",
    },
    large: {
      top: "25vh",
      left: "50vw",
      width: "14vw",
    },
  },
};

export type BirthdayArtifactId =
  | "birthday-balloon"
  | "birthday-gift"
  | "birthday-party-hats";

export const BIRTHDAY_ARTIFACT_PLACEMENTS: Record<BirthdayArtifactId, ArtifactPlacement> = {
  "birthday-balloon": {
    base: {
      top: "33vh",
      left: "42vw",
      width: "40vw",
    },
    large: {
      top: "6vh",
      left: "44vw",
      width: "14vw",
    },
  },
  "birthday-gift": {
    base: {
      bottom: "39vh",
      left: "18vw",
      width: "25vw",
    },
    large: {
      bottom: "6vh",
      left: "47vw",
      width: "12vw",
    },
  },
  "birthday-party-hats": {
    base: {
      bottom: "38vh",
      left: "35vw",
      width: "14vw",
    },
    large: {
      bottom: "26vh",
      left: "18vw",
      width: "11vw",
    },
  },
};
