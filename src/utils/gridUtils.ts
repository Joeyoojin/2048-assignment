export type Cell = number | null;
export type Grid = Cell[][];
type Position = { rowIndex: number; cellIndex: number };

const getEmptyCells = (grid: Grid): Position[] => {
  return grid
    .flatMap((row, rowIndex) =>
      row.map((cell, cellIndex): Position | null =>
        cell === null ? { rowIndex, cellIndex } : null,
      ),
    )
    .filter((pos): pos is Position => pos !== null);
};

export const generateInitialGrid = (): Grid => {
  const grid: Grid = Array.from({ length: 4 }, (): Cell[] =>
    Array.from({ length: 4 }, () => null as Cell),
  );

  for (let i = 0; i < 2; i++) {
    const emptyCells = getEmptyCells(grid);

    if (emptyCells.length > 0) {
      const cell: Position = emptyCells[
        Math.floor(Math.random() * emptyCells.length)
      ] as Position;

      (grid[cell.rowIndex] as Cell[])[cell.cellIndex] = 2;
    }
  }

  return grid;
};

export const addRandomCell = (grid: Grid): Grid => {
  const emptyCells = getEmptyCells(grid);

  if (emptyCells.length > 0) {
    const cell: Position = emptyCells[
      Math.floor(Math.random() * emptyCells.length)
    ] as Position;
    (grid[cell.rowIndex] as Cell[])[cell.cellIndex] =
      Math.random() < 0.9 ? 2 : 4;
  }

  return grid;
};
