"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BakeModal } from "@/components/BakeModal";
import { CatDisplay } from "@/components/CatDisplay";
import { MusicPlayer } from "@/components/MusicPlayer";
import { InventoryModal } from "@/components/InventoryModal";
import { RecipeBookModal } from "@/components/RecipeBookModal";
import {
  DEFAULT_CAT_REACTION,
  IDLE_CAT_REACTION,
  getReactionForTreat,
  type CatReaction,
} from "@/data/catReactions";
import { BIRTHDAY_SURPRISE_TREAT, type TreatRecipe } from "@/data/treatRecipes";
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
  const [isRecipeBookOpen, setIsRecipeBookOpen] = useState(false);
  const [catReaction, setCatReaction] = useState(DEFAULT_CAT_REACTION);
  const [catTreatName, setCatTreatName] = useState(DEFAULT_TREAT_LABEL);
  const [catAnimationKey, setCatAnimationKey] = useState(0);
  const [showBirthdayDecor, setShowBirthdayDecor] = useState(false);
  const [isBirthdayWinkActive, setIsBirthdayWinkActive] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [showEntryOverlay, setShowEntryOverlay] = useState(() => {
    if (typeof window !== "undefined") {
      return !window.localStorage.getItem(ENTRY_OVERLAY_STORAGE_KEY);
    }
    return true;
  });
  const [visibleClues, setVisibleClues] = useState<Record<ClueId, boolean>>(() =>
    CLUE_IDS.reduce((accumulator, clueId) => {
      accumulator[clueId] = false;
      return accumulator;
    }, {} as Record<ClueId, boolean>)
  );
  const { markSeen } = useEntryOverlayState(() => {
    setShowEntryOverlay(false);
  });
  const { items, feedTreat, addTreat } = useInventory();
  const { status, registerTreatFed, claimBirthdaySurprise } = useQuest();
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
  const birthdayWinkTimeoutRef = useRef<number | null>(null);

  const clearBirthdayWinkTimeout = useCallback(() => {
    if (birthdayWinkTimeoutRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(birthdayWinkTimeoutRef.current);
      birthdayWinkTimeoutRef.current = null;
    }
  }, []);

  const scheduleBirthdayWink = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    clearBirthdayWinkTimeout();
    setIsBirthdayWinkActive(false);

    birthdayWinkTimeoutRef.current = window.setTimeout(() => {
      setIsBirthdayWinkActive(true);
      birthdayWinkTimeoutRef.current = null;
    }, 12_000);
  }, [clearBirthdayWinkTimeout]);

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

  const handleDismissClue = useCallback((clueId: ClueId) => {
    setVisibleClues((previous) => {
      if (!previous[clueId]) {
        return previous;
      }
      return {
        ...previous,
        [clueId]: false,
      };
    });
  }, []);

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
    setVisibleClues((previous) => ({
      ...previous,
      [clueId]: true,
    }));
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
    setCatReaction((previous) => ({
      ...previous,
      sprite: nextReaction.sprite,
      message: nextReaction.message,
    }));
    setCatAnimationKey((previous) => previous + 1);
    resetIdleTimer();
  }, [resetIdleTimer, setCatAnimationKey, setCatReaction]);

  const revealBirthdayDecor = useCallback(
    (treat: TreatRecipe) => {
      if (treat.key === BIRTHDAY_SURPRISE_TREAT.key) {
        setShowBirthdayDecor(true);
        scheduleBirthdayWink();
      }
    },
    [scheduleBirthdayWink]
  );

  useEffect(() => {
    if (!showBirthdayDecor) {
      clearBirthdayWinkTimeout();
      setIsBirthdayWinkActive(false);
      return;
    }

    scheduleBirthdayWink();

    return () => {
      clearBirthdayWinkTimeout();
    };
  }, [showBirthdayDecor, clearBirthdayWinkTimeout, scheduleBirthdayWink]);

  useEffect(() => {
    return () => {
      clearBirthdayWinkTimeout();
    };
  }, [clearBirthdayWinkTimeout]);

  const catSprite = useMemo(() => {
    if (isBirthdayWinkActive) {
      return "/cats/Birthday_wink.png";
    }

    if (showBirthdayDecor) {
      return "/cats/Happy_Bday.png";
    }

    return catReaction.sprite;
  }, [catReaction.sprite, isBirthdayWinkActive, showBirthdayDecor]);


  const handleTreatDelivered = (inventoryId: string) => {
    const treat = feedTreat(inventoryId);
    if (!treat) {
      applyCatReaction(null);
      return;
    }

    if (treat.key === BIRTHDAY_SURPRISE_TREAT.key) {
      addTreat(treat);
    }

    applyCatReaction(treat);
    registerTreatFed(treat);
    revealBirthdayDecor(treat);
  };

  const handleFeedFromModal = (treat: TreatRecipe) => {
    if (treat.key === BIRTHDAY_SURPRISE_TREAT.key) {
      addTreat(treat);
    }

    applyCatReaction(treat);
    registerTreatFed(treat);
    revealBirthdayDecor(treat);
    setIsBakeOpen(false);
  };

  const handleHideBirthdayDecor = useCallback(() => {
    clearBirthdayWinkTimeout();
    setShowBirthdayDecor(false);
    setIsBirthdayWinkActive(false);
  }, [clearBirthdayWinkTimeout]);

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
          <header className="room-header">
            <h1 className="room-title">Mia's Cat Café</h1>
          </header>

          <div className="room-body">
            <CatDisplay
              onDropTreat={handleTreatDelivered}
              spriteSrc={catSprite}
              mood={catReaction.mood}
              statusTreatName={catTreatName}
              animationKey={catAnimationKey}
              onRevealClue={handleRevealClue}
              discoveredClues={discoveredClues}
              visibleClues={visibleClues}
              onDismissClue={handleDismissClue}
              questSteps={status.steps}
              isSurpriseAvailable={status.isSurpriseAvailable}
              isSurpriseClaimed={status.isSurpriseClaimed}
              onClaimSurprise={claimBirthdaySurprise}
              showBirthdayDecor={showBirthdayDecor}
              onHideBirthdayDecor={handleHideBirthdayDecor}
              onOpenLetter={() => setIsLetterOpen(true)}
              onOpenRecipeBook={() => setIsRecipeBookOpen(true)}
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
          </div>

          <MusicPlayer mood={catReaction.mood} isBirthdayActive={showBirthdayDecor} />
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
        title="For my pookie :)"
        body={
          <>
           <p>
             Happy Birthday my babyyy! I hope this little surprise could make this 22nd birthday a bit more special than it already is! 
            </p>
            <p>
             I was thinking of how much you always want to go to cat cafes and also how much you want to bake and share ur treats! So I thought about how I can give u a little bit of both hehehe. I wish I could be there with you to actually take you to the cat place again.I love you and wish you the happiest birthday everrrr!!!  mwuah mwuahh
            </p>
          </>
        }
        footerNote="lots of love, ur pookie <3"
      />
      <EntryOverlay
        isOpen={showEntryOverlay}
        onDismiss={() => {
          markSeen();
          setShowEntryOverlay(false);
        }}
      />
      <RecipeBookModal
        isOpen={isRecipeBookOpen}
        onClose={() => setIsRecipeBookOpen(false)}
      />
    </>
  );
}
