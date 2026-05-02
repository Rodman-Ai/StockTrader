import { create } from 'zustand';

export type ReplayMode = 'off' | 'loading' | 'playing' | 'paused' | 'ended';
export type ReplaySpeed = 1 | 10 | 60;

type ReplayState = {
  mode: ReplayMode;
  date: string;
  speed: ReplaySpeed;
  clock: number;
  error: string | null;
  setMode: (m: ReplayMode) => void;
  setDate: (d: string) => void;
  setSpeed: (s: ReplaySpeed) => void;
  setClock: (c: number) => void;
  setError: (e: string | null) => void;
  reset: () => void;
};

export const useReplay = create<ReplayState>((set) => ({
  mode: 'off',
  date: '',
  speed: 10,
  clock: 0,
  error: null,
  setMode: (mode) => set({ mode }),
  setDate: (date) => set({ date }),
  setSpeed: (speed) => set({ speed }),
  setClock: (clock) => set({ clock }),
  setError: (error) => set({ error }),
  reset: () => set({ mode: 'off', clock: 0, error: null }),
}));

export const isReplayActive = (m: ReplayMode) =>
  m === 'loading' || m === 'playing' || m === 'paused' || m === 'ended';
