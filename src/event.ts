export type EventMilestone = {
  points: number;
  coins: number;
  stars: number;
  chestKeys: number;
};

export type WeeklyEventDefinition = {
  key: string;
  title: string;
  subtitle: string;
  accent: number;
  target: number;
  milestones: EventMilestone[];
};

function mondayOf(date = new Date()) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function eventWeekKey(date = new Date()) {
  const monday = mondayOf(date);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, "0");
  const d = String(monday.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function hash(input: string) {
  let value = 0;
  for (let i = 0; i < input.length; i += 1) {
    value = (Math.imul(value, 31) + input.charCodeAt(i)) >>> 0;
  }
  return value;
}

export function getWeeklyEvent(date = new Date()): WeeklyEventDefinition {
  const key = eventWeekKey(date);
  const themes = [
    { title: "Construction Rally", subtitle: "Build fast. Fill the city.", accent: 0xf3b95f },
    { title: "River Lights", subtitle: "Puzzle your way along the waterfront.", accent: 0x68dce7 },
    { title: "Green City Week", subtitle: "Turn every clear into city progress.", accent: 0x68d795 },
  ];
  const theme = themes[hash(key) % themes.length];

  return {
    key,
    ...theme,
    target: 500,
    milestones: [
      { points: 60, coins: 60, stars: 0, chestKeys: 0 },
      { points: 140, coins: 80, stars: 0, chestKeys: 1 },
      { points: 240, coins: 120, stars: 0, chestKeys: 0 },
      { points: 360, coins: 80, stars: 1, chestKeys: 0 },
      { points: 500, coins: 250, stars: 1, chestKeys: 1 },
    ],
  };
}

export function eventProgressLabel(points: number, target: number) {
  return `${Math.min(points, target)} / ${target}`;
}
