import React from "react";
import GameField from "components/GameField";
import { GameState } from "types/game";

interface TestGameProps {
  gameState: GameState;
  isLoading: boolean;
  isAnimating: boolean;
  hammerObject: (objectId: string) => void;
}

const TestGame: React.FC<TestGameProps> = ({
  gameState,
  hammerObject,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 50,
        left: 0,
        width: "100vw",
        height: "calc(100vh - 50px)",
      }}
    >
      <GameField
        gameState={gameState}
        hammerObject={hammerObject}
      />
    </div>
  );
};

export default TestGame;
