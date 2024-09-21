import './App.css';
import './index.css';

import React, { useCallback, useEffect, useState } from 'react';

type Cell = number | null;
type Grid = Cell[][];
type Direction = 'up' | 'down' | 'left' | 'right';
type Position = { rowIndex: number; cellIndex: number };

const getEmptyCells = (grid: Grid): Position[] => {
  return grid
    .flatMap((row, rowIndex) =>
      row.map((cell, cellIndex): Position | null =>
        cell === null ? ({ rowIndex, cellIndex } as Position) : null,
      ),
    )
    .filter((pos): pos is Position => pos !== null);
};

const generateInitialGrid = (): Grid => {
  const grid: Grid = Array.from({ length: 4 }, (): Cell[] =>
    Array.from({ length: 4 }, () => null as Cell),
  );

  for (let i = 0; i < 2; i++) {
    const emptyCells: Position[] = getEmptyCells(grid);

    if (emptyCells.length > 0) {
      const cell: Position = emptyCells[
        Math.floor(Math.random() * emptyCells.length)
      ] as Position;

      (grid[cell.rowIndex] as Cell[])[cell.cellIndex] = 2;
    }
  }

  return grid;
};

const addRandomCell = (grid: Grid): Grid => {
  const emptyCells: Position[] = getEmptyCells(grid);

  if (emptyCells.length > 0) {
    const cell: Position = emptyCells[
      Math.floor(Math.random() * emptyCells.length)
    ] as Position;
    (grid[cell.rowIndex] as Cell[])[cell.cellIndex] =
      Math.random() < 0.9 ? 2 : 4;
  }

  return grid;
};

interface BoardProps {
  grid: Grid;
}

const Board: React.FC<BoardProps> = ({ grid }) => {
  return (
    <div className="board">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, cellIndex) => (
            <div key={cellIndex} className={`cell ${getDesignByValue(cell)}`}>
              {cell !== 0 && cell !== null ? cell : ''}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const getDesignByValue = (value: Cell): string => {
  switch (value) {
    case 2:
      return 'cell-2';
    case 4:
      return 'cell-4';
    case 8:
      return 'cell-8';
    case 16:
      return 'cell-16';
    case 32:
      return 'cell-32';
    case 64:
      return 'cell-64';
    case 128:
      return 'cell-128';
    default:
      return 'cell-default';
  }
};

const Game: React.FC = () => {
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

      if (direction !== undefined) {
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
      }
    },
    [grid, gameOver],
  );

  const handleReplay = () => {
    setGrid(generateInitialGrid());
    setGameOver(false);
    localStorage.removeItem('128-grid');
    localStorage.setItem('128-game-over', JSON.stringify(false));
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    localStorage.setItem('128-grid', JSON.stringify(grid));
    localStorage.setItem('128-game-over', JSON.stringify(gameOver));
  }, [grid, gameOver]);

  return (
    <div className="game-container">
      <div className="header">
        <div className="header-text">
          <div className="title">128</div>
          <div className="sub-container">
            <div className="sub-title">
              Join the tiles, get to <strong>128!</strong> <br />{' '}
              <strong className="underline">How to play</strong> •{' '}
              <strong className="underline">Give feedback</strong>
            </div>

            <button onClick={handleReplay} className="replay-button">
              New Game
            </button>
          </div>
        </div>
      </div>
      <Board grid={grid} />
      {gameOver && (
        <div>
          <div className="game-over">Game Over!</div>
        </div>
      )}
    </div>
  );
};

const moveMapIn2048Rule = (
  map: Grid,
  direction: Direction,
): { result: Grid; isMoved: boolean } => {
  const rotatedMap = rotateMapCounterClockwise(map, rotateDegreeMap[direction]);
  const { result, isMoved } = moveLeft(rotatedMap);
  return {
    result: rotateMapCounterClockwise(result, revertDegreeMap[direction]),
    isMoved,
  };
};

const rotateDegreeMap: Record<Direction, number> = {
  up: 90,
  right: 180,
  down: 270,
  left: 0,
};

const revertDegreeMap: Record<Direction, number> = {
  up: 270,
  right: 180,
  down: 90,
  left: 0,
};

const rotateMapCounterClockwise = (map: Grid, degree: number): Grid => {
  const rowLength = map.length;
  const columnLength: number = map[0]?.length as number;

  if (columnLength === 0 || rowLength === 0) {
    return map;
  }

  switch (degree) {
    case 0:
      return map;
    case 90:
      return Array.from({ length: columnLength }, (_, columnIndex) =>
        Array.from(
          { length: rowLength },
          (_, rowIndex) =>
            map[rowIndex]?.[columnLength - columnIndex - 1] ?? null,
        ),
      );
    case 180:
      return Array.from({ length: rowLength }, (_, rowIndex) =>
        Array.from(
          { length: columnLength },
          (_, columnIndex) =>
            map[rowLength - rowIndex - 1]?.[columnLength - columnIndex - 1] ??
            null,
        ),
      );
    case 270:
      return Array.from({ length: columnLength }, (_, columnIndex) =>
        Array.from(
          { length: rowLength },
          (_, rowIndex) => map[rowLength - rowIndex - 1]?.[columnIndex] ?? null,
        ),
      );
    default:
      return map;
  }
};

const moveLeft = (map: Grid): { result: Grid; isMoved: boolean } => {
  const movedRows = map.map(moveRowLeft);
  const result = movedRows.map((movedRow) => movedRow.result);
  const isMoved = movedRows.some((movedRow) => movedRow.isMoved);
  return { result, isMoved };
};

const moveRowLeft = (row: Cell[]): { result: Cell[]; isMoved: boolean } => {
  const reduced = row.reduce<{ lastCell: Cell; result: Cell[] }>(
    (acc, cell) => {
      if (cell === null) {
        return acc;
      } else if (acc.lastCell === null) {
        return { ...acc, lastCell: cell };
      } else if (acc.lastCell === cell) {
        return { result: [...acc.result, cell * 2], lastCell: null };
      } else {
        return { result: [...acc.result, acc.lastCell], lastCell: cell };
      }
    },
    { lastCell: null, result: [] },
  );

  const result = [...reduced.result, reduced.lastCell];
  const resultRow = Array.from<unknown, Cell>(
    { length: row.length },
    (_, i) => result[i] ?? null,
  );

  return {
    result: resultRow,
    isMoved: row.some((cell, i) => cell !== resultRow[i]),
  };
};

export default Game;
