import type { Cell, Grid } from './gridUtils';

export const moveMapIn2048Rule = (
  grid: Grid,
  direction: 'up' | 'down' | 'left' | 'right',
): { result: Grid; isMoved: boolean } => {
  const rotatedGrid = rotateMapCounterClockwise(
    grid,
    rotateDegreeMap[direction],
  );
  const { result, isMoved } = moveLeft(rotatedGrid);
  return {
    result: rotateMapCounterClockwise(result, revertDegreeMap[direction]),
    isMoved,
  };
};

const rotateDegreeMap = {
  up: 90,
  right: 180,
  down: 270,
  left: 0,
} as const;

const revertDegreeMap = {
  up: 270,
  right: 180,
  down: 90,
  left: 0,
} as const;

const rotateMapCounterClockwise = (grid: Grid, degree: number): Grid => {
  const rowLength = grid.length;
  const columnLength = grid[0]?.length ?? 0;

  if (rowLength === 0 || columnLength === 0) {
    return grid;
  }

  switch (degree) {
    case 0:
      return grid;
    case 90:
      return Array.from({ length: columnLength }, (_, colIndex) =>
        Array.from(
          { length: rowLength },
          (_, rowIndex) =>
            grid[rowIndex]?.[columnLength - colIndex - 1] ?? null,
        ),
      );
    case 180:
      return Array.from({ length: rowLength }, (_, rowIndex) =>
        Array.from(
          { length: columnLength },
          (_, colIndex) =>
            grid[rowLength - rowIndex - 1]?.[columnLength - colIndex - 1] ??
            null,
        ),
      );
    case 270:
      return Array.from({ length: columnLength }, (_, colIndex) =>
        Array.from(
          { length: rowLength },
          (_, rowIndex) => grid[rowLength - rowIndex - 1]?.[colIndex] ?? null,
        ),
      );
    default:
      return grid;
  }
};

export const moveLeft = (grid: Grid): { result: Grid; isMoved: boolean } => {
  const movedRows = grid.map(moveRowLeft);
  const result = movedRows.map((row) => row.result);
  const isMoved = movedRows.some((row) => row.isMoved);
  return { result, isMoved };
};

export const moveRowLeft = (
  row: Cell[],
): { result: Cell[]; isMoved: boolean } => {
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

  const result = [...reduced.result, reduced.lastCell].filter(
    (c) => c !== null,
  );
  const resultRow: Cell[] = [
    ...result,
    ...(Array(row.length - result.length).fill(null) as Cell[]),
  ];

  return {
    result: resultRow,
    isMoved: row.some((cell, i) => cell !== resultRow[i]),
  };
};
