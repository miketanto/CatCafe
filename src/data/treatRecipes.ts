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
  "flour+catnip": {
    name: "Catnip Cloud Crisps",
    sprite: "/treats/fluffy_catnip_scones.png",
    description:
      "Delicate crisps dusted with meadow catnip, baked light enough to lull any kitty into a purr.",
  },
  "milk+butter+honey": {
    name: "Sweet Milkbread Twist",
    sprite: "/treats/sweet_milkbread_twist.png",
    description:
      "A soft, braided milk bread, drizzled with sweet honey butter. Comfort in every bite.",
  },
  "milk+flour+cream": {
    name: "Cream Puff Pastry",
    sprite: "/treats/cream_puff_pastry.png",
    description:
      "A delicate puff filled with sweet cream. Light as air and twice as dreamy.",
  },
  "honey+catnip": {
    name: "Golden Catnip Drops",
    sprite: "/treats/golden_catnip_drops.png",
    description:
      "Tiny honey-glazed treats that sparkle with catnip magic. Instant feline fascination!",
  },
  "flour+fish": {
    name: "Savory Fish Crackers",
    sprite: "/treats/savory_fish_crackers.png",
    description:
      "Crisp, salty crackers baked with tender fish flakes. Perfect for sophisticated snackers.",
  },
  "milk+butter": {
    name: "Velvet Cream Cookies",
    sprite: "/treats/velvet_cream_cookies.png",
    description:
      "Soft, melt-in-your-mouth cookies with a buttery milk glaze. Simple, smooth, and irresistible.",
  },
  "butter+honey": {
    name: "Honey Butter Biscuits",
    sprite: "/treats/honey_butter_biscuits.png",
    description:
      "Golden biscuits infused with sweet honey butter. A comforting crunch in every bite.",
  },
  "flour+milk+catnip": {
    name: "Whisker Waffles",
    sprite: "/treats/whisker_waffles.png",
    description:
      "Fluffy catnip-scented waffles drizzled with warm milk glaze. Breakfast for champions.",
  },
  "butter+fish+honey": {
    name: "Golden Fish Pie",
    sprite: "/treats/golden_fish_pie.png",
    description:
      "A flaky golden pie filled with sweet-salty fish filling and a honey-brushed crust.",
  },
  "milk+flour+honey": {
    name: "Sweet Cream Muffins",
    sprite: "/treats/sweet_cream_muffins.png",
    description:
      "Soft muffins bursting with honey sweetness and creamy richness. Best served warm!",
  },
  "flour+butter+honey": {
    name: "Golden Shortbread",
    sprite: "/treats/golden_shortbread.png",
    description:
      "Buttery, crumbly cookies kissed with honey. A timeless teatime treasure.",
  },
  "milk+butter+catnip": {
    name: "Dreamy Catnip Custard",
    sprite: "/treats/dreamy_custard.png",
    description:
      "A smooth custard with a playful catnip aroma. Silky, soothing, and a little mischievous.",
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
  sprite: "/treats/birthday_surprise.png",
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

export const BAKEABLE_TREATS: TreatRecipe[] = Object.values(treatMap);
export const BAKEABLE_TREAT_KEYS: string[] = BAKEABLE_TREATS.map((treat) => treat.key);

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
