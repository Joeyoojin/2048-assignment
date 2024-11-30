import { describe, expect, it } from 'vitest';

type Cell = number | null;

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

describe('moveRowLeft', () => {
  it('should move numbers to the left and combine adjacent equal numbers', () => {
    const input: Cell[] = [2, 2, null, 4];
    const expectedOutput = { result: [4, 4, null, null], isMoved: true };

    expect(moveRowLeft(input)).toEqual(expectedOutput);
  });

  it('should return the same row if no movement or combination is possible', () => {
    const input: Cell[] = [2, null, 4, null];
    const expectedOutput = { result: [2, 4, null, null], isMoved: true };

    expect(moveRowLeft(input)).toEqual(expectedOutput);
  });

  it('should handle rows with all nulls', () => {
    const input: Cell[] = [null, null, null, null];
    const expectedOutput = { result: [null, null, null, null], isMoved: false };

    expect(moveRowLeft(input)).toEqual(expectedOutput);
  });
});
