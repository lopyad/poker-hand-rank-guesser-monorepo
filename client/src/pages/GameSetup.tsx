import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GameSetup.css';
import { useGameMode } from '../context/GameModeContext'; // Import the hook

type GameMode = 'single' | 'multiplayer' | 'local-multiplayer'; // Keep type definition for clarity

const GameSetup: React.FC = () => {
  const navigate = useNavigate();
  const { gameMode, setGameMode } = useGameMode(); // Use context hook

  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
  };

  const handleContinue = () => {
    if (gameMode === 'multiplayer') {
      navigate('/multigame');
    } else {
      navigate('/game');
    }
  };

  return (
    <div className="game-setup-container">
      <h1 className="game-setup-title">게임 설정</h1>
      <div className="game-mode-selection">
        <label className="mode-option">
          <input
            type="radio"
            name="gameMode"
            value="single"
            checked={gameMode === 'single'} // Use context state
            onChange={() => handleModeSelect('single')}
          />
          싱글 플레이
        </label>
        <label className="mode-option">
          <input
            type="radio"
            name="gameMode"
            value="multiplayer"
            checked={gameMode === 'multiplayer'} // Use context state
            onChange={() => handleModeSelect('multiplayer')}
          />
          멀티 플레이 (온라인)
        </label>
        <label className="mode-option">
          <input
            type="radio"
            name="gameMode"
            value="local-multiplayer"
            checked={gameMode === 'local-multiplayer'} // Use context state
            onChange={() => handleModeSelect('local-multiplayer')}
          />
          로컬 멀티 플레이
        </label>
      </div>
      <button className="continue-button" onClick={handleContinue}>
        계속
      </button>
    </div>
  );
};

export default GameSetup;
