import {create} from "zustand";

import type {Sound} from "@/types/sound";

interface SoundboardState {
  sounds: Sound[];
  currentlyEditingSound: {
    sound: Sound;
    index: number;
  } | null;
  activePanel: "AddSound" | "EditSound" | null;
  setSounds: (sounds: Sound[]) => void;
  addSound: (sound: Sound) => void;
  setCurrentlyEditingSound: (currentlyEditingSound: {sound: Sound, index: number} | null) => void;
  updateCurrentlyEditingSoundAttribute: (changes: Partial<Sound>) => void;
  setActivePanel: (panel: "AddSound" | "EditSound" | null) => void;
}

export const useSoundboardStore = create<SoundboardState>((set) => ({
  sounds: [],
  currentlyEditingSound: null,
  activePanel: null,
  setSounds: (sounds) => set({sounds}),
  addSound: (sound) => set((state) => ({
    sounds: [...state.sounds, sound]
  })),
  setCurrentlyEditingSound: (currentlyEditingSound) => set({currentlyEditingSound}),
  updateCurrentlyEditingSoundAttribute: (changes) => set((state) => {
    if (!state.currentlyEditingSound) {
      return state;
    }
    return {
      currentlyEditingSound: {
        ...state.currentlyEditingSound,
        sound: {
          ...state.currentlyEditingSound.sound,
          ...changes
        }
      }
    };
  }),
  setActivePanel: (panel) => set({activePanel: panel})
}));
