import type { Card, EvaluatedHand } from "../core/types";

export interface C2S_JoinRoom {
  type: 'JOIN_ROOM';
  payload: {
    roomCode: string;
  };
}

export interface C2S_PlayerReady {
  type: 'PLAYER_READY';
  payload: {
    isReady: boolean;
  };
}

export interface C2S_SubmitGuess {
  type: 'SUBMIT_GUESS';
  payload: {
    guess: number; // 1, 2, 3, 4
  };
}

export interface C2S_NextRoundReady {
  type: 'NEXT_ROUND_READY';
  payload: {};
}

export type C2S_Message =
  | C2S_JoinRoom
  | C2S_PlayerReady
  | C2S_SubmitGuess
  | C2S_NextRoundReady;

// S2C: Server to Client Message Types
export interface S2C_Response {
  type: 'RESPONSE';
  payload: {
    success: boolean;
    message: string;
  };
}

export interface S2C_LobbyState {
  type: "LOBBY_STATE";
  payload: {
    players: {
      name: string;
      isReady: boolean;
    }[];
  };
}

export interface S2C_RoundStart {
  type: 'ROUND_START';
  payload: {
    holeCards: Card[];
    communityCards: Card[];
    playerName: string; // Added player name
  };
}

export interface S2C_ShowResults {
  type: 'SHOW_RESULTS';
  payload: {};
}

export interface S2C_GameStartCountdown {
  type: 'GAME_START_COUNTDOWN';
  payload: {
    duration: number; // in seconds
  };
}

export interface S2C_GameStarted {
  type: 'GAME_STARTED';
  payload: {};
}

export interface S2C_GameStartCancelled {
  type: 'GAME_START_CANCELLED';
  payload: {};
}

export interface S2C_RoundResult {
    type: 'ROUND_RESULT';
    payload: {
        results: {
            playerId: string;
            name: string;
            holeCards: Card[];
            evaluatedHand: EvaluatedHand;
            guess: number;
            actualRank: number;
            isCorrect: boolean;
            score: number;
        }[];
    };
}

export type S2C_Message =
  | S2C_Response
  | S2C_LobbyState
  | S2C_RoundStart
  | S2C_ShowResults
  | S2C_GameStartCountdown
  | S2C_GameStarted
  | S2C_GameStartCancelled
  | S2C_RoundResult;