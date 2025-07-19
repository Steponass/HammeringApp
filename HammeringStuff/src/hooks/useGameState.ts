// src/hooks/useGameState.ts
import { useState, useCallback, useEffect } from "react";
import type { GameObject, GameState, ObjectState } from "types/game";
import { generateUniqueId } from "utils/helpers";
import { getRandomObjectPlacement } from "utils/layout";
import { GAME_CONFIG } from "data/gameConfig";
import { getAllObjectTypes, getObjectDefinition } from "data/objectDefinitions";

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
   * Utility: Shuffle an array in place (Fisher-Yates)
   */
  function shuffleArray<T>(array: T[]): T[] {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Utility: Check if two objects overlap (circle-based)
   */
  function objectsOverlap(a: GameObject, b: GameObject): boolean {
    const dx = a.position.x - b.position.x;
    const dy = a.position.y - b.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < a.radius + b.radius;
  }

  /**
   * Utility: Check for any overlaps in an array of objects
   */
  function findOverlappingPairs(objects: GameObject[]): [number, number][] {
    const overlaps: [number, number][] = [];
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        if (objectsOverlap(objects[i], objects[j])) {
          overlaps.push([i, j]);
        }
      }
    }
    return overlaps;
  }

  /**
   * Generate initial game objects with random placement
   * Creates objects based on game configuration
   * Ensures uniqueness and minimal overlap
   */
  const generateInitialObjects = useCallback((): GameObject[] => {
    const objectCount = GAME_CONFIG.defaultObjectCount;
    const maxPlacementAttempts =
      GAME_CONFIG.difficulty.placementAttempts || 100;
    // Guarantee uniqueness: shuffle and pick first N
    const allObjectTypes = shuffleArray(getAllObjectTypes());
    const selectedTypes = allObjectTypes.slice(0, objectCount);
    const objects: GameObject[] = [];

    for (let i = 0; i < selectedTypes.length; i++) {
      const objectType = selectedTypes[i];
      const objectDefinition = getObjectDefinition(objectType);
      if (!objectDefinition) continue;
      // Use config for maxAttempts
      const position = getRandomObjectPlacement(objects, {
        minDistance: GAME_CONFIG.minObjectDistance,
        margin: GAME_CONFIG.screenMargin,
        maxAttempts: maxPlacementAttempts,
      });
      const newObject: GameObject = {
        id: generateUniqueId(),
        position,
        objectType,
        nailType: objectDefinition.nailType,
        state: "normal",
        radius: objectDefinition.baseSize / 2,
        size: objectDefinition.baseSize,
      };
      objects.push(newObject);
    }

    // Post-placement: check for overlaps and re-place if needed
    let retries = 0;
    const maxRetries = 10;
    while (retries < maxRetries) {
      const overlaps = findOverlappingPairs(objects);
      if (overlaps.length === 0) break;
      // For each overlap, re-place the second object
      for (const [, j] of overlaps) {
        const objToReplace = objects[j];
        const others = objects.filter((_, idx) => idx !== j);
        const newPos = getRandomObjectPlacement(others, {
          minDistance: GAME_CONFIG.minObjectDistance,
          margin: GAME_CONFIG.screenMargin,
          maxAttempts: maxPlacementAttempts,
        });
        objects[j] = {
          ...objToReplace,
          position: newPos,
        };
      }
      retries++;
    }

    return objects;
  }, []);

  /**
   * Initialize a new game
   * Generates objects and sets up initial game state
   */
  const initializeGame = useCallback((): void => {
    setIsLoading(true);

    try {
      const initialObjects = generateInitialObjects();

      setGameState({
        objects: initialObjects,
        hammeredCount: 0,
        totalCount: initialObjects.length,
        isGameComplete: false,
        gameStartTime: Date.now(),
      });
    } catch (error) {
      console.error("Failed to initialize game:", error);
      // Fallback to empty game state
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
   * Update a specific object's state
   * Used for transformations and state changes
   */
  const updateObjectState = useCallback(
    (objectId: string, newState: ObjectState): void => {
      setGameState((prevState) => {
        const updatedObjects = prevState.objects.map((obj) => {
          if (obj.id === objectId) {
            return { ...obj, state: newState };
          }
          return obj;
        });

        return {
          ...prevState,
          objects: updatedObjects,
        };
      });
    },
    []
  );

  /**
   * Hammer an object - transforms it to a nail
   * This is the main game interaction
   */
  const hammerObject = useCallback((objectId: string): void => {
    setGameState((prevState) => {
      // Find the object being hammered
      const targetObject = prevState.objects.find((obj) => obj.id === objectId);

      if (!targetObject || targetObject.state === "hammered") {
        // Object not found or already hammered
        return prevState;
      }

      // Update the object to hammered state
      const updatedObjects = prevState.objects.map((obj) => {
        if (obj.id === objectId) {
          return { ...obj, state: "hammered" as ObjectState };
        }
        return obj;
      });

      // Calculate new hammered count
      const newHammeredCount = updatedObjects.filter(
        (obj) => obj.state === "hammered"
      ).length;
      const isComplete = newHammeredCount === prevState.totalCount;

      return {
        ...prevState,
        objects: updatedObjects,
        hammeredCount: newHammeredCount,
        isGameComplete: isComplete,
      };
    });
  }, []);

  /**
   * Reset the game to initial state
   * Generates new objects and resets all counters
   */
  const resetGame = useCallback((): void => {
    initializeGame();
  }, [initializeGame]);

  /**
   * Get a specific object by ID
   * Utility function for finding objects
   */
  const getObjectById = useCallback(
    (objectId: string): GameObject | undefined => {
      return gameState.objects.find((obj) => obj.id === objectId);
    },
    [gameState.objects]
  );

  /**
   * Get all objects in a specific state
   * Useful for filtering objects by their current state
   */
  const getObjectsInState = useCallback(
    (state: ObjectState): GameObject[] => {
      return gameState.objects.filter((obj) => obj.state === state);
    },
    [gameState.objects]
  );

  /**
   * Initialize game when hook first runs
   */
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  /**
   * Log game completion for debugging
   */


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
