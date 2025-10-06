import React from 'react';
import type { GameState, Player, PlayerHandResult } from '../../core/types';
import Card from '../Card';

type GamePhase = 'predicting' | 'results';

interface LocalMultiplayerGameUIProps {
  gameState: GameState | null;
  gamePhase: GamePhase;
  predictions: { [playerId: number]: number };
  onPredictionChange: (playerId: number, rank: number) => void;
  onCheckResults: () => void;
  onStartNewRound: () => void;
  scores: { [playerId: number]: number };
  results: PlayerHandResult[] | null; 
}

const LocalMultiplayerGameUI: React.FC<LocalMultiplayerGameUIProps> = ({
  gameState,
  gamePhase,
  predictions,
  onPredictionChange,
  onCheckResults,
  onStartNewRound,
  // scores,
  results,
}) => {
  if (!gameState) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <div className="community-cards-area">
        <h2>커뮤니티 카드</h2>
        <div className="card-list">
          {gameState.communityCards.map((card, index) => <Card key={index} card={card} />)}
        </div>
      </div>
      <div className="actions">
        {gamePhase === 'predicting' ? (
          <button onClick={onCheckResults}>결과 확인</button>
        ) : (
          <button onClick={onStartNewRound}>새 라운드</button>
        )}
      </div>
      <div className="players-area">
        {gameState.players.map(player => (
          <PlayerSection
            key={player.id}
            player={player}
            prediction={predictions[player.id]}
            onPredictionChange={onPredictionChange}
            phase={gamePhase}
            result={results?.find(r => r.playerId === player.id)}
            actualRank={results ? results.findIndex(r => r.playerId === player.id) + 1 : undefined}
          />
        ))}
      </div>
    </main>
  );
};

interface PlayerSectionProps {
  player: Player;
  prediction: number;
  onPredictionChange: (playerId: number, rank: number) => void;
  phase: GamePhase;
  result?: PlayerHandResult;
  actualRank?: number;
}

const PlayerSection: React.FC<PlayerSectionProps> = ({  }) => {
  // const isCorrect = prediction === actualRank;

  return (
    <div></div>
    // <div className={`player ${phase === 'results' && (isCorrect ? 'correct' : 'incorrect')}`}>
    //   <h3>플레이어 {player.id}</h3>
    //   <div className="card-list">
    //     {player.holeCards.map((card, index) => <Card key={index} card={card} />)}
    //   </div>
    //   {phase === 'predicting' ? (
    //     <div className="prediction-input">
    //       <span>예상 등수: </span>
    //       {[1, 2, 3, 4].map(rank => (
    //         <label key={rank}>
    //           <input
    //             type="radio"
    //             name={`player-${player.id}-rank`}
    //             value={rank}
    //             checked={prediction === rank}
    //             onChange={() => onPredictionChange(player.id, rank)}
    //           />
    //           {rank}등
    //         </label>
    //       ))}
    //     </div>
    //   ) : (
    //     <div className="result-display">
    //       <p><strong>{result?.evaluatedHand.rankName}</strong></p>
    //       <p>예측: {prediction}등 / 결과: <strong>{actualRank}등</strong></p>
    //       {isCorrect ? <p className="correct-text">정답!</p> : null}
    //     </div>
    //   )}
    // </div>
  );
};

export default LocalMultiplayerGameUI;