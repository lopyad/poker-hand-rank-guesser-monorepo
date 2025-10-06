import { useState, useEffect } from 'react';
import type { GameState, PlayerHandResult } from '../core/types';
import { setupNewGame, getPlayerHandRanks } from '../core/game';
import './Game.css'; // Changed import
import { useGameMode } from '../context/GameModeContext'; // Import the hook

// Import game mode specific UI components
import SinglePlayerGameUI from '../components/game/SinglePlayerGameUI';
import LocalMultiplayerGameUI from '../components/game/LocalMultiplayerGameUI';

type GamePhase = 'predicting' | 'results';

function Game() {
  const { gameMode } = useGameMode(); // Get gameMode from context
  console.log("Current Game Mode:", gameMode); // Log for verification

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('predicting');
  const [predictions, setPredictions] = useState<{ [playerId: number]: number }>({});
  const [results, setResults] = useState<PlayerHandResult[] | null>(null);
  const [scores, setScores] = useState<{ [playerId: number]: number }>({ 1: 0, 2: 0, 3: 0, 4: 0 });

  const startNewRound = () => {
    setGameState(setupNewGame());
    setGamePhase('predicting');
    setPredictions({});
    setResults(null);
  };

  useEffect(() => {
    // You can use gameMode here to initialize game state differently
    // For example:
    if (gameMode === 'single') {
      console.log("Starting single player game...");
      // setupNewGame() might need to be modified to accept game mode
      // or you might have different setup functions for different modes
    } else if (gameMode === 'multiplayer') {
      console.log("Starting online multiplayer game...");
      // Logic for online multiplayer setup
    } else if (gameMode === 'local-multiplayer') {
      console.log("Starting local multiplayer game...");
      // Logic for local multiplayer setup
    }
    startNewRound();
  }, [gameMode]); // Add gameMode to dependency array if you want to react to mode changes

  const handlePredictionChange = (playerId: number, rank: number) => {
    setPredictions(prev => ({ ...prev, [playerId]: rank }));
  };

  const handleCheckResults = () => {
    let currentPredictions = { ...predictions };

    if (gameMode === 'single') {
      // Generate random predictions for AI players (2, 3, 4)
      gameState?.players.forEach(player => {
        if (player.id !== 1 && !(player.id in currentPredictions)) {
          currentPredictions[player.id] = Math.floor(Math.random() * 4) + 1; // Random rank from 1 to 4
        }
      });
      setPredictions(currentPredictions);
    }

    if (Object.keys(currentPredictions).length !== gameState?.players.length) {
      alert('All players must make a prediction.'); // Changed text
      return;
    }
    const finalResults = getPlayerHandRanks(gameState!);
    
    // Populate predictedRank and actualRank in the results array
    const updatedResults = finalResults.map((result, index) => ({
      ...result,
      predictedRank: currentPredictions[result.playerId],
      actualRank: index + 1,
    }));

    setResults(updatedResults);
    console.log("Game.tsx - results after setResults:", updatedResults); // Added log

    // 점수 계산
    const newScores = { ...scores };
    updatedResults.forEach((result) => {
      if (result.predictedRank === result.actualRank) {
        newScores[result.playerId] += 1;
      }
    });
    setScores(newScores);

    setGamePhase('results');
  };

  if (!gameState) {
    return <div>Loading...</div>;
  }

  console.log("Game.tsx - results before render:", results); // Added log

  const renderGameUI = () => {
    switch (gameMode) {
      case 'single':
        return (
          <SinglePlayerGameUI
            gameState={gameState}
            gamePhase={gamePhase}
            predictions={predictions}
            onPredictionChange={handlePredictionChange}
            onCheckResults={handleCheckResults}
            onStartNewRound={startNewRound}
            scores={scores}
            results={results} // Pass results prop
          />
        );
      case 'multiplayer':
        // return <MultiplayerGameUI />;
      case 'local-multiplayer':
        return <LocalMultiplayerGameUI
            gameState={gameState}
            gamePhase={gamePhase}
            predictions={predictions}
            onPredictionChange={handlePredictionChange}
            onCheckResults={handleCheckResults}
            onStartNewRound={startNewRound}
            scores={scores}
            results={results} // Pass results prop
          />
      default:
        return <SinglePlayerGameUI
                  gameState={gameState}
                  gamePhase={gamePhase}
                  predictions={predictions}
                  onPredictionChange={handlePredictionChange}
                  onCheckResults={handleCheckResults}
                  onStartNewRound={startNewRound}
                  scores={scores}
                  results={results} // Pass results prop
                />; // Default to single player
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Poker Hand Rank Guesser</h1> {/* Changed text */}
      </header>
      {renderGameUI()}
    </div>
  );
}

export default Game;