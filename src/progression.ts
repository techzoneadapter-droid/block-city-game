import type { SaveData } from "./save";

export type AchievementId =
  | "line_rookie"
  | "block_architect"
  | "city_builder"
  | "daily_regular"
  | "district_pioneer";

export type AchievementDefinition = {
  id: AchievementId;
  title: string;
  description: string;
  target: number;
  rewardCoins: number;
  rewardStars: number;
  metric: keyof Pick<
    SaveData,
    "totalLines" | "totalPlacements" | "totalBuilds" | "totalDailyChallenges" | "district"
  >;
};

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "line_rookie",
    title: "Line Rookie",
    description: "Clear 25 total lines",
    target: 25,
    rewardCoins: 120,
    rewardStars: 0,
    metric: "totalLines",
  },
  {
    id: "block_architect",
    title: "Block Architect",
    description: "Place 120 blocks",
    target: 120,
    rewardCoins: 180,
    rewardStars: 0,
    metric: "totalPlacements",
  },
  {
    id: "city_builder",
    title: "City Builder",
    description: "Build 12 city stages",
    target: 12,
    rewardCoins: 100,
    rewardStars: 2,
    metric: "totalBuilds",
  },
  {
    id: "daily_regular",
    title: "Daily Regular",
    description: "Complete 5 daily challenges",
    target: 5,
    rewardCoins: 220,
    rewardStars: 1,
    metric: "totalDailyChallenges",
  },
  {
    id: "district_pioneer",
    title: "District Pioneer",
    description: "Reach District 3",
    target: 3,
    rewardCoins: 300,
    rewardStars: 2,
    metric: "district",
  },
];

export function xpForLevel(level: number) {
  return 100 + Math.max(0, level - 1) * 20;
}

export function profileLevelFromXp(xp: number) {
  let level = 1;
  let remaining = Math.max(0, xp);
  let needed = xpForLevel(level);

  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = xpForLevel(level);
  }

  return {
    level,
    currentXp: remaining,
    neededXp: needed,
    progress: needed > 0 ? remaining / needed : 1,
  };
}

export function achievementProgress(save: SaveData, achievement: AchievementDefinition) {
  return Math.min(achievement.target, Number(save[achievement.metric] || 0));
}

export function achievementReady(save: SaveData, achievement: AchievementDefinition) {
  return (
    achievementProgress(save, achievement) >= achievement.target &&
    !save.achievementClaims.includes(achievement.id)
  );
}

export function milestoneCopy(save: SaveData) {
  if (save.district < 2) {
    const progress = save.coffeeShopStage + save.parkStage;
    return {
      title: "Riverside",
      progress,
      target: 6,
      text: `${Math.max(0, 6 - progress)} build stages until Riverside`,
    };
  }

  if (save.district < 3) {
    const progress = save.riverMarketStage + save.boardwalkStage;
    return {
      title: "Skyline Heights",
      progress,
      target: 6,
      text: `${Math.max(0, 6 - progress)} build stages until Skyline Heights`,
    };
  }

  if (save.district < 4) {
    const progress = save.skylineTowerStage + save.rooftopGardenStage;
    return {
      title: "Master Builder",
      progress,
      target: 6,
      text: `${Math.max(0, 6 - progress)} Skyline stages until Master Builder`,
    };
  }

  return {
    title: "City Mastery",
    progress: Math.min(30, save.level),
    target: 30,
    text: "All three districts complete • finish the 30-level City Journey",
  };
}
