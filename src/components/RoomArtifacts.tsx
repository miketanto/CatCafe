import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { getArtifactsForMood } from "@/data/roomArtifacts";
import { CLUE_IDS, type ClueId } from "@/data/mysteryClues";
import {
  ROOM_ARTIFACT_PLACEMENTS,
  STATIC_ARTIFACT_PLACEMENTS,
  BIRTHDAY_ARTIFACT_PLACEMENTS,
  type ArtifactPlacement,
  type BirthdayArtifactId,
  type StaticArtifactId,
} from "@/data/roomArtifactPlacements";
import { FrameGalleryModal } from "@/components/FrameGalleryModal";
import { FRAME_IDS, type FrameId } from "@/data/frameGalleries";

type RoomArtifactsProps = {
  mood: string;
  animate: boolean;
  animationKey: number;
  onRevealClue?: (clueId: ClueId) => void;
  discoveredClues?: Partial<Record<ClueId, boolean>>;
  showBirthdayDecor: boolean;
  onOpenLetter?: () => void;
};

const CLUE_ALT_TEXT: Record<ClueId, string> = {
  window: "Antique wall clock ticking softly",
  plant: "Trailing ivy plant in a pastel pot",
  toy: "Pastel pennant garland",
};

const CLUE_ARIA_LABEL: Record<ClueId, string> = {
  window: "Inspect the wall clock",
  plant: "Inspect the ivy plant",
  toy: "Inspect the pennant garland",
};

const CLUE_DIMENSIONS: Record<ClueId, { width: number; height: number }> = {
  window: { width: 190, height: 193 },
  plant: { width: 200, height: 358 },
  toy: { width: 322, height: 450 },
};

const STATIC_ARTIFACT_IDS: StaticArtifactId[] = ["frame-1", "frame-2", "frame-3", "letter", "shelf"];

const STATIC_DECOR: Record<StaticArtifactId, { src: string; alt: string; width: number; height: number }> = {
  "frame-1": {
    src: "/room/Frame1.png",
    alt: "Framed pastel portrait hanging on the café wall",
    width: 405,
    height: 375,
  },
  "frame-2": {
    src: "/room/Frame2.png",
    alt: "Framed illustration of a lounging cat",
    width: 422,
    height: 425,
  },
  "frame-3": {
    src: "/room/Frame3.png",
    alt: "Framed pixel art of stacked tea cups",
    width: 371,
    height: 392,
  },
  letter: {
    src: "/room/birthday/letter.png",
    alt: "Sealed letter resting on the counter",
    width: 1024,
    height: 1024,
  },
  shelf: {
    src: "/room/Shelf.png",
    alt: "Wall shelf stacked with pastel bowls and plants",
    width: 318,
    height: 457,
  },
};

const BIRTHDAY_ARTIFACT_IDS: BirthdayArtifactId[] = [
  "birthday-balloon",
  "birthday-gift",
  "birthday-party-hats",
];

const BIRTHDAY_DECOR: Record<
  BirthdayArtifactId,
  { src: string; alt: string; width: number; height: number }
> = {
  "birthday-balloon": {
    src: "/room/birthday/Balloon.png",
    alt: "Bundle of balloons floating above the café",
    width: 271,
    height: 283,
  },
  "birthday-gift": {
    src: "/room/birthday/Gift Box.png",
    alt: "Ribboned gift box on the floor",
    width: 289,
    height: 288,
  },
  "birthday-party-hats": {
    src: "/room/birthday/Party Hats.png",
    alt: "Cluster of pastel party hats",
    width: 227,
    height: 251,
  },
};

function buildPlacementStyle(placement?: ArtifactPlacement): CSSProperties {
  if (!placement) {
    return {};
  }

  const style: Record<string, string> = {};

  if (placement.base) {
    for (const [axis, value] of Object.entries(placement.base)) {
      if (value) {
        style[`--artifact-${axis}`] = value;
      }
    }
  }

  if (placement.large) {
    for (const [axis, value] of Object.entries(placement.large)) {
      if (value) {
        style[`--artifact-${axis}-lg`] = value;
      }
    }
  }

  return style;
}

// RoomArtifacts renders additional scenery that shifts with the cat's mood.
export function RoomArtifacts({
  mood,
  animate,
  animationKey,
  onRevealClue,
  discoveredClues,
  showBirthdayDecor,
  onOpenLetter,
}: RoomArtifactsProps) {
  const artifacts = useMemo(() => getArtifactsForMood(mood), [mood]);
  const variantKey = `${mood}-${animationKey}`;
  const containerClassName = [
    "room-artifacts",
    animate && "room-artifacts--animate",
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ");
  const [activeFrame, setActiveFrame] = useState<FrameId | null>(null);
  const [isPresentOpened, setIsPresentOpened] = useState(false);

  useEffect(() => {
    if (!showBirthdayDecor) {
      setIsPresentOpened(false);
    }
  }, [showBirthdayDecor]);

  return (
    <>
      <div className={containerClassName} data-variant={variantKey}>
        {CLUE_IDS.map((clueId, index) => {
        const assetSrc = artifacts[clueId];
        const isFound = Boolean(discoveredClues?.[clueId]);
        const dimensions = CLUE_DIMENSIONS[clueId];
        const placement = ROOM_ARTIFACT_PLACEMENTS[clueId];
        const triggerStyle = buildPlacementStyle(placement);

        return (
          <button
            key={`${clueId}-${variantKey}`}
            type="button"
            className={`room-artifacts__trigger room-artifacts__trigger--${clueId} ${
              isFound ? "room-artifacts__trigger--found" : ""
            }`}
            style={triggerStyle as CSSProperties}
            onClick={() => onRevealClue?.(clueId)}
            aria-pressed={isFound}
            aria-label={CLUE_ARIA_LABEL[clueId]}
            data-clue={clueId}
          >
            <Image
              src={assetSrc}
              alt={CLUE_ALT_TEXT[clueId]}
              width={dimensions.width}
              height={dimensions.height}
              className="room-artifacts__asset"
              priority={index === 0}
            />
            <span className="room-artifacts__spark" aria-hidden />
          </button>
        );
        })}

        {STATIC_ARTIFACT_IDS.map((decorId) => {
        const decor = STATIC_DECOR[decorId];
        const placement = STATIC_ARTIFACT_PLACEMENTS[decorId];
        const style = buildPlacementStyle(placement);
        const isFrame = FRAME_IDS.includes(decorId as FrameId);
        const isLetter = decorId === "letter";

        if (isFrame) {
          const frameId = decorId as FrameId;
          return (
            <button
              key={`${decorId}-${variantKey}`}
              type="button"
              className={`room-artifacts__decor room-artifacts__decor--${decorId} room-artifacts__frame-button`}
              style={style}
              onClick={() => setActiveFrame(frameId)}
              aria-haspopup="dialog"
              aria-label={`Open ${decor.alt}`}
              data-artifact={decorId}
            >
              <Image
                src={decor.src}
                alt={decor.alt}
                width={decor.width}
                height={decor.height}
                className="room-artifacts__asset"
                priority={false}
              />
            </button>
          );
          }

        if (isLetter) {
          if (!showBirthdayDecor || !isPresentOpened) {
            return null;
          }
          return (
            <button
              key={`${decorId}-${variantKey}`}
              type="button"
              className={`room-artifacts__decor room-artifacts__decor--${decorId} room-artifacts__letter-button`}
              style={style}
              onClick={() => onOpenLetter?.()}
              aria-haspopup="dialog"
              aria-label="Read the café letter"
              data-artifact={decorId}
            >
              <Image
                src={decor.src}
                alt={decor.alt}
                width={decor.width}
                height={decor.height}
                className="room-artifacts__asset"
                priority={false}
              />
            </button>
          );
        }

        return (
          <div
            key={`${decorId}-${variantKey}`}
            className={`room-artifacts__decor room-artifacts__decor--${decorId}`}
            style={style}
            role="presentation"
          >
            <Image
              src={decor.src}
              alt={decor.alt}
              width={decor.width}
              height={decor.height}
              className="room-artifacts__asset"
              priority={false}
            />
          </div>
        );
        })}

        {BIRTHDAY_ARTIFACT_IDS.map((decorId) => {
          const decor = BIRTHDAY_DECOR[decorId];
          const placement = BIRTHDAY_ARTIFACT_PLACEMENTS[decorId];
          const style = buildPlacementStyle(placement);
          const isGift = decorId === "birthday-gift";
          const assetSrc = isGift && isPresentOpened ? "/room/birthday/Openned_Birthday.png" : decor.src;
          const assetAlt = isGift && isPresentOpened ? "Opened birthday gift revealing treats" : decor.alt;
          const commonProps = {
            width: decor.width,
            height: decor.height,
            className: "room-artifacts__asset",
            priority: false,
          } as const;

          return (
            <div
              key={`${decorId}-${variantKey}`}
              className={`room-artifacts__decor room-artifacts__decor--${decorId} ${
                showBirthdayDecor ? "room-artifacts__decor--party-active" : "room-artifacts__decor--party-hidden"
              }`}
              style={style}
              role={isGift ? undefined : "presentation"}
              aria-hidden={showBirthdayDecor ? undefined : true}
            >
              {isGift ? (
                <button
                  type="button"
                  className="room-artifacts__party-button"
                  onClick={() => setIsPresentOpened((previous) => !previous)}
                  aria-pressed={isPresentOpened}
                  aria-label={isPresentOpened ? "Close the birthday gift" : "Open the birthday gift"}
                >
                  <Image src={assetSrc} alt={assetAlt} {...commonProps} />
                </button>
              ) : (
                <Image src={assetSrc} alt={assetAlt} {...commonProps} />
              )}
            </div>
          );
        })}
      </div>

      {activeFrame ? (
        <FrameGalleryModal frameId={activeFrame} onClose={() => setActiveFrame(null)} />
      ) : null}
    </>
  );
}
