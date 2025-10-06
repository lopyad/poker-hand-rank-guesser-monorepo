import React from 'react';
import type { GameState, Player, EvaluatedHand } from '../../core/types';
// import { type PlayerHandResult } from '../../core/types';
import Card from '../Card';

// This is a new, richer player type for the UI state, combining Player and result info.
interface UIMultiplayerPlayer extends Player {
  isCorrect?: boolean;
  predictedRank?: number;
  actualRank?: number;
  evaluatedHand?: EvaluatedHand;
}

// The GameState in multiplayer will use this richer player type.
interface MultiplayerGameState extends Omit<GameState, 'players'> {
  players: UIMultiplayerPlayer[];
}

type GamePhase = 'predicting' | 'results';

interface MultiplayerGameUIProps {
  ws: React.RefObject<WebSocket | null>;
  roomCode: string | null;
  token: string | null;
  backendUrl: string;
  userName: string | null;
  multiplayerGameState: MultiplayerGameState | null;
  gamePhase: GamePhase;
  predictions: { [playerId: number]: number };
  onPredictionChange: (playerId: number, rank: number) => void;
  onConfirmPrediction: () => void;
  onStartNewRound: () => void;
  scores: { [playerId: number]: number };
}

const MultiplayerGameUI: React.FC<MultiplayerGameUIProps> = ({
  // ws,
  // roomCode,
  // token,
  // backendUrl,
  userName,
  multiplayerGameState,
  gamePhase,
  predictions,
  onPredictionChange,
  onConfirmPrediction,
  onStartNewRound,
  scores,
}) => {

  if (!multiplayerGameState) {
    return <div>Loading multiplayer game...</div>;
  }

  const currentPlayer = multiplayerGameState.players.find(p => p.name === userName);
  const currentPlayerId = currentPlayer?.id;
  const currentPrediction = currentPlayerId ? predictions[currentPlayerId] : undefined;

  return (
    <main>
      <div className="community-cards-area">
        <h2>커뮤니티 카드</h2>
        <div className="card-list">
          {multiplayerGameState.communityCards.map((card, index) => <Card key={index} card={card} />)}
        </div>
      </div>

      {gamePhase === 'predicting' && currentPlayerId && (
        <div className="prediction-controls">
          <div className="prediction-buttons">
            <span>예상 등수: </span>
            {[1, 2, 3, 4].map(rank => (
              <button
                key={rank}
                className={`prediction-button ${currentPrediction === rank ? 'selected' : ''}`}
                onClick={() => onPredictionChange(currentPlayerId, rank)}
              >
                {rank}등
              </button>
            ))}
          </div>
          <button onClick={onConfirmPrediction} className="game-button">예측 확정</button>
        </div>
      )}

      <div className="actions">
        {gamePhase === 'results' && (
          <button onClick={onStartNewRound} className="game-button">새 라운드</button>
        )}
      </div>
      <div className="players-area">
        {multiplayerGameState.players.map(player => (
          <PlayerSection
            key={player.id}
            player={player}
            scores={scores}
            isCurrentPlayer={player.name === userName}
          />
        ))}
      </div>
    </main>
  );
};

interface PlayerSectionProps {
  player: UIMultiplayerPlayer;
  scores: { [playerId: number]: number };
  isCurrentPlayer: boolean;
}

const PlayerSection: React.FC<PlayerSectionProps> = ({ player, scores, isCurrentPlayer }) => {
  const { id, name, holeCards, evaluatedHand, predictedRank, actualRank, isCorrect } = player;
  const phase = actualRank !== undefined ? 'results' : 'predicting';

  return (
    <div className={`player ${phase === 'results' && (isCorrect ? 'correct' : 'incorrect')}`}>
      <h3>{name}</h3>
      <div className="player-score">{scores[id] || 0} pts</div>
      <div className="card-list">
        {isCurrentPlayer || phase === 'results' ? (
          holeCards.map((card, index) => <Card key={index} card={card} />)
        ) : (
          // Display face-down cards for other players during predicting phase
          <>
            <div className="card-component back-card"></div>
            <div className="card-component back-card"></div>
            <div className="card-component back-card"></div>
            <div className="card-component back-card"></div>
          </>
        )}
      </div>
      {phase === 'results' ? (
        <div className="result-display">
          <p><strong>{evaluatedHand?.rankName}</strong></p>
          <p>예측: {predictedRank || '-'}등 / 결과: <strong>{actualRank || '-'}등</strong></p>
          {isCorrect ? <p className="correct-text">정답!</p> : null}
        </div>
      ) : null}
    </div>
  );
};

export default MultiplayerGameUI;
