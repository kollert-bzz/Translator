import React from 'react';
import './gameOver.css';

export default function GameOver({ onRestart }) {
    return (
        <div className="game-over-container">
            <h1>Game Over</h1>
            <p>Sorry, but you lost the game. Try again!</p>
            <button onClick={onRestart}>Restart</button>
        </div>
    );
}
