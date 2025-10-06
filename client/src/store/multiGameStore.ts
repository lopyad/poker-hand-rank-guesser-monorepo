import { create } from 'zustand';

type GamePhase = 'lobby' | 'game';

interface LobbyPlayer {
  // id: number; // Added player ID
  name: string;
  isReady: boolean;
}

interface MultiGameState {
  phase: GamePhase;
  roomCode: string | null;
  manualRoomCode: string;
  players: LobbyPlayer[];
  isCountdownRunning: boolean; // new
  countdown: number; // new
  setPhase: (phase: GamePhase) => void;
  setRoomCode: (roomCode: string | null) => void;
  setManualRoomCode: (manualRoomCode: string) => void;
  setPlayers: (players: LobbyPlayer[]) => void;
  startCountdown: (duration: number) => void; // new
  cancelCountdown: () => void; // new
  reset: () => void;
}

const initialState = {
  phase: 'lobby' as GamePhase,
  roomCode: null as string | null,
  manualRoomCode: '',
  players: [] as LobbyPlayer[],
  isCountdownRunning: false, // new
  countdown: 0, // new
};

export const useMultiGameStore = create<MultiGameState>((set) => ({
  ...initialState,
  setPhase: (phase) => set({ phase }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setManualRoomCode: (manualRoomCode) => set({ manualRoomCode }),
  setPlayers: (players) => set({ players }),
  startCountdown: (duration) => set({ isCountdownRunning: true, countdown: duration }), // new
  cancelCountdown: () => set({ isCountdownRunning: false, countdown: 0 }), // new
  reset: () => set(initialState),
}));