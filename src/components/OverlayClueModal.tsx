import { useId } from "react";
import type { MouseEvent } from "react";
import type { OverlayClueId } from "@/data/mysteryClues";
import type { QuestStatusStep } from "@/context/QuestContext";

type OverlayClueModalProps = {
  clueId: OverlayClueId;
  glyph: string;
  step?: QuestStatusStep;
  onClose: () => void;
};

export function OverlayClueModal({ clueId, glyph, step, onClose }: OverlayClueModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  const title = step?.isComplete ? step.label : "Encrypted Hint";
  const description = step?.subtitle ?? "A curious clue awaits discovery.";

  const handleOverlayClick = () => {
    onClose();
  };

  const handleModalClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div className="overlay-clue-modal__overlay" role="presentation" onClick={handleOverlayClick}>
      <div
        className="overlay-clue-modal pixel-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        data-clue={clueId}
        onClick={handleModalClick}
      >
        <button
          type="button"
          className="overlay-clue-modal__close"
          onClick={onClose}
          aria-label="Close clue modal"
        >
          ×
        </button>
        <span className="overlay-clue-modal__glyph" aria-hidden>
          {glyph}
        </span>
        <h2 id={titleId} className="overlay-clue-modal__title">
          {title}
        </h2>
        <p id={descriptionId} className="overlay-clue-modal__body">
          {description}
        </p>
      </div>
    </div>
  );
}
