import React, { useState, useEffect } from 'react';
import type { GameState, Player, PlayerHandResult } from '../../core/types';
import Card from '../Card';

type GamePhase = 'predicting' | 'results';

interface SinglePlayerGameUIProps {
  gameState: GameState | null;
  gamePhase: GamePhase;
  predictions: { [playerId: number]: number };
  onPredictionChange: (playerId: number, rank: number) => void;
  onCheckResults: () => void;
  onStartNewRound: () => void;
  scores: { [playerId: number]: number };
  results: PlayerHandResult[] | null; 
}

const SinglePlayerGameUI: React.FC<SinglePlayerGameUIProps> = ({
  gameState,
  gamePhase,
  predictions,
  onPredictionChange,
  onCheckResults,
  onStartNewRound,
  scores,
  results,
}) => {
  const [humanPrediction, setHumanPrediction] = useState<number | null>(null);

  useEffect(() => {
    if (gamePhase === 'predicting') {
      setHumanPrediction(null); // Reset prediction when a new round starts
    }
  }, [gamePhase]);

  if (!gameState) {
    return <div>Loading...</div>;
  }

  const handleHumanPredictionChange = (rank: number) => {
    setHumanPrediction(rank);
    onPredictionChange(1, rank); // Always update prediction for Player 1
  };

  return (
    <main>
      <div className="community-cards-area">
        {/* <h2>Community Cards</h2>  */}
        <div className="card-list">
          {gameState.communityCards.map((card, index) => <Card key={index} card={card} />)}
        </div>
      </div>

      {gamePhase === 'predicting' && (
        <div className="prediction-controls">
          <div className="prediction-buttons">
            <span>Predicted Rank: </span> {/* Changed text */}
            {[1, 2, 3, 4].map(rank => (
              <button
                key={rank}
                className={`prediction-button ${humanPrediction === rank ? 'selected' : ''}`}
                onClick={() => handleHumanPredictionChange(rank)}
              >
                {rank}th
              </button>
            ))}
          </div>
          <button className="actions-button game-button" onClick={onCheckResults}>Check Results</button> {/* Changed text */}
        </div>
      )}
      {gamePhase === 'results' && (
        <div className="actions">
          <button className="game-button" onClick={onStartNewRound}>New Round</button> {/* Changed text */}
        </div>
      )}

      <div className="players-area">
        {gameState.players.map(player => {
          const playerResult = results?.find(r => r.playerId === player.id);
          // const isCorrect = playerResult && predictions[player.id] === playerResult.actualRank;

          return (
            <React.Fragment key={player.id}>
              {/* {gamePhase === 'results' && isCorrect && (
                <p className="correct-text">Correct!</p>
              )} */}
              <PlayerSection
                player={player}
                prediction={predictions[player.id]} // Pass prediction prop
                predictions={predictions} // Pass predictions map
                phase={gamePhase}
                result={playerResult}
                actualRank={playerResult ? playerResult.actualRank : undefined}
                isAI={player.id !== 1} // Pass isAI prop
                scores={scores} // Pass scores prop
              />
            </React.Fragment>
          );
        })}
      </div>
    </main>
  );
};

interface PlayerSectionProps {
  player: Player;
  prediction: number; // Keep prediction prop for PlayerSection
  predictions: { [playerId: number]: number }; // Added predictions map
  phase: GamePhase;
  result?: PlayerHandResult;
  actualRank?: number;
  isAI?: boolean; // Added isAI prop
  scores: { [playerId: number]: number }; // Added scores prop
}

const PlayerSection: React.FC<PlayerSectionProps> = ({ player, prediction, predictions, phase, result, actualRank, isAI, scores }) => {
  // const isCorrect = actualRank !== undefined && prediction === actualRank; // Check correctness using passed prediction

  return (
    <div className={`player ${phase === 'results' && (actualRank !== undefined && prediction === actualRank ? 'correct' : 'incorrect')}`}>
      <h3>Player {player.id} {isAI ? '(AI)' : ''}</h3>
      <div className="player-score">{scores[player.id]} pts</div> {/* Added class */}
      <div className="card-list">
        {isAI && phase === 'predicting' ? (
          // Display face-down cards for AI during predicting phase
          <>
            <div className="card-component back-card"></div>
            <div className="card-component back-card"></div>
            <div className="card-component back-card"></div>
            <div className="card-component back-card"></div>
          </>
        ) : (
          // Display actual cards
          player.holeCards.map((card, index) => <Card key={index} card={card} />)
        )}
      </div>
      {phase === 'results' ? (
        <div className="result-display">
          <p><strong>{result?.evaluatedHand.rankName}</strong></p>
          <p>Prediction: {predictions[player.id] || '-'}th / Result: <strong>{actualRank}th</strong></p> {/* Changed text */}
          {/* isCorrect text moved to parent */}
        </div>
      ) : null}
    </div>
  );
};

export default SinglePlayerGameUI;