import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { createDeck, shuffleDeck, dealCards } from '../core/deck';
import { type Card as CardType } from '../core/types';
import './Login.css';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from '../store/authStore';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const {
    isLoggedIn,
    userName,
    isLoading,
    login,
    logout,
  } = useAuthStore();

  const [randomCards, setRandomCards] = React.useState<CardType[]>([]);

  useEffect(() => {
    console.log("Generating new random cards for login screen...");
    const deck = createDeck();
    const shuffledDeck = shuffleDeck(deck);
    // const dealtCards = dealCards(shuffledDeck, 5);
    const dealtCards = dealCards(shuffledDeck, 1);
    setRandomCards(dealtCards);
  }, []);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleLoginSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      await login(credentialResponse.credential, backendUrl);
    }
  };

  const handleLoginError = () => {
    console.log('Login Failed');
    // Optionally, you can call a logout or reset action from your store here
  };

  const handleContinue = () => {
    navigate('/setup');
  };

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="login-container">
        <h1 className="game-title">account</h1>
        <div className="card-display-1">
          {randomCards.map((card, index) => (
            <Card key={index} card={card} />
          ))}
        </div>
        <div className="google-login-container">
          {isLoggedIn ? (
            <div className="welcome-container">
              <span>Welcome, {userName}!</span>
              <button onClick={() => logout()} className="logout-button">Logout</button>
            </div>
          ) : isLoading ? (
            <div>로그인 중...</div>
          ) : (
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
            />
          )}
        </div>
        <button className="continue-button" onClick={handleContinue} disabled={!isLoggedIn}>
        계속
        </button>
      </div>
      
    </GoogleOAuthProvider>
  );
};

export default Login;
