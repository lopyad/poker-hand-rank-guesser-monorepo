import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GameSetup.css';
import { useGameMode } from '../context/GameModeContext';
import { type Card as CardType } from '../core/types';
import { createDeck, shuffleDeck } from '../core/deck';
import Card from '../components/Card';

type GameMode = 'single' | 'multiplayer' | 'local-multiplayer';

const GameSetup: React.FC = () => {
  const navigate = useNavigate();
  const { gameMode, setGameMode } = useGameMode();
  const [cards, setCards] = useState<Record<GameMode, CardType | null>>({
    single: null,
    multiplayer: null,
    'local-multiplayer': null,
  });

  useEffect(() => {
    const deck = createDeck();
    const shuffledDeck = shuffleDeck(deck);
    // Assign one card for each game mode
    setCards({
      single: shuffledDeck[0] || null,
      multiplayer: shuffledDeck[1] || null,
      'local-multiplayer': shuffledDeck[2] || null,
    });
  }, []);


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
      <h1 className="game-setup-title">Select Game Mode</h1>
      <div className="game-mode-selection">
        <div
          className={`game-mode-card ${gameMode === 'single' ? 'selected' : ''}`}
          onClick={() => handleModeSelect('single')}
        >
          <h3 className="card-title">Single Player</h3>
          <div className="card-preview">
            {cards.single && <Card card={cards.single} />}
          </div>
          <p className="card-description">Play against AI opponents and test your skills.</p>
        </div>
        <div
          className={`game-mode-card ${gameMode === 'multiplayer' ? 'selected' : ''}`}
          onClick={() => handleModeSelect('multiplayer')}
        >
          <h3 className="card-title">Multi Player (Online)</h3>
          <div className="card-preview">
            {cards.multiplayer && <Card card={cards.multiplayer} />}
          </div>
          <p className="card-description">Challenge players from around the world.</p>
        </div>
        <div
          className={`game-mode-card ${gameMode === 'local-multiplayer' ? 'selected' : ''}`}
          onClick={() => handleModeSelect('local-multiplayer')}
        >
          <h3 className="card-title">Multi Player (Local)</h3>
          <div className="card-preview">
            {cards['local-multiplayer'] && <Card card={cards['local-multiplayer']} />}
          </div>
          <p className="card-description">Play with your friends on the same device.</p>
        </div>
      </div>
      <button className="continue-button" onClick={handleContinue} disabled={!gameMode}>
        Continue
      </button>
    </div>
  );
};

export default GameSetup;
