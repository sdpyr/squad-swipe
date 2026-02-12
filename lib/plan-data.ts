export const FOODS = [
  "Burger",
  "Pizza",
  "Taco",
  "Ramen",
  "Sushi",
  "Köfte",
  "Mantı",
  "Lahmacun"
];

export const ACTIVITIES = [
  "Bowling",
  "Escape room",
  "Karaoke",
  "Mini golf",
  "Board game cafe",
  "Sahil yürüyüşü",
  "Sinema",
  "Quiz night"
];

export const TWISTS = [
  "loser pays dessert",
  "everyone picks one song",
  "photo challenge every hour",
  "no phones for 30 minutes",
  "winner chooses next meetup",
  "only public transport",
  "everyone wears team color",
  "surprise stop on the way"
];

export type PlanResult = {
  city?: string;
  groupSize: number;
  food: string;
  activity: string;
  twist: string;
  lockedAt?: string;
};

export function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generatePlan(city: string, groupSize: number): PlanResult {
  return {
    city: city.trim() || undefined,
    groupSize,
    food: randomPick(FOODS),
    activity: randomPick(ACTIVITIES),
    twist: randomPick(TWISTS)
  };
}
