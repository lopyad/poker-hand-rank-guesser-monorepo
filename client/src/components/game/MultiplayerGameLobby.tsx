import React, { useState, useEffect } from 'react';
import './MultiplayerGameLobby.css';
import Card from '../Card'; // Import Card component
import { useAuthStore } from '../../store/authStore';
import { useMultiGameStore } from '../../store/multiGameStore';

interface LobbyPlayer {
  name: string;
  isReady: boolean;
}

interface MultiplayerGameLobbyProps {
  roomCode: string | null;
  manualRoomCode: string;
  handleGetRoomCode: () => void;
  handleJoinRoomManually: () => void;
  setManualRoomCode: (value: string) => void;
  setPhase: (phase: 'lobby' | 'game') => void;
  players: LobbyPlayer[];
  onPlayerReadyToggle: (isReady: boolean) => void;
}

const MultiplayerGameLobby: React.FC<MultiplayerGameLobbyProps> = ({
  roomCode,
  manualRoomCode,
  handleGetRoomCode,
  handleJoinRoomManually,
  setManualRoomCode,
  setPhase,
  players,
  onPlayerReadyToggle,
}) => {
  const playerSlots = Array.from({ length: 4 }); // Create 4 slots
  const { userName } = useAuthStore();
  const { isCountdownRunning, countdown } = useMultiGameStore();
  const [displayCountdown, setDisplayCountdown] = useState(0);

  useEffect(() => {
    let timer: number;

    if (isCountdownRunning) {
      setDisplayCountdown(countdown);
      timer = setInterval(() => {
        setDisplayCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setDisplayCountdown(0);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isCountdownRunning, countdown]);

  return (
    <div className="multiplayer-lobby-container">
      <div className="room-code-container">
        <p>Room Code: <span className="room-code">{roomCode || 'N/A'}</span></p>
        <button onClick={handleGetRoomCode} className="get-room-code-button">
          Get Code
        </button>
        <input
          type="text"
          placeholder="Enter Room Code"
          value={manualRoomCode}
          onChange={(e) => setManualRoomCode(e.target.value)}
          className="room-code-input"
        />
        <button onClick={handleJoinRoomManually} className="join-room-button">
          Join Room
        </button>
      </div>
      <div className="card-display-lobby">
        {playerSlots.map((_, index) => {
          const player = players[index];
          const handleReadyClick = () => {
            if (player && player.name === userName) {
              onPlayerReadyToggle(!player.isReady);
            }
          };
          return (
            <div 
              key={index} 
              className="player-card-container"
              onClick={() => {
                if (player && player.name === userName) {
                  console.log("check");
                }
              }}
            >
              <Card card={{ suit: '♠', rank: 'A' }} /> {/* Placeholder card */}
              <div className="player-name-text">{player ? player.name : 'Waiting...'}</div>
              <button 
                className={`ready-toggle-button ${player && player.isReady ? 'ready' : ''}`}
                onClick={handleReadyClick}
              >
                {player ? (player.isReady ? 'Ready' : 'Not Ready') : 'Not Ready'}
              </button>
            </div>
          );
        })}
      </div>
      <div className="lobby-info">
        {isCountdownRunning && displayCountdown > 0 ? (
          <p>Game starting in {displayCountdown} seconds...</p>
        ) : (
          <p>Players will wait here before the game starts.</p>
        )}
      </div>
      <button onClick={() => setPhase('game')} className="start-game-button">
        Start Game (Dev)
      </button>
    </div>
  );
};

export default MultiplayerGameLobby;
