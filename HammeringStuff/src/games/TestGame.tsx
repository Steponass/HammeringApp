// src/components/TestGame.tsx
import React from "react";
import GameField from "components/GameField";

const TestGame: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 75,
        left: 0,
        width: "100vw",
        height: "calc(100vh - 75px)",
      }}
    >
      <GameField />
    </div>
  );
};

export default TestGame;
