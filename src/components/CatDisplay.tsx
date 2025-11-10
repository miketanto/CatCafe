import Image from "next/image";
import { useEffect, useState, DragEvent } from "react";
import { INVENTORY_DRAG_KEY } from "@/lib/inventoryDrag";
import { RoomArtifacts } from "@/components/RoomArtifacts";
import type { ClueId } from "@/data/mysteryClues";
import { CAT_REACTIONS } from "@/data/catReactions";
import type { QuestStatusStep } from "@/context/QuestContext";


type CatDisplayProps = {
  onDropTreat: (inventoryId: string) => void;
  spriteSrc: string;
  mood: string;
  statusTreatName: string;
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
  onOpenLetter: () => void;
  onOpenRecipeBook: () => void;
  onPet: () => void;
};

// CatDisplay anchors the pet at the center of the room scene and accepts dropped treats.
export function CatDisplay({
  onDropTreat,
  spriteSrc,
  mood,
  statusTreatName,
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
  onPet,
}: CatDisplayProps) {
  const [isDropActive, setIsDropActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dialogue, setDialogue] = useState<string | null>(null);
  const [dialogueKey, setDialogueKey] = useState(0);

  useEffect(() => {
    setIsAnimating(true);
    const timeout = window.setTimeout(() => {
      setIsAnimating(false);
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [animationKey]);

  useEffect(() => {
    const reactionEntry = CAT_REACTIONS[statusTreatName];
    if (!reactionEntry) {
      setDialogue(null);
      return;
    }

    setDialogue(reactionEntry.message);
    setDialogueKey((previous) => previous + 1);

    const timeout = window.setTimeout(() => {
      setDialogue(null);
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [animationKey, statusTreatName]);

  const isTreatPayload = (event: DragEvent<HTMLElement>) =>
    event.dataTransfer.types.includes(INVENTORY_DRAG_KEY);

  const handleDragEnter = (event: DragEvent<HTMLElement>) => {
    if (!isTreatPayload(event)) {
      return;
    }
    event.preventDefault();
    setIsDropActive(true);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    if (!isTreatPayload(event)) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsDropActive(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDropActive(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    if (!isTreatPayload(event)) {
      return;
    }
    event.preventDefault();
    const inventoryId = event.dataTransfer.getData(INVENTORY_DRAG_KEY);
    setIsDropActive(false);
    if (inventoryId) {
      onDropTreat(inventoryId);
    }
  };

  const isPartyActive = showBirthdayDecor;
  const displaySprite = spriteSrc;
  const spriteAlt = isPartyActive ? "Cat celebrating with a birthday cupcake" : `Cat feeling ${mood}`;

  return (
    <section
      className={`cat-habitat ${isDropActive ? "cat-habitat--active" : ""}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-live="polite"
    >
      <div className="cat-habitat__perch">
        <RoomArtifacts
          mood={mood}
          animate={isAnimating}
          animationKey={animationKey}
          onRevealClue={onRevealClue}
          discoveredClues={discoveredClues}
          visibleClues={visibleClues}
          onDismissClue={onDismissClue}
          questSteps={questSteps}
          isSurpriseAvailable={isSurpriseAvailable}
          isSurpriseClaimed={isSurpriseClaimed}
          onClaimSurprise={onClaimSurprise}
          showBirthdayDecor={showBirthdayDecor}
          onHideBirthdayDecor={onHideBirthdayDecor}
          onOpenLetter={onOpenLetter}
          onOpenRecipeBook={onOpenRecipeBook}
        />
        <div
          className={`cat-habitat__frame ${
            isAnimating ? "cat-habitat__frame--animate" : ""
          }`}
        >
          <button
            type="button"
            className="cat-habitat__sprite-button"
            onClick={onPet}
            aria-label="Give the café cat a gentle pet"
          >
            <Image
              src={displaySprite}
              alt={spriteAlt}
              width={58}
              height={58}
              className="cat-habitat__frame-image"
              priority
            />
          </button>
          {dialogue ? (
            <div key={dialogueKey} className="cat-dialogue" role="status">
              <p className="cat-dialogue__text">{dialogue}</p>
            </div>
          ) : null}
        </div>
      </div>
      <div className="cat-habitat__status">
        <div className="cat-habitat__status-card pixel-textbox">
          {statusTreatName}
          <span className="pixel-cursor" aria-hidden>
            _
          </span>
        </div>
      </div>
    </section>
  );
}
