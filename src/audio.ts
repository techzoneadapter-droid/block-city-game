import type Phaser from "phaser";
import { loadSave } from "./save";

export type SoundCue = 'pickup' | 'place' | 'invalid' | 'clear' | 'combo' | 'hammer' | 'bulldozer' | 'refresh' | 'reward';
const CUES: Record<SoundCue, [number, number, number]> = {
  pickup: [490, 0.035, 0.018], place: [360, 0.045, 0.025], invalid: [150, 0.06, 0.02],
  clear: [520, 0.08, 0.045], combo: [720, 0.09, 0.035], hammer: [250, 0.08, 0.045],
  bulldozer: [190, 0.1, 0.045], refresh: [430, 0.06, 0.035], reward: [880, 0.22, 0.04],
};

/** Reuses Phaser's single WebAudio context and master mute/volume path. */
class AudioManager {
  play(scene: Phaser.Scene, cue: SoundCue) {
    try {
      if (!loadSave().soundEnabled) return;
      if (scene.cache.audio.exists(cue)) { scene.sound.play(cue, { volume: 0.5 }); return; }
      const manager = scene.sound as Phaser.Sound.WebAudioSoundManager;
      const context = manager.context;
      if (!context || context.state !== 'running' || !manager.destination) return;
      const [frequency, duration, volume] = CUES[cue];
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * (cue === 'reward' ? 1.5 : 0.8), context.currentTime + duration);
      envelope.gain.setValueAtTime(0.0001, context.currentTime);
      envelope.gain.exponentialRampToValueAtTime(volume, context.currentTime + 0.006);
      envelope.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
      oscillator.connect(envelope);
      envelope.connect(manager.destination);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
      oscillator.start();
      oscillator.stop(context.currentTime + duration);
    } catch { /* Audio is optional, including browsers without WebAudio. */ }
  }
}
export const audio = new AudioManager();
