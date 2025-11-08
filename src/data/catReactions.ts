import type { TreatRecipe } from "@/data/treatRecipes";

export type CatReaction = {
  mood: string;
  sprite: string;
  message: string;
};

export const CAT_REACTIONS: Record<string, CatReaction> = {
  "Milky Tuna Tart": {
    mood: "happy",
    sprite: "/cats/happy.png",
    message: "Purrfect combo!",
  },
  "Honey Loaf": {
    mood: "sleepy",
    sprite: "/cats/sleepy.png",
    message: "Sugar dreams~",
  },
  "Butternip Cookie": {
    mood: "playful",
    sprite: "/cats/playful.png",
    message: "Catnip twirls ignite zoomies!",
  },
  "Honeyed Fish Bites": {
    mood: "happy",
    sprite: "/cats/happy.png",
    message: "Sweet glaze plus fish flakes? Jubilant whisker wiggles!",
  },
  "Fluffy Catnip Scones": {
    mood: "playful",
    sprite: "/cats/playful.png",
    message: "The cat stacks scones like towers before pouncing them apart.",
  },
  "Sweet Milkbread Twist": {
    mood: "sleepy",
    sprite: "/cats/sleepy.png",
    message: "Warm carb lullaby achieved. Nap countdown engaged.",
  },
  "Birthday Surprise Cake": {
    mood: "happy",
    sprite: "/cats/happy.png",
    message: "Confetti sneezes! It's party time in the café.",
  },
};

export const DEFAULT_CAT_REACTION: CatReaction = {
  mood: "curious",
  sprite: "/cats/curious.png",
  message: "The cat tilts its head curiously.",
};

export const IDLE_CAT_REACTION: CatReaction = {
  mood: "sleepy",
  sprite: "/cats/sleepy.png",
  message: "The cat curls into a drowsy loaf.",
};

export function getReactionForTreat(treat: TreatRecipe | null): {
  reaction: CatReaction;
  treatName: string;
} {
  if (!treat) {
    return {
      reaction: DEFAULT_CAT_REACTION,
      treatName: "Awaiting treat",
    };
  }

  const reaction = CAT_REACTIONS[treat.name] ?? DEFAULT_CAT_REACTION;
  return {
    reaction,
    treatName: treat.name,
  };
}
