"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BakeModal } from "@/components/BakeModal";
import { CatDisplay } from "@/components/CatDisplay";
import { MusicPlayer } from "@/components/MusicPlayer";
import { InventoryModal } from "@/components/InventoryModal";
import { MysteryClues } from "@/components/MysteryClues";
import {
  DEFAULT_CAT_REACTION,
  IDLE_CAT_REACTION,
  getReactionForTreat,
  type CatReaction,
} from "@/data/catReactions";
import type { TreatRecipe } from "@/data/treatRecipes";
import { useInventory } from "@/context/InventoryContext";
import { useQuest } from "@/context/QuestContext";
import { CLUE_IDS, type ClueId } from "@/data/mysteryClues";
import { LetterModal } from "@/components/LetterModal";
import {
  EntryOverlay,
  useEntryOverlayState,
  ENTRY_OVERLAY_STORAGE_KEY,
} from "@/components/EntryOverlay";

const IDLE_TIMEOUT_MS = 60_000;
const IDLE_TREAT_LABEL = "Dozing off";
const DEFAULT_TREAT_LABEL = "Awaiting treat";

const PETTING_REACTIONS: CatReaction[] = [
  DEFAULT_CAT_REACTION,
  {
    mood: "playful",
    sprite: "/cats/playful.png",
    message: "Playful paws bat at invisible strings.",
  },
  {
    mood: "comfy",
    sprite: "/cats/Sit.png",
    message: "The cat settles into a comfy sit, soaking up the attention.",
  },
  {
    mood: "wide-eyed",
    sprite: "/cats/Sit Open.png",
    message: "Wide eyes sparkle as the cat awaits the next surprise.",
  },
  {
    mood: "sneaky",
    sprite: "/cats/Crouch_1.png",
    message: "A crouched wiggle hints at a playful pounce in the making.",
  },
];

export default function Home() {
  const [isBakeOpen, setIsBakeOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [catReaction, setCatReaction] = useState(DEFAULT_CAT_REACTION);
  const [catTreatName, setCatTreatName] = useState(DEFAULT_TREAT_LABEL);
  const [catAnimationKey, setCatAnimationKey] = useState(0);
  const [showBirthdayDecor, setShowBirthdayDecor] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [showEntryOverlay, setShowEntryOverlay] = useState(() => {
    if (typeof window !== "undefined") {
      return !window.localStorage.getItem(ENTRY_OVERLAY_STORAGE_KEY);
    }
    return true;
  });
  const { markSeen } = useEntryOverlayState(() => {
    setShowEntryOverlay(false);
  });
  const { items, feedTreat } = useInventory();
  const { registerTreatFed } = useQuest();
  const [discoveredClues, setDiscoveredClues] = useState<Record<ClueId, boolean>>(
    () =>
      CLUE_IDS.reduce((accumulator, clueId) => {
        accumulator[clueId] = false;
        return accumulator;
      }, {} as Record<ClueId, boolean>)
  );

  const storedTreatCount = items.length;
  const idleTimeoutRef = useRef<number | null>(null);
  const petCycleIndexRef = useRef(PETTING_REACTIONS.length > 1 ? 1 : 0);

  const resetIdleTimer = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (idleTimeoutRef.current !== null) {
      window.clearTimeout(idleTimeoutRef.current);
    }

    idleTimeoutRef.current = window.setTimeout(() => {
      idleTimeoutRef.current = null;
      let didUpdate = false;

      setCatReaction((current) => {
        if (
          current.mood === IDLE_CAT_REACTION.mood &&
          current.sprite === IDLE_CAT_REACTION.sprite &&
          current.message === IDLE_CAT_REACTION.message
        ) {
          return current;
        }

        didUpdate = true;
        return IDLE_CAT_REACTION;
      });

      if (didUpdate) {
        setCatTreatName(IDLE_TREAT_LABEL);
        setCatAnimationKey((previous) => previous + 1);
        petCycleIndexRef.current = 1;
      }
    }, IDLE_TIMEOUT_MS);
  }, [setCatAnimationKey, setCatReaction, setCatTreatName]);

  const revealedClues = useMemo(
    () => CLUE_IDS.filter((clueId) => discoveredClues[clueId]),
    [discoveredClues]
  );

  const handleRevealClue = useCallback((clueId: ClueId) => {
    setDiscoveredClues((previous) => {
      if (previous[clueId]) {
        return previous;
      }
      return {
        ...previous,
        [clueId]: true,
      };
    });
  }, []);

  const applyCatReaction = useCallback(
    (treat: TreatRecipe | null) => {
      const { reaction, treatName } = getReactionForTreat(treat);
      setCatReaction(reaction);
      setCatTreatName(treat ? treatName : DEFAULT_TREAT_LABEL);
      setCatAnimationKey((previous) => previous + 1);
      resetIdleTimer();
      petCycleIndexRef.current = 1;
    },
    [resetIdleTimer]
  );

  const handleCatPet = useCallback(() => {
    const nextReaction = PETTING_REACTIONS[petCycleIndexRef.current] ?? DEFAULT_CAT_REACTION;
    petCycleIndexRef.current = (petCycleIndexRef.current + 1) % PETTING_REACTIONS.length;
    setCatReaction(nextReaction);
    setCatAnimationKey((previous) => previous + 1);
    resetIdleTimer();
  }, [resetIdleTimer, setCatAnimationKey, setCatReaction]);

  const handleTreatDelivered = (inventoryId: string) => {
    const treat = feedTreat(inventoryId);
    if (!treat) {
      applyCatReaction(null);
      return;
    }

    applyCatReaction(treat);
    registerTreatFed(treat);
  };

  const handleFeedFromModal = (treat: TreatRecipe) => {
    applyCatReaction(treat);
    registerTreatFed(treat);
    setIsBakeOpen(false);
  };

  useEffect(() => {
    resetIdleTimer();

    return () => {
      if (idleTimeoutRef.current !== null) {
        window.clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [resetIdleTimer]);

  useEffect(() => {
    const handleActivity = () => {
      let wokeCat = false;

      setCatReaction((current) => {
        if (
          current.mood === IDLE_CAT_REACTION.mood &&
          current.sprite === IDLE_CAT_REACTION.sprite &&
          current.message === IDLE_CAT_REACTION.message
        ) {
          wokeCat = true;
          return DEFAULT_CAT_REACTION;
        }

        return current;
      });

      if (wokeCat) {
        setCatTreatName(DEFAULT_TREAT_LABEL);
        setCatAnimationKey((previous) => previous + 1);
        petCycleIndexRef.current = 1;
      }

      resetIdleTimer();
    };

    window.addEventListener("pointerdown", handleActivity);
    window.addEventListener("keydown", handleActivity);

    return () => {
      window.removeEventListener("pointerdown", handleActivity);
      window.removeEventListener("keydown", handleActivity);
    };
  }, [resetIdleTimer, setCatAnimationKey, setCatReaction, setCatTreatName]);

  return (
    <>
      <main className="room-scene text-[#4d3b8f]">
        <div className="room-wrapper">
          {/* <MysteryClues revealedClues={revealedClues} /> */}
          <header className="room-header">
            <h1 className="room-title">Mia's Cat Café</h1>
          </header>

          <div className="room-body">
            <CatDisplay
              onDropTreat={handleTreatDelivered}
              spriteSrc={catReaction.sprite}
              mood={catReaction.mood}
              statusTreatName={catTreatName}
              animationKey={catAnimationKey}
              onRevealClue={handleRevealClue}
              discoveredClues={discoveredClues}
              showBirthdayDecor={showBirthdayDecor}
              onOpenLetter={() => setIsLetterOpen(true)}
              onPet={handleCatPet}
            />
          </div>
        </div>

        <footer className="room-dock">
          <div className="room-dock__actions room-dock__actions--compact">
            <button
              type="button"
              onClick={() => setIsBakeOpen(true)}
              className="room-dock__mini-button"
            >
              <span aria-hidden>🍪</span>
              <span>Bake Treats</span>
            </button>
            <button
              type="button"
              onClick={() => setIsInventoryOpen(true)}
              className="room-dock__mini-button"
            >
              <span aria-hidden>📦</span>
              <span>Inventory</span>
              {storedTreatCount > 0 && (
                <span className="room-dock__mini-count">{storedTreatCount}</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowBirthdayDecor((previous) => !previous)}
              className={`room-dock__mini-button ${
                showBirthdayDecor ? "room-dock__mini-button--active" : ""
              }`}
              aria-pressed={showBirthdayDecor}
            >
              <span aria-hidden>🎈</span>
              <span>{showBirthdayDecor ? "Hide Party" : "Show Party"}</span>
            </button>
          </div>

          <MusicPlayer mood={catReaction.mood} />
        </footer>
      </main>

      <BakeModal
        isOpen={isBakeOpen}
        onClose={() => setIsBakeOpen(false)}
        onFeedTreat={handleFeedFromModal}
      />
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        onFeed={handleTreatDelivered}
      />
      <LetterModal
        isOpen={isLetterOpen}
        onClose={() => setIsLetterOpen(false)}
        title="Courier's Note"
        body={
          <>
            <p>
              A parcel arrived at dawn with a velvet ribbon and a note addressed to the café cat. The sender mentioned a celebration that is nearly ready, and asked that we keep the surprise safe until every clue is solved.
            </p>
            <p>
              When the time feels right, share this letter with our feline host—the gifts tucked away nearby will make far more sense.
            </p>
          </>
        }
        footerNote="With fondness, The Midnight Courier"
      />
      <EntryOverlay
        isOpen={showEntryOverlay}
        onDismiss={() => {
          markSeen();
          setShowEntryOverlay(false);
        }}
      />
    </>
  );
}
