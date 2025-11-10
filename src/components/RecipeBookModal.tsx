"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, MouseEvent } from "react";
import { createPortal } from "react-dom";
import { BAKEABLE_TREATS } from "@/data/treatRecipes";
import { useRecipeUnlocks } from "@/context/RecipeUnlocksContext";

const INGREDIENT_LABELS: Record<string, string> = {
  milk: "Milk",
  fish: "Fish",
  honey: "Honey",
  catnip: "Catnip",
  butter: "Butter",
  flour: "Flour",
  berries: "Berries",
  cream: "Cream",
};

type RecipeBookModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SORTED_RECIPES = [...BAKEABLE_TREATS].sort((a, b) =>
  a.name.localeCompare(b.name)
);

export function RecipeBookModal({ isOpen, onClose }: RecipeBookModalProps) {
  const { unlockedKeys } = useRecipeUnlocks();
  const unlockedSet = useMemo(
    () => new Set(unlockedKeys),
    [unlockedKeys]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [pageDirection, setPageDirection] = useState<"forward" | "backward">("forward");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

  setActiveIndex(0);
  setPageDirection("forward");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsMounted(false);
      return;
    }

    setIsMounted(true);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !isMounted) {
    return null;
  }

  const totalPages = SORTED_RECIPES.length;
  const currentRecipe = SORTED_RECIPES[activeIndex];
  const isUnlocked = unlockedSet.has(currentRecipe.key);
  const ingredients = currentRecipe.key.split("+").map((token) => {
    const trimmed = token.trim();
    return INGREDIENT_LABELS[trimmed] ?? trimmed;
  });

  const goToNext = () => {
    setPageDirection("forward");
    setActiveIndex((previous) =>
      previous + 1 >= totalPages ? 0 : previous + 1
    );
  };

  const goToPrevious = () => {
    setPageDirection("backward");
    setActiveIndex((previous) =>
      previous - 1 < 0 ? totalPages - 1 : previous - 1
    );
  };

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className="recipe-book__overlay" role="presentation" onClick={handleOverlayClick}>
      <div
        className="recipe-book pixel-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-book-heading"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="recipe-book__close"
          onClick={onClose}
          aria-label="Close recipe book"
        >
          ×
        </button>

        <header className="recipe-book__header">
          <p className="recipe-book__subtitle" id="recipe-book-heading">
            Café Recipe Book
          </p>
          <p className="recipe-book__pagination">
            Page {activeIndex + 1} / {totalPages}
          </p>
        </header>

        <div className="recipe-book__page">
          <div
            key={currentRecipe.key}
            className={`recipe-book__page-sheet recipe-book__page-sheet--${pageDirection}`}
          >
            <div className={`recipe-card ${isUnlocked ? "recipe-card--unlocked" : "recipe-card--locked"}`}>
            <div className="recipe-card__media">
              {isUnlocked ? (
                <Image
                  src={currentRecipe.sprite}
                  alt={currentRecipe.name}
                  width={96}
                  height={96}
                  className="recipe-card__image"
                />
              ) : (
                <div className="recipe-card__locked-icon" aria-hidden>
                  ★
                </div>
              )}
            </div>

            <div className="recipe-card__body">
              <h3 className="recipe-card__title">
                {isUnlocked ? currentRecipe.name : "Locked Recipe"}
              </h3>

              <p className="recipe-card__ingredients">
                Ingredients: {isUnlocked ? ingredients.join(" + ") : "???"}
              </p>

              <p className="recipe-card__description">
                {isUnlocked
                  ? currentRecipe.description
                  : "Experiment with new ingredient blends to reveal this treat."}
              </p>
            </div>
          </div>
          </div>
        </div>

        <footer className="recipe-book__footer">
          <button
            type="button"
            className="recipe-book__nav"
            onClick={goToPrevious}
            aria-label="Previous recipe"
          >
            ◄
          </button>
          <button
            type="button"
            className="recipe-book__nav"
            onClick={goToNext}
            aria-label="Next recipe"
          >
            ►
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
