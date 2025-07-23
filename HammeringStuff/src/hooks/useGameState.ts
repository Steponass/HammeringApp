import { useState, useCallback, useEffect, useRef } from "react";
import type { GameObject, GameState, ObjectState, PlacementConfig } from "types/game";
import { generateUniqueId } from "utils/helpers";
import { getRandomObjectPlacement } from "utils/layout";
import { GAME_CONFIG } from "data/gameConfig";
import { getAllObjectTypes, getObjectDefinition } from "data/objectDefinitions";
import { getResponsiveLayoutConfig } from "utils/responsiveLayout";
import { repositionExistingObjects, shouldDelayRepositioning } from "utils/repositioning";
import type { ResponsiveLayoutConfig } from "utils/responsiveLayout";

interface UseGameStateReturn {
  gameState: GameState;
  isLoading: boolean;
  isRepositioning: boolean
  initializeGame: () => void;
  updateObjectState: (objectId: string, newState: ObjectState) => void;
  hammerObject: (objectId: string) => void;
  resetGame: () => void;
  getObjectById: (objectId: string) => GameObject | undefined;
  getObjectsInState: (state: ObjectState) => GameObject[];
  repositionObjects: (oldConfig: ResponsiveLayoutConfig, newConfig: ResponsiveLayoutConfig) => void; // New: Manual repositioning trigger
}

// Your existing helper functions remain exactly the same
const shuffleArray = <T>(array: T[]): T[] => {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const objectsOverlap = (objectA: GameObject, objectB: GameObject): boolean => {
  const deltaX = objectA.position.x - objectB.position.x;
  const deltaY = objectA.position.y - objectB.position.y;
  const centerDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  return centerDistance < objectA.radius + objectB.radius;
};

const findOverlappingPairs = (objects: GameObject[]): [number, number][] => {
  const overlappingPairs: [number, number][] = [];
  
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      if (objectsOverlap(objects[i], objects[j])) {
        overlappingPairs.push([i, j]);
      }
    }
  }
  
  return overlappingPairs;
};

const useGameState = (): UseGameStateReturn => {
  const [gameState, setGameState] = useState<GameState>({
    objects: [],
    hammeredCount: 0,
    totalCount: 0,
    isGameComplete: false,
    gameStartTime: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // NEW: Track when we're repositioning objects for UI feedback
  const [isRepositioning, setIsRepositioning] = useState<boolean>(false);

  // NEW: Track animation states for edge case handling
  // This helps us know when to delay repositioning to avoid conflicts
  const isHammerAnimating = useRef<boolean>(false);
  const repositionTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Your existing helper function for resolving overlaps
  const resolveAnyRemainingOverlaps = useCallback((
    objects: GameObject[], 
    maxAttempts: number
  ): GameObject[] => {
    let retryAttempts = 0;
    const workingObjects = [...objects];
    
    while (retryAttempts < maxAttempts) {
      const overlappingPairs = findOverlappingPairs(workingObjects);
      
      if (overlappingPairs.length === 0) {
        break;
      }

      for (const [, secondIndex] of overlappingPairs) {
        const objectToReplace = workingObjects[secondIndex];
        const otherObjects = workingObjects.filter((_, idx) => idx !== secondIndex);
        
        const placementConfig: PlacementConfig = {
          minDistance: GAME_CONFIG.minObjectDistance,
          margin: GAME_CONFIG.screenMargin,
          maxAttempts: GAME_CONFIG.difficulty.placementAttempts,
        };

        const newPosition = getRandomObjectPlacement(
          otherObjects,
          placementConfig,
          objectToReplace.radius
        );

        workingObjects[secondIndex] = {
          ...objectToReplace,
          position: newPosition,
        };
      }

      retryAttempts++;
    }

    return workingObjects;
  }, []);

  // Your existing object generation function
  const generateInitialObjects = useCallback((): GameObject[] => {
    const responsiveConfig = getResponsiveLayoutConfig();
    const objectCount = responsiveConfig.objectCount;
    
    const allAvailableObjectTypes = shuffleArray(getAllObjectTypes());
    const selectedObjectTypes = allAvailableObjectTypes.slice(0, objectCount);
    
    const placedObjects: GameObject[] = [];

    for (let i = 0; i < selectedObjectTypes.length; i++) {
      const objectType = selectedObjectTypes[i];
      const objectDefinition = getObjectDefinition(objectType);
      
      if (!objectDefinition) {
        continue;
      }

      const objectRadius = objectDefinition.baseSize / 2;
      const objectSize = objectDefinition.baseSize;

      const placementConfig: PlacementConfig = {
        minDistance: GAME_CONFIG.minObjectDistance,
        margin: GAME_CONFIG.screenMargin,
        maxAttempts: GAME_CONFIG.difficulty.placementAttempts,
      };

      const objectPosition = getRandomObjectPlacement(
        placedObjects,
        placementConfig,
        objectRadius
      );

      const newGameObject: GameObject = {
        id: generateUniqueId(),
        position: objectPosition,
        objectType: objectType,
        nailType: objectDefinition.nailType,
        state: "normal",
        radius: objectRadius,
        size: objectSize,
      };

      placedObjects.push(newGameObject);
    }

    const resolvedObjects = resolveAnyRemainingOverlaps(placedObjects, 10);
    return resolvedObjects;
  }, [resolveAnyRemainingOverlaps]);

  // NEW: The key function that handles responsive repositioning
  // This is where the magic happens when the viewport changes
  const repositionObjects = useCallback((
    oldConfig: ResponsiveLayoutConfig, 
    newConfig: ResponsiveLayoutConfig
  ): void => {
    // EXPLANATION: This edge case handling implements your preference for
    // "continue animation, reposition others" when hammer is in progress
    if (shouldDelayRepositioning(isHammerAnimating.current, false)) {
      // If we're currently hammering an object, queue the repositioning for later
      // This prevents jarring interruptions to user interactions
      if (repositionTimeoutRef.current) {
        clearTimeout(repositionTimeoutRef.current);
      }
      
      repositionTimeoutRef.current = setTimeout(() => {
        repositionObjects(oldConfig, newConfig);
      }, 200); // Brief delay to let current animation complete
      return;
    }

    // Set the repositioning flag for UI feedback
    // This allows your components to show loading states or disable interactions
    setIsRepositioning(true);

    setGameState(previousGameState => {
      // Handle the edge case where no objects exist to reposition
      if (previousGameState.objects.length === 0) {
        setIsRepositioning(false);
        return previousGameState;
      }

      // EXPLANATION: Here we use our hybrid repositioning strategy
      // The utility function analyzes the type of change and chooses the best approach
      const repositionedObjects = repositionExistingObjects(
        previousGameState.objects,
        oldConfig,
        newConfig,
        {
          strategy: 'hybrid',           // Your preferred approach
          transitionDuration: 300,      // Smooth transitions
          performanceMode: 'smooth'     // Can be changed to 'fade' if performance issues arise
        }
      );

      // Clear the repositioning flag after transitions complete
      // The delay is slightly longer than the transition to ensure smoothness
      setTimeout(() => {
        setIsRepositioning(false);
      }, 350);

      return {
        ...previousGameState,
        objects: repositionedObjects
      };
    });
  }, []);

  // ENHANCED: Your hammer function now tracks animation state for better edge case handling
  const hammerObject = useCallback((objectId: string): void => {
    // Track that we're starting a hammer animation
    // This information helps us make smart decisions about when to reposition objects
    isHammerAnimating.current = true;
    
    setGameState((previousGameState) => {
      const targetObject = previousGameState.objects.find(
        (gameObject) => gameObject.id === objectId
      );

      if (!targetObject || targetObject.state === "hammered") {
        isHammerAnimating.current = false;
        return previousGameState;
      }

      const updatedObjects = previousGameState.objects.map((gameObject) => {
        if (gameObject.id === objectId) {
          return { ...gameObject, state: "hammered" as ObjectState };
        }
        return gameObject;
      });

      const newHammeredCount = updatedObjects.filter(
        (gameObject) => gameObject.state === "hammered"
      ).length;
      
      const isGameComplete = newHammeredCount === previousGameState.totalCount;

      // Clear the animation flag after the typical hammer animation duration
      // You can adjust this timing based on your actual animation duration
      setTimeout(() => {
        isHammerAnimating.current = false;
      }, 500);

      return {
        ...previousGameState,
        objects: updatedObjects,
        hammeredCount: newHammeredCount,
        isGameComplete: isGameComplete,
      };
    });
  }, []);

  // Your existing functions remain the same, with cleanup added to reset
  const initializeGame = useCallback((): void => {
    setIsLoading(true);

    try {
      const initialGameObjects = generateInitialObjects();

      setGameState({
        objects: initialGameObjects,
        hammeredCount: 0,
        totalCount: initialGameObjects.length,
        isGameComplete: false,
        gameStartTime: Date.now(),
      });
    } catch (error) {
      console.error('Failed to generate initial objects:', error);
      setGameState({
        objects: [],
        hammeredCount: 0,
        totalCount: 0,
        isGameComplete: false,
        gameStartTime: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [generateInitialObjects]);

  const resetGame = useCallback((): void => {
    // ENHANCED: Clean up any pending operations when resetting
    if (repositionTimeoutRef.current) {
      clearTimeout(repositionTimeoutRef.current);
    }
    
    isHammerAnimating.current = false;
    setIsRepositioning(false);
    
    initializeGame();
  }, [initializeGame]);

  // Your existing utility functions remain unchanged
  const updateObjectState = useCallback(
    (objectId: string, newState: ObjectState): void => {
      setGameState((previousGameState) => {
        const updatedObjects = previousGameState.objects.map((gameObject) => {
          if (gameObject.id === objectId) {
            return { ...gameObject, state: newState };
          }
          return gameObject;
        });

        return {
          ...previousGameState,
          objects: updatedObjects,
        };
      });
    },
    []
  );

  const getObjectById = useCallback(
    (objectId: string): GameObject | undefined => {
      return gameState.objects.find((gameObject) => gameObject.id === objectId);
    },
    [gameState.objects]
  );

  const getObjectsInState = useCallback(
    (targetState: ObjectState): GameObject[] => {
      return gameState.objects.filter((gameObject) => gameObject.state === targetState);
    },
    [gameState.objects]
  );

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Cleanup effect for component unmounting
  useEffect(() => {
    return () => {
      if (repositionTimeoutRef.current) {
        clearTimeout(repositionTimeoutRef.current);
      }
    };
  }, []);

  return {
    gameState,
    isLoading,
    isRepositioning,
    initializeGame,
    updateObjectState,
    hammerObject,
    resetGame,
    getObjectById,
    getObjectsInState,
    repositionObjects,
  };
};

export default useGameState;