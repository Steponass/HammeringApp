import React from "react";
import GameField from "components/GameField";
import { GameState } from "types/game";
import type { ResponsiveLayoutConfig } from "utils/responsiveLayout";

interface GameProps {
  gameState: GameState;
  isLoading: boolean;
  isAnimating: boolean;
  isRepositioning?: boolean;
  isResizing?: boolean;
  responsiveConfig?: ResponsiveLayoutConfig;
  hammerObject: (objectId: string) => void;
}

const Game: React.FC<GameProps> = ({
  gameState,
  isAnimating,
  isRepositioning = false,
  isResizing = false,
  responsiveConfig,
  hammerObject,
}) => {
  

  const isAnyResponsiveActivity = isRepositioning || isResizing;
  
  const containerStyle = React.useMemo(() => {
    const baseStyle = {
      position: "absolute" as const,
      top: 50,
      left: 0,
      width: "100vw",
      height: "calc(100vh - 50px)",
    };

    if (isAnyResponsiveActivity) {
      return {
        ...baseStyle,
        opacity: 0.98,
        transition: "opacity 0.2s ease-out",
        pointerEvents: isRepositioning ? ("none" as const) : ("auto" as const),
      };
    }

    return baseStyle;
  }, [isAnyResponsiveActivity, isRepositioning]);


  return (
    <div style={containerStyle}>
      <GameField
        gameState={gameState}
        isAnimating={isAnimating}
        isRepositioning={isRepositioning}
        responsiveConfig={responsiveConfig}
        hammerObject={hammerObject}
      />
      
    </div>
  );
};

export default Game;