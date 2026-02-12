export type DeckItem = {
  id: string;
  title: string;
  meta?: string;
};

export const DEFAULT_DECK: DeckItem[] = [
  { id: "item-01", title: "Pizza Night", meta: "Casual dinner" },
  { id: "item-02", title: "Sushi Spot", meta: "Japanese" },
  { id: "item-03", title: "Burger Place", meta: "Classic comfort" },
  { id: "item-04", title: "Taco Bar", meta: "Mexican vibes" },
  { id: "item-05", title: "Ramen House", meta: "Warm and cozy" },
  { id: "item-06", title: "Steak Grill", meta: "Premium pick" },
  { id: "item-07", title: "Vegan Kitchen", meta: "Plant-based" },
  { id: "item-08", title: "BBQ Joint", meta: "Smoky flavor" },
  { id: "item-09", title: "Pasta Corner", meta: "Italian" },
  { id: "item-10", title: "Brunch Cafe", meta: "All-day breakfast" },
  { id: "item-11", title: "Food Truck Park", meta: "Mixed options" },
  { id: "item-12", title: "Salad Bar", meta: "Fresh bowls" },
  { id: "item-13", title: "Hotpot", meta: "Group-friendly" },
  { id: "item-14", title: "Dim Sum", meta: "Shareable plates" },
  { id: "item-15", title: "Fried Chicken", meta: "Crispy favorite" },
  { id: "item-16", title: "Seafood Shack", meta: "Coastal menu" },
  { id: "item-17", title: "Indian Curry", meta: "Bold spices" },
  { id: "item-18", title: "Mediterranean", meta: "Healthy and tasty" },
  { id: "item-19", title: "Korean BBQ", meta: "Interactive meal" },
  { id: "item-20", title: "Dessert Cafe", meta: "Sweet ending" }
];

export const DECK_BY_ID: Record<string, DeckItem> = Object.fromEntries(
  DEFAULT_DECK.map((item) => [item.id, item])
);
