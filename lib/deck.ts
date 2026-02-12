export type DeckItem = { id: string; title: string; meta?: string };

export const DEFAULT_DECK: DeckItem[] = [
  { id: "item-01", title: "Pizza Night", meta: "Casual" },
  { id: "item-02", title: "Sushi Spot", meta: "Japanese" },
  { id: "item-03", title: "Burger Place", meta: "Classic" },
  { id: "item-04", title: "Taco Bar", meta: "Mexican" },
  { id: "item-05", title: "Ramen House", meta: "Noodles" },
  { id: "item-06", title: "Steak Grill" },
  { id: "item-07", title: "Vegan Kitchen" },
  { id: "item-08", title: "BBQ Joint" },
  { id: "item-09", title: "Pasta Corner" },
  { id: "item-10", title: "Brunch Cafe" },
  { id: "item-11", title: "Food Truck Park" },
  { id: "item-12", title: "Salad Bar" },
  { id: "item-13", title: "Hotpot" },
  { id: "item-14", title: "Dim Sum" },
  { id: "item-15", title: "Fried Chicken" },
  { id: "item-16", title: "Seafood Shack" },
  { id: "item-17", title: "Indian Curry" },
  { id: "item-18", title: "Mediterranean" },
  { id: "item-19", title: "Korean BBQ" },
  { id: "item-20", title: "Dessert Cafe" }
];

export const DECK_BY_ID = Object.fromEntries(DEFAULT_DECK.map((i) => [i.id, i]));
