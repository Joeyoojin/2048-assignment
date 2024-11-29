import './App.css';

import React, { useCallback, useEffect, useState } from 'react';

import { Board } from './components/Board.tsx';
import { GameOver } from './components/GameOver.tsx';
import { Header } from './components/Header.tsx';
import type { Grid } from './utils/gridUtils.ts';
import { addRandomCell, generateInitialGrid } from './utils/gridUtils.ts';
import { moveMapIn2048Rule } from './utils/moveUtils.ts';

const App: React.FC = () => {
  const [grid, setGrid] = useState<Grid>(() => {
    const savedGrid = localStorage.getItem('128-grid');
    return savedGrid !== null
      ? (JSON.parse(savedGrid) as Grid)
      : generateInitialGrid();
  });
  const [gameOver, setGameOver] = useState<boolean>(() => {
    const savedGameOver = localStorage.getItem('128-game-over');
    return savedGameOver !== null
      ? (JSON.parse(savedGameOver) as boolean)
      : false;
  });

  type Direction = 'up' | 'down' | 'left' | 'right';

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (gameOver) return;

      const directionMap: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };

      const direction = directionMap[event.key];

      if (direction === undefined) return;

      const { result, isMoved } = moveMapIn2048Rule(grid, direction);

      if (isMoved) {
        const newGrid = addRandomCell(result);
        setGrid(newGrid);
        localStorage.setItem('128-grid', JSON.stringify(newGrid));
      }

      if (result.flat().includes(128)) {
        setGameOver(true);
        localStorage.setItem('128-game-over', JSON.stringify(true));
      }
    },
    [grid, gameOver, setGrid, setGameOver],
  );
  const handleReplay = () => {
    const newGrid = generateInitialGrid();
    setGrid(newGrid);
    setGameOver(false);
    localStorage.setItem('128-grid', JSON.stringify(newGrid));
    localStorage.setItem('128-game-over', JSON.stringify(false));
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="game-container">
      <Header onReplay={handleReplay} />
      <Board grid={grid} />
      {gameOver && <GameOver />}
    </div>
  );
};

export default App;
