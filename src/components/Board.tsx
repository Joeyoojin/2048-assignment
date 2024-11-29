import React from 'react';

import type { Grid } from '../utils/gridUtils.ts';

interface BoardProps {
  grid: Grid;
}

export const Board: React.FC<BoardProps> = ({ grid }) => (
  <div className="board">
    {grid.map((row, rowIndex) => (
      <div key={rowIndex} className="row">
        {row.map((cell, cellIndex) => (
          <div key={cellIndex} className={`cell cell-${cell ?? 'default'}`}>
            {cell !== null ? cell : ''}
          </div>
        ))}
      </div>
    ))}
  </div>
);
