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
            <div key={cellIndex} className={`cell ${getStyleByValue(cell)}`}>
              {cell !== 0 && cell !== null ? cell : ''}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const getStyleByValue = (value: Cell): string => {
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
  // localStorage에서 그리드를 불러오고 없으면 초기 그리드를 생성
  const [grid, setGrid] = useState<Grid>(() => {
    const savedGrid = localStorage.getItem('2048-grid');
    return savedGrid !== null
      ? (JSON.parse(savedGrid) as Grid)
      : generateInitialGrid();
  });
  const [gameOver, setGameOver] = useState<boolean>(() => {
    const savedGameOver = localStorage.getItem('2048-game-over');
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
          localStorage.setItem('2048-grid', JSON.stringify(newGrid));
        }

        if (result.flat().includes(128)) {
          setGameOver(true);
          localStorage.setItem('2048-game-over', JSON.stringify(true));
        }
      }
    },
    [grid, gameOver],
  );

  const handleReplay = () => {
    setGrid(generateInitialGrid()); // 새로운 게임을 위한 초기 그리드 생성
    setGameOver(false); // 게임 오버 상태 초기화
    localStorage.removeItem('2048-grid'); // localStorage에서 그리드 삭제
    localStorage.setItem('2048-game-over', JSON.stringify(false)); // localStorage에서 게임 오버 상태 초기화
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    localStorage.setItem('2048-grid', JSON.stringify(grid));
    localStorage.setItem('2048-game-over', JSON.stringify(gameOver));
  }, [grid, gameOver]);

  return (
    <div className="game-container">
      <div className="title">128</div>
      <div className="sub-title">Join the tiles, get to 128!</div>
      <Board grid={grid} />
      {gameOver && (
        <div>
          <div className="game-over">Game Over!</div>
          <div onClick={handleReplay} className="replay">
            Wanna Replay?
          </div>
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
