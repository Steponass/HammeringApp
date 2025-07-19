// src/components/TestGame.tsx
import React from 'react';
import GameField from 'components/GameField';

const TestGame: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <GameField />
    </div>
  );
};

export default TestGame;