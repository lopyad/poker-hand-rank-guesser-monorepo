import React, { useRef, useEffect, useState } from 'react';
import './MultiGame.css';
import MultiplayerGameLobby from '../components/game/MultiplayerGameLobby';
import MultiplayerGameUI from '../components/game/MultiplayerGameUI';
import { useAuthStore } from '../store/authStore';
import { useMultiGameStore } from '../store/multiGameStore';
import { type S2C_RoundStart, type S2C_Message, type S2C_RoundResult, type C2S_SubmitGuess } from '../types/websocket.types';
import type { GameState, Player, PlayerHandResult } from '../core/types';

// PUT 요청 및 WebSocket 연결을 처리하는 재사용 가능한 함수
const connectToRoomAndWebSocket = async (
  newRoomCode: string,
  token: string,
  backendUrl: string,
  wsRef: React.RefObject<WebSocket | null>
): Promise<boolean> => {
  try {
    // 1. PUT 요청으로 방 참여 성공 여부 체크
    const putResponse = await fetch(`${backendUrl}/game/multi/room`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomCode: newRoomCode }),
    });

    if (!putResponse.ok) {
      console.error("Failed to join room (PUT request):", putResponse.status, putResponse.statusText);
      alert(`방 참여에 실패했습니다: ${putResponse.statusText}`);
      return false;
    }
    console.log(`Successfully joined room ${newRoomCode} via PUT request.`);

    // 2. WebSocket 연결 설정
    // 기존 WebSocket 연결이 있다면 닫기
    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsProtocol = backendUrl.startsWith('https') ? 'wss' : 'ws';
    const wsHost = new URL(backendUrl).host;
    const wsUrl = `${wsProtocol}://${wsHost}/ws/${newRoomCode}?token=${token}`;
    
    wsRef.current = new WebSocket(wsUrl);

    return true;
  } catch (error) {
    console.error("Error in connectToRoomAndWebSocket:", error);
    alert("방 연결 및 WebSocket 설정 중 오류가 발생했습니다.");
    return false;
  }
};
type GamePhase = 'predicting' | 'results';

const MultiGame: React.FC = () => {
  const {
    phase,
    roomCode,
    manualRoomCode,
    players,
    setPhase,
    setRoomCode,
    setManualRoomCode,
    setPlayers,
    startCountdown,
    cancelCountdown,
    reset,
  } = useMultiGameStore();

  const { token, userName } = useAuthStore();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const ws = useRef<WebSocket | null>(null);

  // State for the actual multiplayer game
  const [multiplayerGameState, setMultiplayerGameState] = useState<GameState | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('predicting');
  const [predictions, setPredictions] = useState<{ [playerId: number]: number }>({});
  const [, setResults] = useState<PlayerHandResult[] | null>(null);
  const [scores, setScores] = useState<{ [playerId: number]: number }>({});

  // Central WebSocket message handler
  useEffect(() => {
    if (!ws.current) return;

    ws.current.onopen = () => {
      console.log('WebSocket connected to room:', roomCode);
      ws.current!.send(JSON.stringify({ type: "JOIN_ROOM", payload: { roomCode: roomCode } }));
    };

    ws.current.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      try {
        const message: S2C_Message = JSON.parse(event.data);
        switch (message.type) {
          case 'LOBBY_STATE':
            setPlayers(message.payload.players);
            break;
          case 'GAME_START_COUNTDOWN':
            startCountdown(message.payload.duration);
            break;
          case 'GAME_START_CANCELLED':
            cancelCountdown();
            break;
          case 'GAME_STARTED':
            setPhase('game');
            break;
          case 'ROUND_START': {
            setPhase('game');
            const roundStartMessage = message as S2C_RoundStart;
            console.log("ROUND_START message received:", roundStartMessage);

            // Reset states for the new round
            setGamePhase('predicting');
            setResults(null);
            setPredictions({});

            const { holeCards, communityCards, playerName } = roundStartMessage.payload;
            
            // `players` is from the multiGameStore state
            const newPlayersState: Player[] = players.map((p, index) => ({
              id: index + 1, // Simple ID generation
              name: p.name,
              holeCards: p.name === playerName ? holeCards : [], // Give real cards only to the current player
            }));

            setMultiplayerGameState({
              players: newPlayersState,
              communityCards: communityCards,
              deck: [], // Not used on client
            });
            break;
          }
          case 'ROUND_RESULT': {
            const { payload } = message as S2C_RoundResult;
            setGamePhase('results');

            setMultiplayerGameState(prevGameState => {
                if (!prevGameState) return null;

                const newScores: { [playerId: number]: number } = {};
                const newPredictions: { [playerId: number]: number } = {};

                const updatedPlayers = prevGameState.players.map(player => {
                    const resultForPlayer = payload.results.find(r => r.name === player.name);
                    if (!resultForPlayer) return player;

                    newScores[player.id] = resultForPlayer.score;
                    newPredictions[player.id] = resultForPlayer.guess;

                    return {
                        ...player,
                        holeCards: resultForPlayer.holeCards,
                        evaluatedHand: resultForPlayer.evaluatedHand,
                        predictedRank: resultForPlayer.guess,
                        actualRank: resultForPlayer.actualRank,
                        isCorrect: resultForPlayer.isCorrect,
                    };
                });

                setScores(newScores);
                setPredictions(newPredictions);

                return { ...prevGameState, players: updatedPlayers };
            });
            break;
        }
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };

    ws.current.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

  }, [ws.current, roomCode, players, setPlayers, startCountdown, cancelCountdown, setPhase, setMultiplayerGameState, setGamePhase, setPredictions, setResults, setScores]);


  // WebSocket connection and store cleanup (on component unmount)
  useEffect(() => {
    return () => {
      if (ws.current) {
        console.log('Closing WebSocket connection.');
        ws.current.close();
      }
      console.log('Resetting multi-game store.');
      reset();
    };
  }, [reset]);

  const handlePlayerReadyToggle = (isReady: boolean) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'PLAYER_READY',
        payload: {
          isReady: isReady,
        },
      };
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected or not open.');
    }
  };

  const handleGetRoomCode = async () => {
    if (!token) {
      console.error("No authentication token found. Please log in.");
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      // 1. GET 요청으로 방 코드 받아오기
      const getResponse = await fetch(`${backendUrl}/game/multi/room`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!getResponse.ok) {
        console.error("Failed to fetch room code:", getResponse.status, getResponse.statusText);
        alert(`방 코드를 받아오는데 실패했습니다: ${getResponse.statusText}`);
        return;
      }

      const getResult = await getResponse.json();
      if (!getResult || !getResult.data) {
        console.error("Invalid response format for GET room code:", getResult);
        alert("방 코드를 받아오는데 실패했습니다: 잘못된 응답 형식");
        return;
      }
      const newRoomCode = getResult.data;
      
      // 2. 재사용 가능한 함수 호출
      const connected = await connectToRoomAndWebSocket(newRoomCode, token, backendUrl, ws);
      if (connected) {
        setRoomCode(newRoomCode);
      } else {
        setRoomCode(null);
      }

    } catch (error) {
      console.error("Error in room code process:", error);
      alert("방 코드 처리 중 오류가 발생했습니다.");
    }
  };

  const handleJoinRoomManually = async () => {
    if (!token) {
      console.error("No authentication token found. Please log in.");
      alert("로그인이 필요합니다.");
      return;
    }
    if (!manualRoomCode) {
      alert("방 코드를 입력해주세요.");
      return;
    }

    // 수동 입력된 방 코드로 연결 시도
    const connected = await connectToRoomAndWebSocket(manualRoomCode, token, backendUrl, ws);
    if (connected) {
      setRoomCode(manualRoomCode); // 성공 시 현재 방 코드 업데이트
    } else {
      setRoomCode(null); // 실패 시 초기화
    }
  };

  const handlePredictionChange = (playerId: number, rank: number) => {
    setPredictions(prev => ({ ...prev, [playerId]: rank }));
  };

  const handleConfirmPrediction = () => {
    const currentPlayer = multiplayerGameState?.players.find(p => p.name === userName);
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN || !currentPlayer) {
        console.error('WebSocket not open or current player not found.');
        return;
    }

    const guess = predictions[currentPlayer.id];
    if (!guess) {
        alert('등수를 예측해주세요.'); // Please make a prediction.
        return;
    }

    const message: C2S_SubmitGuess = {
        type: 'SUBMIT_GUESS',
        payload: {
            guess: guess,
        },
    };
    ws.current.send(JSON.stringify(message));
  };

  const handleStartNewRound = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'NEXT_ROUND_READY', // Assuming this type will be defined
        payload: {},
      };
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected or not open.');
    }
  };

  const renderPhase = () => {
    switch (phase) {
      case 'lobby':
        return (
          <MultiplayerGameLobby
            roomCode={roomCode}
            manualRoomCode={manualRoomCode}
            handleGetRoomCode={handleGetRoomCode}
            handleJoinRoomManually={handleJoinRoomManually}
            setManualRoomCode={setManualRoomCode}
            setPhase={setPhase}
            players={players}
            onPlayerReadyToggle={handlePlayerReadyToggle}
          />
        );
      case 'game':
        return (
          <MultiplayerGameUI
            ws={ws}
            roomCode={roomCode}
            token={token}
            backendUrl={backendUrl}
            userName={userName}
            multiplayerGameState={multiplayerGameState}
            gamePhase={gamePhase}
            predictions={predictions}
            onPredictionChange={handlePredictionChange}
            onConfirmPrediction={handleConfirmPrediction}
            onStartNewRound={handleStartNewRound}
            scores={scores}
            // results={results}
          />
        );
      default:
        return <div>Invalid game phase</div>;
    }
  };

  return (
    <div className="multigame-container">
      <h1>Multiplayer Game</h1>
      {renderPhase()}
    </div>
  );
};

export default MultiGame;
