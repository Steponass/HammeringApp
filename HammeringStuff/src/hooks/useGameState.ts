import { useState, useCallback, useEffect } from "react";
import type { GameObject, GameState, ObjectState } from "types/game";
import { generateUniqueId } from "utils/helpers";
import { getRandomObjectPlacement } from "utils/layout";
import { GAME_CONFIG } from "data/gameConfig";
import { getAllObjectTypes, getObjectDefinition } from "data/objectDefinitions";
import { getResponsiveLayoutConfig } from "utils/responsiveLayout";

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

/*
 * Shuffle an array using the Fisher-Yates algorithm
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const arr = array.slice(); // Create a copy to avoid mutating the original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
  }
  return arr;
};

/*
 * Check if two objects overlap using circle-based collision detection
 */
const objectsOverlap = (objectA: GameObject, objectB: GameObject): boolean => {
  const deltaX = objectA.position.x - objectB.position.x;
  const deltaY = objectA.position.y - objectB.position.y;
  const centerTocentereDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  return centerTocentereDistance < objectA.radius + objectB.radius;
};

/*
 * Find all overlapping pairs in an array of objects
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

  /*
   * Resolve any overlaps that might have occurred during initial placement
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
        break;
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

    return objects;
  }, []); // Empty dependency array because findOverlappingPairs is now stable

  /**
   * Enhanced object generation with full responsive support
   * Now this useCallback also has stable dependencies since shuffleArray is external
   */
  const generateInitialObjects = useCallback((): GameObject[] => {
    const responsiveConfig = getResponsiveLayoutConfig();
    const objectCount = responsiveConfig.objectCount;
    
    const maxPlacementAttempts = GAME_CONFIG.difficulty.placementAttempts || 100;
    
    // Now we can call shuffleArray without worrying about dependency issues
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
    } catch {
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