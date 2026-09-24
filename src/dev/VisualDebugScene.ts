import Phaser from "phaser";
import {
  addGradientBackground,
  boosterButton,
  button,
  buildingCard,
  COLORS,
  currencyChip,
  iconButton,
  iconTile,
  notificationBadge,
  panel,
  playerChip,
  rewardCard,
  sectionLabel,
  statCard,
  taskCard,
  text,
  W,
} from "../ui";
import { RADII, SPACING, TYPOGRAPHY } from "../theme";

/** Development-only master kit. Open `/?debug=ui` to inspect shared UI. */
export class VisualDebugScene extends Phaser.Scene {
  constructor() { super("VisualDebugScene"); }

  create() {
    addGradientBackground(this, 0x139fe9, 0xe7faff);

    const header = panel(this, W / 2, 37, W - 20, 58, { variant: "dark", radius: RADII.lg, shadowAlpha: 0.28 });
    header.add([
      text(this, 0, -9, "BLOCK CITY • MASTER UI KIT", 19, "#ffffff", "800").setStroke("#073f7d", 3),
      text(this, 0, 15, "PASS 2  ·  shared components & states", 10, "#c9f6ff", "700"),
    ]);

    sectionLabel(this, SPACING.screen, 72, "BUTTONS & CONTROL STATES");
    button(this, 99, 111, 158, 47, "PLAY", () => undefined, COLORS.gold, "gold", { icon: "play" });
    button(this, 285, 111, 158, 47, "BUILD", () => undefined, COLORS.primary, "primary", { icon: "hat" });
    button(this, 78, 166, 116, 39, "PRESSED", () => undefined, COLORS.gold, "gold", { state: "pressed" });
    button(this, 204, 166, 116, 39, "FOCUS", () => undefined, COLORS.primary, "secondary", { state: "focused" });
    button(this, 330, 166, 96, 39, "OFF", undefined, COLORS.disabled, "muted");

    sectionLabel(this, SPACING.screen, 195, "HUD CHIPS");
    const player = playerChip(this, 98, 238, { name: "Player123", avatar: "builder", level: 12, currentXp: 320, neededXp: 650 });
    player.setScale(0.9);
    const coin = currencyChip(this, 299, 221, "coin", 12480, () => undefined, 158).container;
    const gem = currencyChip(this, 299, 258, "gem", 320, () => undefined, 158).container;
    coin.setScale(0.82); gem.setScale(0.82);

    sectionLabel(this, SPACING.screen, 281, "PANELS & CARDS");
    const surfaces: Array<["white" | "blue" | "cream" | "dark" | "dialog" | "reward", string]> = [
      ["white", "WHITE"], ["blue", "BLUE"], ["cream", "CREAM"],
      ["dark", "GAME"], ["dialog", "DIALOG"], ["reward", "REWARD"],
    ];
    surfaces.forEach(([variant, label], index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const sample = panel(this, 70 + col * 125, 323 + row * 47, 114, 38, { variant, radius: RADII.sm, shadowAlpha: 0.16 });
      sample.add(text(this, 0, 0, label, 10, variant === "dark" ? "#ffffff" : "#123767", "800"));
    });

    const stat = statCard(this, 91, 414, 146, { icon: "friends", label: "POPULATION", value: "2,480", delta: "+6%" });
    const task = taskCard(this, 271, 414, 196, { icon: "tasks", title: "Upgrade 2 buildings", progress: 0.5, progressLabel: "1/2", onAction: () => undefined });
    stat.setScale(0.86); task.setScale(0.86);

    sectionLabel(this, SPACING.screen, 450, "ICON BUTTONS & NOTIFICATION");
    ["settings", "plus", "arrow", "close", "edit"].forEach((icon, index) => {
      iconButton(this, 48 + index * 57, 493, icon, () => undefined, {
        size: 45,
        state: index === 0 ? "selected" : undefined,
        notification: index === 4 ? 3 : undefined,
      });
    });
    iconButton(this, 344, 493, "settings", undefined, { size: 45, state: "disabled" });

    sectionLabel(this, SPACING.screen, 524, "BOOSTERS");
    boosterButton(this, 73, 580, "hammer", "Hammer", () => undefined, { count: 3 });
    boosterButton(this, 194, 580, "shuffle", "Shuffle", () => undefined, { count: 3, selected: true });
    boosterButton(this, 315, 580, "line", "Clear Line", () => undefined, { count: 2 });

    sectionLabel(this, SPACING.screen, 633, "CARD FAMILY");
    const building = buildingCard(this, 80, 696, 126, { art: "house", title: "House", price: 1000, level: "Lv. 1" });
    building.setScale(0.82);
    const reward = rewardCard(this, 250, 696, 214, "CITY CHEST", [
      { icon: "coin", value: "×500" }, { icon: "gem", value: "×50" }, { icon: "puzzle", value: "×2" },
    ]);
    reward.setScale(0.82);

    const navBar = panel(this, W / 2, 798, W - 16, 75, { variant: "dark", radius: RADII.lg, shadowAlpha: 0.3 });
    const navItems = [
      { icon: "hat", label: "Build" },
      { icon: "puzzle", label: "Puzzles", selected: true },
      { icon: "shop", label: "Shop", notification: 1 },
      { icon: "friends", label: "Friends", disabled: true },
    ];
    navItems.forEach((item, index) => navBar.add(iconTile(this, -135 + index * 90, -3, 78, 67, item.icon, item.label, () => undefined, {
      compact: true,
      selected: item.selected,
      notification: item.notification,
      disabled: item.disabled,
    })));

    const badge = notificationBadge(this, 372, 73, "!", "small", true);
    badge.setName("notification-pulse-sample");
    text(this, 340, 746, "NAV STATES", TYPOGRAPHY.metadata.size, "#1a69b8", "800");
  }
}
