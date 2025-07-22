// hooks/useGameState.ts
import { useState, useCallback, useEffect } from "react";
import type { GameObject, GameState, ObjectState } from "types/game";
import { generateUniqueId } from "utils/helpers";
import { getRandomObjectPlacement } from "utils/layout";
import { GAME_CONFIG } from "data/gameConfig";
import { getAllObjectTypes, getObjectDefinition } from "data/objectDefinitions";
import { getResponsiveLayoutConfig, logResponsiveInfo } from "utils/responsiveLayout";

interface UseGameStateReturn {
  gameState: GameState;
  isLoading: boolean;
  initializeGame: () => void;
  updateObjectState: (objectId: string, newState: ObjectState) => void;
  hammerObject: (objectId: string) => void;
  resetGame: () => void;
  getObjectById: (objectId: string) => GameObject | undefined;
  getObjectsInState: (state: ObjectState) => GameObject[];
}

/**
 * Pure utility functions that don't depend on any component state
 * Moving these outside the component prevents them from being recreated on every render
 * Think of these as tools in a workshop - you don't need to forge new tools every time you use them
 */

/**
 * Shuffle an array using the Fisher-Yates algorithm
 * This function is "pure" because it always produces the same type of result
 * given the same type of input, and it doesn't depend on any external state
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const arr = array.slice(); // Create a copy to avoid mutating the original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
  }
  return arr;
};

/**
 * Check if two objects overlap using circle-based collision detection
 * Another pure function - it only cares about the two objects passed to it
 * and doesn't need to know anything about the component's state
 */
const objectsOverlap = (objectA: GameObject, objectB: GameObject): boolean => {
  const deltaX = objectA.position.x - objectB.position.x;
  const deltaY = objectA.position.y - objectB.position.y;
  const centerTocentereDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  return centerTocentereDistance < objectA.radius + objectB.radius;
};

/**
 * Find all overlapping pairs in an array of objects
 * This function is also pure - it just processes the array it receives
 * and returns a result without needing any external context
 */
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

  /**
   * Now that our utility functions are outside the component, 
   * our useCallback hooks can have stable dependencies
   * This is like having a set of reliable tools that don't change between cooking sessions
   */

  /**
   * Resolve any overlaps that might have occurred during initial placement
   * Since findOverlappingPairs is now stable (defined outside), this useCallback
   * won't be recreated unnecessarily, improving performance
   */
  const resolveAnyRemainingOverlaps = useCallback((
    objects: GameObject[], 
    maxPlacementAttempts: number
  ): GameObject[] => {
    let retryAttempts = 0;
    const maxRetryAttempts = 5;
    
    while (retryAttempts < maxRetryAttempts) {
      const overlappingPairs = findOverlappingPairs(objects);
      
      if (overlappingPairs.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Object placement successful with ${objects.length} objects`);
        }
        break;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Retry ${retryAttempts + 1}: Found ${overlappingPairs.length} overlapping pairs`);
      }

      const overlapCounts = new Map<number, number>();
      overlappingPairs.forEach(([indexA, indexB]) => {
        overlapCounts.set(indexA, (overlapCounts.get(indexA) || 0) + 1);
        overlapCounts.set(indexB, (overlapCounts.get(indexB) || 0) + 1);
      });

      let mostProblematicIndex = 0;
      let maxOverlapCount = 0;
      overlapCounts.forEach((count, index) => {
        if (count > maxOverlapCount) {
          maxOverlapCount = count;
          mostProblematicIndex = index;
        }
      });

      const objectToReplace = objects[mostProblematicIndex];
      const otherObjects = objects.filter((_, index) => index !== mostProblematicIndex);
      
      const newPosition = getRandomObjectPlacement(
        otherObjects,
        {
          minDistance: GAME_CONFIG.minObjectDistance,
          margin: GAME_CONFIG.screenMargin,
          maxAttempts: maxPlacementAttempts,
        },
        objectToReplace.radius
      );

      objects[mostProblematicIndex] = {
        ...objectToReplace,
        position: newPosition,
      };

      retryAttempts++;
    }

    if (retryAttempts >= maxRetryAttempts) {
      const remainingOverlaps = findOverlappingPairs(objects);
      if (remainingOverlaps.length > 0) {
        console.warn(`⚠️ Could not resolve all overlaps. ${remainingOverlaps.length} pairs still overlap.`);
      }
    }

    return objects;
  }, []); // Empty dependency array because findOverlappingPairs is now stable

  /**
   * Enhanced object generation with full responsive support
   * Now this useCallback also has stable dependencies since shuffleArray is external
   */
  const generateInitialObjects = useCallback((): GameObject[] => {
    const responsiveConfig = getResponsiveLayoutConfig();
    const objectCount = responsiveConfig.objectCount;
    
    if (process.env.NODE_ENV === 'development') {
      logResponsiveInfo();
      console.log(`🎯 Generating ${objectCount} objects for current device`);
    }
    
    const maxPlacementAttempts = GAME_CONFIG.difficulty.placementAttempts || 100;
    
    // Now we can call shuffleArray without worrying about dependency issues
    const allAvailableObjectTypes = shuffleArray(getAllObjectTypes());
    const selectedObjectTypes = allAvailableObjectTypes.slice(0, objectCount);
    
    const placedObjects: GameObject[] = [];

    for (let i = 0; i < selectedObjectTypes.length; i++) {
      const objectType = selectedObjectTypes[i];
      const objectDefinition = getObjectDefinition(objectType);
      
      if (!objectDefinition) {
        console.warn(`⚠️ Object definition not found for type: ${objectType}`);
        continue;
      }

      const objectRadius = objectDefinition.baseSize / 2;
      const objectSize = objectDefinition.baseSize;

      const objectPosition = getRandomObjectPlacement(
        placedObjects,
        {
          minDistance: GAME_CONFIG.minObjectDistance,
          margin: GAME_CONFIG.screenMargin,
          maxAttempts: maxPlacementAttempts,
        },
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

    const resolvedObjects = resolveAnyRemainingOverlaps(
      placedObjects, 
      maxPlacementAttempts
    );

    return resolvedObjects;
  }, [resolveAnyRemainingOverlaps]); // Only resolveAnyRemainingOverlaps as a dependency

  /**
   * Initialize a new game with responsive object generation
   */
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

      if (process.env.NODE_ENV === 'development') {
        console.log(`🎮 Game initialized with ${initialGameObjects.length} objects`);
      }
    } catch (error) {
      console.error("❌ Failed to initialize game:", error);
      
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

  /**
   * Update a specific object's state (normal → transformed → hammered)
   */
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

  /**
   * Hammer an object - the main game interaction
   */
  const hammerObject = useCallback((objectId: string): void => {
    setGameState((previousGameState) => {
      const targetObject = previousGameState.objects.find(
        (gameObject) => gameObject.id === objectId
      );

      if (!targetObject || targetObject.state === "hammered") {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`⚠️ Cannot hammer object ${objectId}: ${!targetObject ? 'not found' : 'already hammered'}`);
        }
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

      if (process.env.NODE_ENV === 'development' && isGameComplete) {
        const gameTimeSeconds = (Date.now() - previousGameState.gameStartTime) / 1000;
        console.log(`🎉 Game completed in ${gameTimeSeconds.toFixed(1)} seconds!`);
      }

      return {
        ...previousGameState,
        objects: updatedObjects,
        hammeredCount: newHammeredCount,
        isGameComplete: isGameComplete,
      };
    });
  }, []);

  /**
   * Reset the game to initial state
   */
  const resetGame = useCallback((): void => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Resetting game...');
    }
    initializeGame();
  }, [initializeGame]);

  /**
   * Get a specific object by its unique ID
   */
  const getObjectById = useCallback(
    (objectId: string): GameObject | undefined => {
      return gameState.objects.find((gameObject) => gameObject.id === objectId);
    },
    [gameState.objects]
  );

  /**
   * Get all objects that are currently in a specific state
   */
  const getObjectsInState = useCallback(
    (targetState: ObjectState): GameObject[] => {
      return gameState.objects.filter((gameObject) => gameObject.state === targetState);
    },
    [gameState.objects]
  );

  /**
   * Auto-initialize game when the hook first mounts
   */
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return {
    gameState,
    isLoading,
    initializeGame,
    updateObjectState,
    hammerObject,
    resetGame,
    getObjectById,
    getObjectsInState,
  };
};

export default useGameState;