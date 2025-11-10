"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_TREAT,
  TreatRecipe,
  getTreatForIngredients,
} from "@/data/treatRecipes";
import { useInventory } from "@/context/InventoryContext";
import { useQuest } from "@/context/QuestContext";
import { useRecipeUnlocks } from "@/context/RecipeUnlocksContext";

type Ingredient = {
  id: string;
  icon: string;
  label: string;
  flavorNote: string;
};

const INGREDIENTS: Ingredient[] = [
  { id: "milk", icon: "🍶", label: "Milk", flavorNote: "silky foam" },
  { id: "fish", icon: "🐟", label: "Fish", flavorNote: "savory crunch" },
  { id: "honey", icon: "🍯", label: "Honey", flavorNote: "sunny glaze" },
  { id: "catnip", icon: "🌿", label: "Catnip", flavorNote: "minty sparkle" },
  { id: "butter", icon: "🧈", label: "Butter", flavorNote: "golden melt" },
  { id: "flour", icon: "🌾", label: "Flour", flavorNote: "cloud-soft crumb" },
  { id: "berries", icon: "🫐", label: "Berries", flavorNote: "twilight jam" },
  { id: "cream", icon: "🍨", label: "Cream", flavorNote: "whipped snow" },
];

type BakeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onFeedTreat?: (treat: TreatRecipe) => void;
};

type BakePhase = "idle" | "processing" | "result";

const BAKE_DELAY_MS = 1500;

// BakeModal houses the full ingredient selection and treat reveal workflow.
export function BakeModal({ isOpen, onClose, onFeedTreat }: BakeModalProps) {
  const [selection, setSelection] = useState<string[]>([]);
  const [treatResult, setTreatResult] = useState<TreatRecipe>(DEFAULT_TREAT);
  const [phase, setPhase] = useState<BakePhase>("idle");
  const [hasStoredResult, setHasStoredResult] = useState(false);
  const bakeTimeoutRef = useRef<number | null>(null);
  const { addTreat } = useInventory();
  const { registerTreatBaked } = useQuest();
  const { unlockTreat } = useRecipeUnlocks();

  useEffect(() => {
    return () => {
      if (bakeTimeoutRef.current) {
        window.clearTimeout(bakeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleRequestClose = useCallback(() => {
    if (bakeTimeoutRef.current) {
      window.clearTimeout(bakeTimeoutRef.current);
      bakeTimeoutRef.current = null;
    }
    setSelection([]);
    setTreatResult(DEFAULT_TREAT);
    setPhase("idle");
    setHasStoredResult(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleRequestClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRequestClose, isOpen]);

  const toggleSelection = (ingredientId: string) => {
    if (phase === "processing") {
      return;
    }

    if (phase === "result") {
      setPhase("idle");
      setTreatResult(DEFAULT_TREAT);
      setHasStoredResult(false);
    }

    setSelection((prevSelection) => {
      const isSelected = prevSelection.includes(ingredientId);

      if (isSelected) {
        return prevSelection.filter((id) => id !== ingredientId);
      }

      if (prevSelection.length >= 3) {
        return prevSelection;
      }

      return [...prevSelection, ingredientId];
    });
  };

  const selectedIngredients = useMemo(
    () => INGREDIENTS.filter((ingredient) => selection.includes(ingredient.id)),
    [selection]
  );

  const ingredientPreview = selectedIngredients.length
    ? selectedIngredients.map((ingredient) => ingredient.label).join(" + ")
    : "No ingredients yet";

  const handleMixAndBake = () => {
    if (phase === "processing") {
      return;
    }

    if (selection.length < 2 || selection.length > 3) {
      return;
    }

    setTreatResult(DEFAULT_TREAT);
    setPhase("processing");
    setHasStoredResult(false);

    const treat = getTreatForIngredients(selection);
    if (bakeTimeoutRef.current) {
      window.clearTimeout(bakeTimeoutRef.current);
    }

    bakeTimeoutRef.current = window.setTimeout(() => {
      setTreatResult(treat);
      setPhase("result");
      registerTreatBaked(treat);
      if (!treat.isMystery) {
        unlockTreat(treat.key);
      }
      bakeTimeoutRef.current = null;
    }, BAKE_DELAY_MS);
  };

  const handleStoreTreat = useCallback(() => {
    if (phase !== "result" || hasStoredResult) {
      return;
    }

    addTreat(treatResult);
    setHasStoredResult(true);
  }, [addTreat, hasStoredResult, phase, treatResult]);

  const handleFeedTreat = useCallback(() => {
    if (phase !== "result" || !onFeedTreat) {
      return;
    }

    onFeedTreat(treatResult);
    handleRequestClose();
  }, [handleRequestClose, onFeedTreat, phase, treatResult]);

  if (!isOpen) {
    return null;
  }

  const showProcessing = phase === "processing";
  const showResult = phase === "result";
  const showIdle = phase === "idle";

  const handleBakeAgain = () => {
    if (bakeTimeoutRef.current) {
      window.clearTimeout(bakeTimeoutRef.current);
      bakeTimeoutRef.current = null;
    }

    setTreatResult(DEFAULT_TREAT);
    setPhase("idle");
    setHasStoredResult(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#4d3b8f]/60 px-4"
      role="presentation"
      onClick={handleRequestClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bake-modal-heading"
        className="pixel-modal relative flex w-full max-w-sm flex-col items-center overflow-y-auto px-5 py-6 text-center max-h-[90vh]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close modal"
          onClick={handleRequestClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border-[3px] border-[#4d3b8f] bg-[#f8bcd4] text-[0.75rem] text-[#4d3b8f] shadow-[0_3px_0_#4d3b8f] transition-transform hover:-translate-y-0.5"
        >
          ✕
        </button>
        {showIdle && (
          <div className="flex w-full flex-1 flex-col items-center gap-5 pt-4 pb-2">
            <p
              id="bake-modal-heading"
              className="text-[0.6rem] uppercase tracking-[0.35em]"
            >
              Baking Corner
            </p>

            <p className="w-full text-[0.6rem] leading-relaxed text-[#4d3b8f]/80">
              Tap ingredients to craft a treat. These results will soon feed into your café inventory!
            </p>

            <div className="pixel-panel w-full px-4 py-5">
              <p className="mb-4 text-center text-[0.6rem] uppercase tracking-[0.35em] text-[#4d3b8f]">
                Choose ingredients
              </p>
              <div className="grid grid-cols-2 gap-3">
                {INGREDIENTS.map((ingredient) => {
                  const isSelected = selection.includes(ingredient.id);
                  return (
                    <button
                      key={ingredient.id}
                      type="button"
                      onClick={() => toggleSelection(ingredient.id)}
                      aria-pressed={isSelected}
                      className={`pixel-tile text-[#4d3b8f] ${
                        isSelected ? "pixel-tile--selected" : ""
                      }`}
                    >
                      <span className="text-3xl" aria-hidden>
                        {ingredient.icon}
                      </span>
                      <span className="text-[0.55rem] uppercase tracking-[0.3em]">
                        {ingredient.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="w-full text-[0.55rem] uppercase tracking-[0.25em] text-[#4d3b8f]">
              Current plan: {ingredientPreview}
            </p>

            <div className="flex w-full flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleMixAndBake}
                disabled={selection.length < 2 || selection.length > 3}
                className="pixel-button inline-flex w-full items-center justify-center gap-3 px-5 py-3 text-[0.55rem] uppercase tracking-[0.35em] text-[#4d3b8f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>Mix & Bake</span>
                <span aria-hidden>🍰</span>
              </button>
              <p className="w-full text-center text-[0.45rem] uppercase tracking-[0.3em] opacity-60">
                Choose 2 or 3 ingredients. Store finished treats from the result screen to feed your cat later.
              </p>
            </div>
          </div>
        )}

        {showProcessing && (
          <>
            <p
              id="bake-modal-heading"
              className="text-[0.6rem] uppercase tracking-[0.35em]"
            >
              Mixing in progress…
            </p>
            <p className="mt-4 text-[0.6rem] leading-relaxed text-[#4d3b8f]/80">
              Your chosen ingredients swirl through a cozy portal.
            </p>
            <div className="mt-6 flex w-full justify-center">
              <div className="w-full max-w-[180px] overflow-hidden rounded-lg border-[3px] border-[#4d3b8f] bg-[#bfa9ff] p-4 shadow-[0_4px_0_#4d3b8f]">
                <div className="relative h-28 w-full">
                  <div className="absolute inset-0 animate-cookPortal cook-portal-gradient" />
                  <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#fff9e6] bg-[#c1f0d9] shadow-[0_4px_0_#4d3b8f]">
                    <div className="h-full w-full animate-cookStir cook-stir-gradient" />
                  </div>
                  <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 text-[0.6rem] text-[#fff9e6]">
                    <span className="animate-cookBlink">✿</span>
                    <span className="animate-cookBlink animation-delay-150">★</span>
                    <span className="animate-cookBlink animation-delay-300">✿</span>
                  </div>
                </div>
                <p className="mt-3 text-center text-[0.55rem] uppercase tracking-[0.3em] text-[#fff9e6]">
                  Brewing magic…
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRequestClose}
              className="pixel-button mt-6 inline-flex w-full items-center justify-center px-4 py-3 text-[0.55rem] uppercase tracking-[0.3em] text-[#4d3b8f]"
            >
              Cancel
            </button>
          </>
        )}

        {showResult && (
          <>
            <p
              id="bake-modal-heading"
              className="text-[0.6rem] uppercase tracking-[0.35em]"
            >
              Treat Ready!
            </p>

            <div className="mt-5 flex flex-1 flex-col items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-lg border-[3px] border-[#4d3b8f] bg-[#fff9e6] shadow-[0_4px_0_#4d3b8f]">
                <Image
                  src={treatResult.sprite}
                  alt={treatResult.name}
                  width={80}
                  height={80}
                  className="image-render-pixel"
                />
              </div>
              <p className="pixel-textbox w-full text-center text-[0.6rem] uppercase tracking-[0.3em]">
                {treatResult.name}
                <span className="pixel-cursor" aria-hidden>
                  _
                </span>
              </p>
              <p className="text-center text-[0.6rem] leading-relaxed">
                {treatResult.description}
              </p>
              <div className="w-full rounded-lg border-[3px] border-dashed border-[#4d3b8f] bg-[#c1f0d9] px-3 py-2 text-center text-[0.55rem] uppercase tracking-[0.3em] text-[#4d3b8f]">
                Ingredients used: {ingredientPreview}
              </div>
            </div>

            <div className="mt-4 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleStoreTreat}
                disabled={hasStoredResult}
                className="pixel-button inline-flex w-auto items-center justify-center px-4 py-2 text-[0.5rem] uppercase tracking-[0.3em] text-[#4d3b8f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {hasStoredResult ? "Stored!" : "Store in Inventory"}
              </button>
              <p
                className="text-center text-[0.45rem] uppercase tracking-[0.3em] text-[#4d3b8f]/70"
                aria-live="polite"
              >
                {hasStoredResult
                  ? "Visit your inventory to feed this treat."
                  : "Save this treat to feed your cat later."}
              </p>
              <button
                type="button"
                onClick={handleFeedTreat}
                className="pixel-button inline-flex w-auto items-center justify-center gap-2 px-4 py-2 text-[0.5rem] uppercase tracking-[0.3em] text-[#4d3b8f]"
              >
                <span aria-hidden>🍽️</span>
                <span>Feed to Cat</span>
              </button>
              <button
                type="button"
                onClick={handleBakeAgain}
                className="pixel-button inline-flex w-auto items-center justify-center gap-2 px-4 py-2 text-[0.5rem] uppercase tracking-[0.3em] text-[#4d3b8f]"
              >
                <span aria-hidden>🔁</span>
                <span>Bake Another</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
