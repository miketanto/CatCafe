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
    message: "This'll make me poop :o!",
  },
  "Honey Loaf": {
    mood: "sleepy",
    sprite: "/cats/sleepy.png",
    message: "Can we go nap nowww",
  },
  "Butternip Cookie": {
    mood: "playful",
    sprite: "/cats/playful.png",
    message: "Blelelele",
  },
  "Honeyed Fish Bites": {
    mood: "happy",
    sprite: "/cats/happy.png",
    message: "Yummm I love sweet treats!",
  },
  "Fluffy Catnip Scones": {
    mood: "playful",
    sprite: "/cats/playful.png",
    message: "catch me if u cann",
  },
  "Catnip Cloud Crisps": {
    mood: "playful",
    sprite: "/cats/playful.png",
    message: "Nom nom nom nom",
  },
  "Sweet Milkbread Twist": {
    mood: "sleepy",
    sprite: "/cats/sleepy.png",
    message: "Zzz... so comfy...",
  },
  "Cream Puff Pastry": {
    mood: "happy",
    sprite: "/cats/happy.png",
    message: "OH! Yumm :D",
  },
  "Golden Catnip Drops": {
    mood: "playful",
    sprite: "/cats/playful.png",
    message: "Wow this glows like your skin :)",
  },
  "Savory Fish Crackers": {
    mood: "happy",
    sprite: "/cats/happy.png",
    message: "umnom nom yum",
  },
  "Velvet Cream Cookies": {
    mood: "sleepy",
    sprite: "/cats/sleepy.png",
    message: "Mmm... so soft.. make sleepy",
  },
  "Honey Butter Biscuits": {
    mood: "happy",
    sprite: "/cats/happy.png",
    message: "*vigourously wiggles tongue*",
  },
  "Whisker Waffles": {
    mood: "playful",
    sprite: "/cats/playful.png",
    message: "I'm going to beat you at watermelon with this",
  },
  "Golden Fish Pie": {
    mood: "happy",
    sprite: "/cats/happy.png",
    message: "oooooh so goodd",
  },
  "Sweet Cream Muffins": {
    mood: "happy",
    sprite: "/cats/happy.png",
    message: "yummy and creammy ;)",
  },
  "Golden Shortbread": {
    mood: "happy",
    sprite: "/cats/happy.png",
    message: "RAHHHHHHH",
  },
  "Dreamy Catnip Custard": {
    mood: "sleepy",
    sprite: "/cats/sleepy.png",
    message: "can you cuddle me while i sleep?",
  },
  "Birthday Surprise Cake": {
    mood: "happy",
    sprite: "/cats/happy.png",
    message: "Sheng ri kuai le bao bei!!!",
  },
  "Mysterious Goo 🍯🐾": {
    mood: "curious",
    sprite: "/cats/curious.png",
    message: "ughgughg...maybee something else",
  },
};

export const DEFAULT_CAT_REACTION: CatReaction = {
  mood: "curious",
  sprite: "/cats/curious.png",
  message: "hmm?",
};

export const IDLE_CAT_REACTION: CatReaction = {
  mood: "sleepy",
  sprite: "/cats/sleepy.png",
  message: "bleh...zzzz...",
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
