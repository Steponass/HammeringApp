import React, { useEffect, useRef } from 'react';
import useMouseTracking from 'hooks/useMouseTracking';
import useCollisionDetection from 'hooks/useCollisionDetection';
import type { GameObject, Position } from 'types/game';
import styles from './CollisionTest.module.css';

// Mock game objects for testing
const createMockObjects = (): GameObject[] => [
  {
    id: 'phone-1',
    position: { x: 200, y: 150 },
    objectType: 'phone',
    nailType: 'small-nail',
    state: 'normal',
    radius: 30,
    size: 60
  },
  {
    id: 'cup-1',
    position: { x: 400, y: 200 },
    objectType: 'cup',
    nailType: 'medium-nail',
    state: 'normal',
    radius: 25,
    size: 50
  },
  {
    id: 'lamp-1',
    position: { x: 300, y: 350 },
    objectType: 'lamp',
    nailType: 'large-nail',
    state: 'normal',
    radius: 35,
    size: 70
  }
];

const CollisionTest: React.FC = () => {
  // Get mouse/touch tracking data
  const { shadowPosition, inputMode } = useMouseTracking();
  
  // Reference to game area for coordinate conversion
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  // Convert viewport coordinates to game-area-relative coordinates
  const getGameAreaRelativePosition = (viewportPosition: Position): Position => {
    if (!gameAreaRef.current) {
      return viewportPosition;
    }
    
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    return {
      x: viewportPosition.x - gameAreaRect.left,
      y: viewportPosition.y - gameAreaRect.top
    };
  };
  
  // Convert shadow position to game area coordinates
  const gameAreaShadowPosition = getGameAreaRelativePosition(shadowPosition);
  
  // Debug logging
  useEffect(() => {
    console.log('Viewport shadow position:', shadowPosition);
    console.log('Game area shadow position:', gameAreaShadowPosition);
  }, [shadowPosition, gameAreaShadowPosition]);
  
  // Create mock objects
  const mockObjects = createMockObjects();
  
  // Use game-area-relative position for collision detection
  const { intersectingObjects, primaryObject, totalIntersections } = useCollisionDetection(
    gameAreaShadowPosition,
    mockObjects
  );

  return (
    <div className={styles.testContainer}>
      {/* Debug Panel */}
      <div className={styles.debugPanel}>
        <h3>Collision Detection Test</h3>
        <div className={styles.debugInfo}>
          <p><strong>Input Mode:</strong> {inputMode}</p>
          <p><strong>Viewport Position:</strong> ({Math.round(shadowPosition.x)}, {Math.round(shadowPosition.y)})</p>
          <p><strong>Game Area Position:</strong> ({Math.round(gameAreaShadowPosition.x)}, {Math.round(gameAreaShadowPosition.y)})</p>
          <p><strong>Total Intersections:</strong> {totalIntersections}</p>
          <p><strong>Primary Object:</strong> {primaryObject || 'None'}</p>
        </div>
        
        {/* Show if shadow is at origin */}
        {shadowPosition.x === 0 && shadowPosition.y === 0 && (
          <div style={{ color: 'red', fontWeight: 'bold' }}>
            ⚠️ Shadow at origin - move mouse to initialize
          </div>
        )}
        
        {/* Intersection Details */}
        {intersectingObjects.length > 0 && (
          <div className={styles.intersectionList}>
            <h4>Intersecting Objects:</h4>
            {intersectingObjects.map((maskData) => (
              <div key={maskData.objectId} className={styles.intersectionItem}>
                <p><strong>{maskData.objectId}</strong></p>
                <p>Coverage: {Math.round(maskData.intersectionPercentage * 100)}%</p>
                <p>Fully Covered: {maskData.isFullyCovered ? 'Yes' : 'No'}</p>
                <p>Relative Pos: ({Math.round(maskData.maskCoordinates.centerX)}, {Math.round(maskData.maskCoordinates.centerY)})</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visual Test Area */}
      <div className={styles.gameArea} ref={gameAreaRef}>
        {/* Add mouse position indicator */}
        <div
          className={styles.mouseIndicator}
          style={{
            left: gameAreaShadowPosition.x - 5,
            top: gameAreaShadowPosition.y - 5,
          }}
        />
        
        {/* Render mock objects */}
        {mockObjects.map((object: GameObject) => {
          const maskData = intersectingObjects.find(m => m.objectId === object.id);
          const isIntersecting = !!maskData;
          
          return (
            <div
              key={object.id}
              className={`${styles.testObject} ${isIntersecting ? styles.intersecting : ''}`}
              style={{
                left: object.position.x,
                top: object.position.y,
                width: object.size,
                height: object.size,
              }}
            >
              <span className={styles.objectLabel}>{object.objectType}</span>
              {maskData && (
                <div 
                  className={styles.maskVisualization}
                  style={{
                    '--mask-x': `${maskData.maskCoordinates.centerX}px`,
                    '--mask-y': `${maskData.maskCoordinates.centerY}px`,
                    '--mask-radius': `${maskData.maskCoordinates.radius}px`
                  } as React.CSSProperties}
                />
              )}
            </div>
          );
        })}

        {/* Render shadow */}
        <div
          className={styles.shadow}
          style={{
            left: gameAreaShadowPosition.x - 60,
            top: gameAreaShadowPosition.y - 60,
          }}
        />
      </div>
    </div>
  );
};

export default CollisionTest;