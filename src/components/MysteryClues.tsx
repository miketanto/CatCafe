"use client";

import { useMemo } from "react";
import { useQuest } from "@/context/QuestContext";
import { CLUE_ID_TO_INDEX, CLUE_IDS, type ClueId } from "@/data/mysteryClues";

const CLUE_GLYPHS = {
  window: "✶",
  plant: "☁︎",
  toy: "ღ",
} satisfies Record<ClueId, string>;

type MysteryCluesProps = {
  revealedClues: ClueId[];
};

export function MysteryClues({ revealedClues }: MysteryCluesProps) {
  const { status, claimBirthdaySurprise } = useQuest();
  const { steps, isSurpriseAvailable, isSurpriseClaimed } = status;

  const activeClues = useMemo(() => {
    return revealedClues.reduce(
      (accumulator, clueId) => {
        const stepIndex = CLUE_ID_TO_INDEX[clueId];
        const step = steps[stepIndex];
        if (step) {
          accumulator.push({ clueId, step });
        }
        return accumulator;
      },
      [] as { clueId: ClueId; step: (typeof steps)[number] }[]
    );
  }, [revealedClues, steps]);

  const allCluesFound = CLUE_IDS.every((id) => revealedClues.includes(id));

  return (
    <aside className="mystery-clues" aria-live="polite">
      {activeClues.map(({ clueId, step }) => (
        <article
          key={step.id}
          className={`mystery-clue ${
            step.isComplete ? "mystery-clue--solved" : ""
          }`}
          data-clue={clueId}
          aria-label={
            step.isComplete
              ? `${step.label} clue solved`
              : `Clue discovered in the ${clueId}`
          }
        >
          <span className="mystery-clue__glyph" aria-hidden>
            {CLUE_GLYPHS[clueId]}
          </span>
          <p className="mystery-clue__title">
            {step.isComplete ? step.label : "Encrypted Hint"}
          </p>
          <p className="mystery-clue__body">{step.subtitle}</p>
        </article>
      ))}

      {allCluesFound && isSurpriseAvailable && !isSurpriseClaimed && (
        <button
          type="button"
          className="mystery-clue mystery-clue--reward"
          onClick={claimBirthdaySurprise}
          aria-label="Reveal the birthday surprise treat"
          data-clue="reward"
        >
          <span className="mystery-clue__glyph" aria-hidden>
            🎁
          </span>
          <p className="mystery-clue__title">Hidden Parcel</p>
          <p className="mystery-clue__body">
            A ribboned package hums beneath the counter. Tap to uncover.
          </p>
        </button>
      )}

      {isSurpriseClaimed && (
        <div
          className="mystery-clue mystery-clue--reward mystery-clue--solved"
          role="status"
          data-clue="reward"
        >
          <span className="mystery-clue__glyph" aria-hidden>
            🎉
          </span>
          <p className="mystery-clue__title">Surprise Stored</p>
          <p className="mystery-clue__body">
            Check your inventory—the confetti cake is ready to serve.
          </p>
        </div>
      )}
    </aside>
  );
}
