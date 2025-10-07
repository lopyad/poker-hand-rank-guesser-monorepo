import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { createDeck, shuffleDeck, dealCards } from '../core/deck';
import { type Card as CardType } from '../core/types';
import './Lobby.css';

const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const [randomCards, setRandomCards] = useState<CardType[]>([]);

  useEffect(() => {
    console.log("Generating new random cards for lobby...");
    const deck = createDeck();
    const shuffledDeck = shuffleDeck(deck); // 셔플된 덱을 받습니다.
    const dealtCards = dealCards(shuffledDeck, 5); // 셔플된 덱에서 카드를 분배합니다.
    console.log("Dealt cards:", dealtCards);
    setRandomCards(dealtCards);
  }, []);

  const handleStartGame = () => {
    navigate('/setup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="lobby-container">
      <h1 className="game-title">poker-hand-rank-guesser</h1>
      <div className="card-display">
        {randomCards.map((card, index) => (
          <Card key={index} card={card} />
        ))}
      </div>
      <button className="start-button" onClick={handleStartGame}>
        Game Start
      </button>
      <button className="login-button" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

export default Lobby;
