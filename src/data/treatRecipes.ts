export type TreatRecipe = {
  /** Unique identifier for debugging or inventory serialization. */
  key: string;
  /** Display name shown in the modal. */
  name: string;
  /** Path to the pixel sprite asset located under public/treats. */
  sprite: string;
  /** Flavor text used for future narration. */
  description: string;
  /** Flag so we can handle the mysterious fallback differently later. */
  isMystery?: boolean;
};

const rawTreatMap: Record<string, Omit<TreatRecipe, "key">> = {
  "milk+fish": {
    name: "Milky Tuna Tart",
    sprite: "/treats/milky_tuna_tart.png",
    description: "A creamy tart with a savory shimmer. The café cat circles excitedly.",
  },
  "flour+honey": {
    name: "Honey Loaf",
    sprite: "/treats/honey_loaf.png",
    description: "A fluffy loaf dripping with golden sweetness. Perfect for teatime.",
  },
  "butter+catnip": {
    name: "Butternip Cookie",
    sprite: "/treats/butternip_cookie.png",
    description: "A crisp cookie dusted in catnip sugar. Expect instant purrs!",
  },
  "milk+fish+honey": {
    name: "Honeyed Fish Bites",
    sprite: "/treats/honeyed_fish_bites.png",
    description:
      "Sweet and savory fish morsels, glazed with golden honey. An irresistible treat!",
  },
  "flour+butter+catnip": {
    name: "Fluffy Catnip Scones",
    sprite: "/treats/fluffy_catnip_scones.png",
    description:
      "Light, buttery scones infused with a hint of catnip. Purrfect for afternoon tea.",
  },
  "milk+butter+honey": {
    name: "Sweet Milkbread Twist",
    sprite: "/treats/sweet_milkbread_twist.png",
    description:
      "A soft, braided milk bread, drizzled with sweet honey butter. Comfort in every bite.",
  },
};

const fallbackTreat: TreatRecipe = {
  key: "mysterious-goo",
  name: "Mysterious Goo 🍯🐾",
  sprite: "/treats/mysterious_goo.png",
  description:
    "An unpredictable gooey blob. Maybe keep this one away from the rug for now...",
  isMystery: true,
};

export const BIRTHDAY_SURPRISE_TREAT: TreatRecipe = {
  key: "birthday-surprise-cake",
  name: "Birthday Surprise Cake",
  sprite: "/treats/birthday_surprise_cake.png",
  description:
    "A towering confetti cake layered with honey glaze and shimmering catnip icing.",
};

const treatMap: Record<string, TreatRecipe> = Object.entries(rawTreatMap).reduce(
  (accumulator, [key, recipe]) => {
    const sortedKey = key
      .split("+")
      .map((token) => token.trim())
      .filter(Boolean)
      .sort()
      .join("+");

    accumulator[sortedKey] = { key: sortedKey, ...recipe };
    return accumulator;
  },
  {} as Record<string, TreatRecipe>
);

const treatLookup: Record<string, TreatRecipe> = {
  ...treatMap,
  [fallbackTreat.key]: fallbackTreat,
  [BIRTHDAY_SURPRISE_TREAT.key]: BIRTHDAY_SURPRISE_TREAT,
};

/**
 * Normalizes a list of ingredient IDs to the canonical combo key.
 */
export function toIngredientKey(ingredientIds: string[]) {
  return ingredientIds
    .slice()
    .map((ingredientId) => ingredientId.trim())
    .filter(Boolean)
    .sort()
    .join("+");
}

/**
 * Returns a treat recipe for the provided combo or a mysterious fallback.
 * This makes it easy to later persist results into an inventory array.
 */
export function getTreatForIngredients(ingredientIds: string[]): TreatRecipe {
  const key = toIngredientKey(ingredientIds);
  return treatMap[key] ?? fallbackTreat;
}

export function getTreatByKey(key: string): TreatRecipe {
  return treatLookup[key] ?? fallbackTreat;
}

export const TREAT_LIBRARY = [
  ...Object.values(treatMap),
  fallbackTreat,
  BIRTHDAY_SURPRISE_TREAT,
];
export const DEFAULT_TREAT = fallbackTreat;
