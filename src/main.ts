import "./style.css";

const root = document.getElementById("app");
if (!root) throw new Error("Block City root #app is missing.");

const bootStatus = document.createElement("div");
bootStatus.id = "block-city-boot-status";
bootStatus.dataset.state = "loading";
bootStatus.textContent = "Loading Block City…";
Object.assign(bootStatus.style, {
  position: "absolute",
  inset: "50% auto auto 50%",
  transform: "translate(-50%, -50%)",
  zIndex: "9999",
  padding: "10px 16px",
  borderRadius: "14px",
  background: "rgba(4, 67, 126, .82)",
  color: "#fff",
  font: '800 13px "Arial Rounded MT Bold", Arial, sans-serif',
  letterSpacing: ".2px",
  boxShadow: "0 8px 24px rgba(5, 54, 103, .24)",
  pointerEvents: "none",
  whiteSpace: "pre-wrap",
  textAlign: "center",
  maxWidth: "330px",
});
root.appendChild(bootStatus);

function showBootError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "Unknown runtime error");
  bootStatus.dataset.state = "error";
  bootStatus.textContent = `Block City could not start.\n${message}`;
  bootStatus.style.background = "rgba(142, 35, 48, .94)";
  console.error("[Block City boot]", error);
}

window.addEventListener("error", (event) => {
  if (bootStatus.dataset.state !== "ready") showBootError(event.error || event.message);
});
window.addEventListener("unhandledrejection", (event) => {
  if (bootStatus.dataset.state !== "ready") showBootError(event.reason);
});

async function boot() {
  try {
    const [
      phaserModule,
      homeModule,
      puzzleModule,
      cityModule,
      dailyModule,
      progressModule,
      eventModule,
      campaignModule,
      uiModule,
    ] = await Promise.all([
      import("phaser"),
      import("./scenes/HomeScene"),
      import("./scenes/PuzzleScene"),
      import("./scenes/CityScene"),
      import("./scenes/DailyScene"),
      import("./scenes/ProgressScene"),
      import("./scenes/EventScene"),
      import("./scenes/CampaignScene"),
      import("./ui"),
    ]);

    const Phaser = phaserModule.default;
    const { H, W } = uiModule;

    const config = {
      // Canvas is intentionally preferred for the Vibaocode/mobile preview path.
      // The game is authored from cached Canvas/Phaser textures, so this renderer
      // is both compatible and deterministic inside embedded browser previews.
      type: Phaser.CANVAS,
      parent: "app",
      width: W,
      height: H,
      backgroundColor: "#42bdf5",
      antialias: true,
      pixelArt: false,
      roundPixels: false,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      input: {
        activePointers: 2,
        touch: { capture: true },
      },
      render: {
        antialias: true,
        transparent: false,
        powerPreference: "high-performance",
      },
      scene: [
        homeModule.HomeScene,
        campaignModule.CampaignScene,
        puzzleModule.PuzzleScene,
        cityModule.CityScene,
        dailyModule.DailyScene,
        progressModule.ProgressScene,
        eventModule.EventScene,
      ],
    };

    const game = new Phaser.Game(config);
    if (new URLSearchParams(location.search).has("qa"))
      Object.defineProperty(window, "__blockCityGame", { value: game, configurable: true });

    game.events.once("block-city:home-ready", () => {
      bootStatus.dataset.state = "ready";
      bootStatus.remove();
      document.documentElement.dataset.blockCityReady = "true";
    });

    game.events.once("block-city:boot-error", (error: unknown) => {
      showBootError(error);
    });

    // If Phaser boots but Home never reports ready, keep a visible diagnostic
    // instead of leaving users with an unexplained empty gradient.
    window.setTimeout(() => {
      if (bootStatus.isConnected && bootStatus.dataset.state === "loading") {
        showBootError("Home scene did not finish rendering.");
      }
    }, 8000);
  } catch (error) {
    showBootError(error);
  }
}

void boot();
