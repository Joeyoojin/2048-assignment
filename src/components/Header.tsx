import React from 'react';

interface HeaderProps {
  onReplay: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReplay }) => (
  <div className="header">
    <div className="header-text">
      <div className="title">128</div>
      <div className="sub-container">
        <div className="sub-title">
          Join the tiles, get to <strong>128!</strong> <br />
          <strong className="underline">How to play</strong> •{' '}
          <strong className="underline">Give feedback</strong>
        </div>
        <button onClick={onReplay} className="replay-button">
          New Game
        </button>
      </div>
    </div>
  </div>
);
