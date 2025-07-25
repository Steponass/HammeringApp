// games/TestGame.tsx - Enhanced with comprehensive responsive behavior support
import React from "react";
import GameField from "components/GameField";
import { GameState } from "types/game";
import type { ResponsiveLayoutConfig } from "utils/responsiveLayout";

// EXPLANATION: We're extending your existing interface with responsive props
// Notice how we're adding these as optional props with sensible defaults
// This ensures backward compatibility if you have other places that use TestGame
interface TestGameProps {
  gameState: GameState;
  isLoading: boolean;
  isAnimating: boolean;
  isRepositioning?: boolean;    // NEW: Track when objects are being repositioned
  isResizing?: boolean;         // NEW: Track when viewport is actively changing
  responsiveConfig?: ResponsiveLayoutConfig; // NEW: Current responsive configuration
  hammerObject: (objectId: string) => void;
}

const TestGame: React.FC<TestGameProps> = ({
  gameState,
  isLoading,
  isAnimating,
  isRepositioning = false,  // NEW: Default to false for backward compatibility
  isResizing = false,       // NEW: Default to false for backward compatibility
  responsiveConfig,         // NEW: Will be undefined if not provided
  hammerObject,
}) => {
  
  // EXPLANATION: This is where TestGame adds its own responsive intelligence
  // We're analyzing the responsive state to determine how this component should behave
  const isAnyResponsiveActivity = isRepositioning || isResizing;
  
  // EXPLANATION: We can use responsive configuration to make intelligent UI decisions
  // For example, we might want to adjust our container styling based on device type
  const containerStyle = React.useMemo(() => {
    const baseStyle = {
      position: "absolute" as const,
      top: 50,
      left: 0,
      width: "100vw",
      height: "calc(100vh - 50px)",
    };

    // EXPLANATION: During responsive transitions, we can provide subtle visual feedback
    // This helps users understand that the system is adapting rather than being broken or slow
    if (isAnyResponsiveActivity) {
      return {
        ...baseStyle,
        // EXPLANATION: We use a very subtle opacity change to indicate responsive activity
        // This is barely noticeable but provides subconscious feedback that something is happening
        opacity: 0.98,
        // EXPLANATION: We add a smooth transition so the opacity change isn't jarring
        // The transition duration is short enough to feel responsive but long enough to be smooth
        transition: "opacity 0.2s ease-out",
        // EXPLANATION: During responsive transitions, we might want to slightly reduce pointer events
        // This prevents users from initiating new interactions while repositioning is happening
        pointerEvents: isRepositioning ? ("none" as const) : ("auto" as const),
      };
    }

    return baseStyle;
  }, [isAnyResponsiveActivity, isRepositioning]);

  // EXPLANATION: We can also create responsive-aware loading states
  // This gives us more granular control over what loading indicators to show when
  const shouldShowLoadingIndicator = isLoading || isRepositioning;

  // EXPLANATION: Here's where we demonstrate responsive-aware content decisions
  // Based on the responsive configuration, we might want to adjust what we render
  const shouldShowResponsiveFeedback = isRepositioning && responsiveConfig;

  return (
    <div style={containerStyle}>
      {/* EXPLANATION: Your core GameField component receives enhanced props
          Notice how we're passing through both your existing props and new responsive props
          This maintains your existing functionality while adding responsive capabilities */}
      <GameField
        gameState={gameState}
        isAnimating={isAnimating}
        isRepositioning={isRepositioning}    // NEW: Pass repositioning state to GameField
        responsiveConfig={responsiveConfig}  // NEW: Pass responsive configuration
        hammerObject={hammerObject}
      />
      
      {/* EXPLANATION: Here we demonstrate how to provide helpful user feedback during responsive operations
          This is optional and can be customized or removed based on your design preferences */}
      {shouldShowResponsiveFeedback && (
        <ResponsiveFeedbackIndicator 
          responsiveConfig={responsiveConfig!}
          isRepositioning={isRepositioning}
        />
      )}
      
      {/* EXPLANATION: If you want to show different loading states for different operations,
          you can create more sophisticated loading indicators here */}
      {shouldShowLoadingIndicator && (
        <LoadingOverlay 
          isRepositioning={isRepositioning} 
          isInitialLoading={isLoading}
        />
      )}
    </div>
  );
};

// EXPLANATION: Here's an example of a helper component that provides responsive feedback
// This demonstrates how you can create modular, reusable responsive UI components
const ResponsiveFeedbackIndicator: React.FC<{
  responsiveConfig: ResponsiveLayoutConfig;
  isRepositioning: boolean;
}> = ({ responsiveConfig, isRepositioning }) => {
  
  // EXPLANATION: We can use the responsive configuration to provide intelligent feedback
  // Different types of changes might warrant different feedback messages
  const getFeedbackMessage = () => {
    if (!isRepositioning) return "";
    
    // EXPLANATION: We can provide context-aware messages based on device type
    // This helps users understand what kind of adaptation is happening
    switch (responsiveConfig.deviceType) {
      case 'mobile':
        return "Optimizing for mobile...";
      case 'tablet':
        return "Adapting for tablet...";
      case 'desktop':
        return "Adjusting layout...";
      default:
        return "Adapting layout...";
    }
  };

  if (!isRepositioning) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0, 0, 0, 0.75)",
        color: "white",
        padding: "8px 16px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: "500",
        zIndex: 1001,
        pointerEvents: "none",
        // EXPLANATION: We add a subtle animation to make the appearance feel polished
        animation: "fadeInUp 0.3s ease-out",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
      }}
    >
      {getFeedbackMessage()}
    </div>
  );
};

// EXPLANATION: This demonstrates how to create different loading states for different operations
// You might want different visual feedback for initial loading vs responsive repositioning
const LoadingOverlay: React.FC<{
  isRepositioning: boolean;
  isInitialLoading: boolean;
}> = ({ isRepositioning, isInitialLoading }) => {
  
  // EXPLANATION: We can provide different loading experiences for different situations
  // Initial loading might need a full overlay, while repositioning might need something more subtle
  if (isInitialLoading) {
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(255, 255, 255, 0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          fontSize: "16px",
          color: "#666",
        }}
      >
        Loading game...
      </div>
    );
  }

  // EXPLANATION: For repositioning, we might want a more subtle loading indicator
  // that doesn't completely obscure the game but still provides feedback
  if (isRepositioning) {
    return (
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          background: "rgba(0, 0, 0, 0.6)",
          color: "white",
          padding: "6px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          zIndex: 1001,
          pointerEvents: "none",
        }}
      >
        ⟳ Adapting
      </div>
    );
  }

  return null;
};

export default TestGame;