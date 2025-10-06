import React from 'react';
import { type Card as CardType, type Suit, SUITS } from '../core/types';
import './Card.css';

interface CardProps {
  card: CardType;
}

const getSuitColorClass = (suit: Suit): string => {
  switch (suit) {
    case SUITS.Hearts:
      return 'hearts';
    case SUITS.Diamonds:
      return 'diamonds';
    case SUITS.Spades:
      return 'spades';
    case SUITS.Clubs:
      return 'clubs';
    default:
      return 'spades'; // Default to black
  }
};

const Card: React.FC<CardProps> = ({ card }) => {
  const colorClass = getSuitColorClass(card.suit);

  return (
    <div className={`card-component ${colorClass}`}>
      <span className="rank">{card.rank}</span>
      <span className="suit">{card.suit}</span>
    </div>
  );
};

export default Card;