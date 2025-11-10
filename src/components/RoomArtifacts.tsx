import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { getArtifactsForMood } from "@/data/roomArtifacts";
import {
  CLUE_ID_TO_INDEX,
  OVERLAY_CLUE_IDS,
  type ClueId,
  type FrameClueId,
  type OverlayClueId,
} from "@/data/mysteryClues";
import {
  ROOM_ARTIFACT_PLACEMENTS,
  STATIC_ARTIFACT_PLACEMENTS,
  BIRTHDAY_ARTIFACT_PLACEMENTS,
  BIRTHDAY_UI_PLACEMENTS,
  type ArtifactPlacement,
  type BirthdayArtifactId,
  type StaticArtifactId,
} from "@/data/roomArtifactPlacements";
import { FrameGalleryModal } from "@/components/FrameGalleryModal";
import { FRAME_IDS, type FrameId } from "@/data/frameGalleries";
import type { QuestStatusStep } from "@/context/QuestContext";
import { getTreatByKey } from "@/data/treatRecipes";
import { OverlayClueModal } from "@/components/OverlayClueModal";

type RoomArtifactsProps = {
  mood: string;
  animate: boolean;
  animationKey: number;
  onRevealClue?: (clueId: ClueId) => void;
  discoveredClues?: Partial<Record<ClueId, boolean>>;
  visibleClues?: Partial<Record<ClueId, boolean>>;
  onDismissClue?: (clueId: ClueId) => void;
  questSteps?: QuestStatusStep[];
  isSurpriseAvailable?: boolean;
  isSurpriseClaimed?: boolean;
  onClaimSurprise?: () => void;
  showBirthdayDecor: boolean;
  onHideBirthdayDecor?: () => void;
  onOpenLetter?: () => void;
  onOpenRecipeBook?: () => void;
};

const CLUE_ALT_TEXT: Record<OverlayClueId, string> = {
  plant: "Trailing ivy plant in a pastel pot",
  window: "Sunlit window with an antique café clock",
};

const CLUE_ARIA_LABEL: Record<OverlayClueId, string> = {
  plant: "Inspect the ivy plant",
  window: "Inspect the sunlit window",
};

const CLUE_DIMENSIONS: Record<OverlayClueId, { width: number; height: number }> = {
  plant: { width: 200, height: 358 },
  window: { width: 190, height: 193 },
};

const CLUE_GLYPHS: Record<ClueId, string> = {
  plant: "☘︎",
  "frame-1": "✧",
  "frame-2": "✶",
  "frame-3": "❖",
  window: "ღ",
};

const FRAME_TO_CLUE: Record<FrameId, FrameClueId> = {
  "frame-1": "frame-1",
  "frame-2": "frame-2",
  "frame-3": "frame-3",
};

const STATIC_ARTIFACT_IDS: StaticArtifactId[] = ["frame-1", "frame-2", "frame-3", "letter", "shelf", "toy"];

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
  toy: {
    src: "/room/Flag_crop.png",
    alt: "Pastel pennant garland",
    width: 322,
    height: 450,
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
  visibleClues,
  onDismissClue,
  questSteps,
  isSurpriseAvailable,
  isSurpriseClaimed,
  onClaimSurprise,
  showBirthdayDecor,
  onHideBirthdayDecor,
  onOpenLetter,
  onOpenRecipeBook,
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
  const [activeOverlayClue, setActiveOverlayClue] = useState<OverlayClueId | null>(null);
  const [isPresentOpened, setIsPresentOpened] = useState(false);
  const [isSurprisePillCollapsed, setIsSurprisePillCollapsed] = useState(false);
  const isQuestComplete = useMemo(
    () => questSteps?.every((step) => step.isComplete) ?? false,
    [questSteps]
  );
  const shouldShowStoredDialogBase = useMemo(
    () => isSurpriseClaimed || isQuestComplete,
    [isQuestComplete, isSurpriseClaimed]
  );
  const previousShouldShowRef = useRef(false);

  useEffect(() => {
    if (!showBirthdayDecor) {
      setIsPresentOpened(false);
    }
  }, [showBirthdayDecor]);

  useEffect(() => {
    if (shouldShowStoredDialogBase && !previousShouldShowRef.current) {
      setIsSurprisePillCollapsed(false);
    }

    if (!shouldShowStoredDialogBase) {
      setIsSurprisePillCollapsed(false);
    }

    previousShouldShowRef.current = shouldShowStoredDialogBase;
  }, [shouldShowStoredDialogBase]);

  useEffect(() => {
    if (showBirthdayDecor) {
      setIsSurprisePillCollapsed(true);
    }
  }, [showBirthdayDecor]);

  useEffect(() => {
    if (!visibleClues) {
      return;
    }

    const nextOverlayClue = OVERLAY_CLUE_IDS.find((clueId) => visibleClues[clueId]);
    if (nextOverlayClue) {
      setActiveOverlayClue((previous) => (previous === nextOverlayClue ? previous : nextOverlayClue));
    }
  }, [visibleClues]);

  const activeFrameClueId: FrameClueId | null = activeFrame ? FRAME_TO_CLUE[activeFrame] : null;
  const activeFrameStep = activeFrameClueId
    ? questSteps?.[CLUE_ID_TO_INDEX[activeFrameClueId]]
    : undefined;
  const activeFrameSolved = Boolean(activeFrameStep?.isComplete);
  const activeFrameClueSubtitle = activeFrameStep?.subtitle;
  const activeFrameTreatName = (() => {
    const treatKey = activeFrameStep?.treatKey;
    if (!treatKey) {
      return null;
    }
    return getTreatByKey(treatKey)?.name ?? null;
  })();

  const shouldRenderStatusPill = shouldShowStoredDialogBase && !isSurprisePillCollapsed;
  const statusPillStyle = buildPlacementStyle(BIRTHDAY_UI_PLACEMENTS["birthday-status-pill"]);
  const shouldRenderReturnPill = showBirthdayDecor && isSurpriseClaimed && Boolean(onHideBirthdayDecor);
  const returnPillStyle = buildPlacementStyle(BIRTHDAY_UI_PLACEMENTS["birthday-return-pill"]);

  return (
    <>
      <div className={containerClassName} data-variant={variantKey}>
        {OVERLAY_CLUE_IDS.map((clueId, index) => {
          const assetSrc = artifacts[clueId];
          const isFound = Boolean(discoveredClues?.[clueId]);
          const dimensions = CLUE_DIMENSIONS[clueId];
          const placement = ROOM_ARTIFACT_PLACEMENTS[clueId];
          const triggerStyle = buildPlacementStyle(placement);
          const isActive = activeOverlayClue === clueId;

          const handleClueTrigger = () => {
            onRevealClue?.(clueId);
            setActiveOverlayClue(clueId);
          };

          return (
            <div
              key={`${clueId}-${variantKey}`}
              className={`room-artifacts__clue-zone room-artifacts__clue-zone--${clueId}`}
              style={triggerStyle as CSSProperties}
              data-clue={clueId}
            >
              <button
                type="button"
                className={`room-artifacts__trigger room-artifacts__trigger--${clueId} ${
                  isFound ? "room-artifacts__trigger--found" : ""
                }`}
                onClick={handleClueTrigger}
                aria-pressed={isFound}
                aria-label={CLUE_ARIA_LABEL[clueId]}
                aria-haspopup="dialog"
                data-active={isActive || undefined}
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
            </div>
          );
        })}

        {STATIC_ARTIFACT_IDS.map((decorId) => {
          const decor = STATIC_DECOR[decorId];
          const placement = STATIC_ARTIFACT_PLACEMENTS[decorId];
          const style = buildPlacementStyle(placement);
          const isFrame = FRAME_IDS.includes(decorId as FrameId);
          const isLetter = decorId === "letter";
          const isShelf = decorId === "shelf";

          if (isFrame) {
            const frameId = decorId as FrameId;
            const frameClueId = FRAME_TO_CLUE[frameId];
            const frameStepIndex = CLUE_ID_TO_INDEX[frameClueId];
            const frameStep = questSteps?.[frameStepIndex];
            const isFrameSolved = Boolean(frameStep?.isComplete);
            const handleFrameClick = () => {
              onRevealClue?.(frameClueId);
              setActiveFrame(frameId);
            };

            return (
              <button
                key={`${decorId}-${variantKey}`}
                type="button"
                className={`room-artifacts__decor room-artifacts__decor--${decorId} room-artifacts__frame-button ${
                  isFrameSolved ? "room-artifacts__frame-button--solved" : ""
                }`}
                style={style}
                onClick={handleFrameClick}
                aria-haspopup="dialog"
                aria-label={`Open ${decor.alt}`}
                aria-pressed={Boolean(discoveredClues?.[frameClueId])}
                data-artifact={decorId}
                data-clue={frameClueId}
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

          if (isShelf) {
            return (
              <button
                key={`${decorId}-${variantKey}`}
                type="button"
                className={`room-artifacts__decor room-artifacts__decor--${decorId} room-artifacts__shelf-button`}
                style={style}
                onClick={() => onOpenRecipeBook?.()}
                aria-haspopup="dialog"
                aria-label="Open the recipe book"
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
          const canClaimSurprise = Boolean(onClaimSurprise);
          const showRewardPrompt =
            isGift && showBirthdayDecor && canClaimSurprise && isSurpriseAvailable && !isSurpriseClaimed;
          const shouldRenderGiftAsset = showBirthdayDecor;
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
                <>
                  {shouldRenderGiftAsset ? (
                    <button
                      type="button"
                      className="room-artifacts__party-button"
                      onClick={() => setIsPresentOpened((previous) => !previous)}
                      aria-pressed={isPresentOpened}
                      aria-label={isPresentOpened ? "Close the birthday gift" : "Open the birthday gift"}
                    >
                      <Image src={assetSrc} alt={assetAlt} {...commonProps} />
                    </button>
                  ) : null}
                  {showRewardPrompt ? (
                    <button
                      type="button"
                      className="clue-popup clue-popup--visible clue-popup--reward"
                      onClick={() => onClaimSurprise?.()}
                      aria-label="Claim the birthday surprise treat"
                    >
                      <span className="clue-popup__glyph" aria-hidden>
                        🎁
                      </span>
                      <p className="clue-popup__title">Hidden Parcel</p>
                      <p className="clue-popup__body">Tap to tuck the confetti cake into inventory.</p>
                    </button>
                  ) : null}
                </>
              ) : (
                <Image src={assetSrc} alt={assetAlt} {...commonProps} />
              )}
            </div>
          );
        })}

        {shouldRenderStatusPill ? (
          <div
            className="room-artifacts__ui room-artifacts__ui--status"
            style={statusPillStyle}
          >
            <div className="clue-pill clue-pill--status" role="status" aria-live="polite">
              <span className="clue-pill__glyph" aria-hidden>
                🎉
              </span>
              <span className="clue-pill__label">Surprise Stored</span>
              <span className="clue-pill__hint">Feed the cat to celebrate</span>
              <button
                type="button"
                className="clue-pill__close"
                onClick={() => setIsSurprisePillCollapsed(true)}
                aria-label="Hide birthday surprise reminder"
              >
                ×
              </button>
            </div>
          </div>
        ) : null}
        {shouldRenderReturnPill ? (
          <div
            className="room-artifacts__ui room-artifacts__ui--return"
            style={returnPillStyle}
          >
            <button
              type="button"
              className="clue-pill clue-pill--secondary"
              onClick={onHideBirthdayDecor}
              aria-label="Return the café to its usual decor"
            >
              <span aria-hidden>🕯️</span>
              <span className="clue-pill__label">Return to cozy café</span>
            </button>
          </div>
        ) : null}
      </div>

      {activeFrame ? (
        <FrameGalleryModal
          frameId={activeFrame}
          onClose={() => setActiveFrame(null)}
          isClueSolved={activeFrameSolved}
          clueHint={activeFrameClueSubtitle}
          solvedTreatName={activeFrameTreatName ?? undefined}
        />
      ) : null}
      {activeOverlayClue ? (
        <OverlayClueModal
          clueId={activeOverlayClue}
          glyph={CLUE_GLYPHS[activeOverlayClue]}
          step={questSteps?.[CLUE_ID_TO_INDEX[activeOverlayClue]]}
          onClose={() => {
            onDismissClue?.(activeOverlayClue);
            setActiveOverlayClue(null);
          }}
        />
      ) : null}
    </>
  );
}
