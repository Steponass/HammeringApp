// src/hooks/useGameState.ts
import { useState, useCallback, useEffect } from 'react';
import type { GameObject, GameState, ObjectState } from 'types/game';
import { generateUniqueId } from 'utils/helpers';
import { getRandomObjectPlacement } from 'utils/layout';
import { GAME_CONFIG } from 'data/gameConfig';

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
    gameStartTime: 0
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Generate initial game objects with random placement
   * Creates objects based on game configuration
   */
  const generateInitialObjects = useCallback((): GameObject[] => {
    const objects: GameObject[] = [];
    const objectCount = GAME_CONFIG.defaultObjectCount;

    for (let i = 0; i < objectCount; i++) {
      // Get random object type from available definitions
      const objectTypes = Object.keys(GAME_CONFIG.availableObjects);
      const randomObjectType = objectTypes[Math.floor(Math.random() * objectTypes.length)];
      const objectDefinition = GAME_CONFIG.availableObjects[randomObjectType];

      // Generate position that doesn't overlap with existing objects
      const position = getRandomObjectPlacement(objects, {
        minDistance: GAME_CONFIG.minObjectDistance,
        margin: GAME_CONFIG.screenMargin,
        maxAttempts: 50
      });

      const newObject: GameObject = {
        id: generateUniqueId(),
        position,
        objectType: randomObjectType,
        nailType: objectDefinition.nailType,
        state: 'normal',
        radius: objectDefinition.baseSize / 2,
        size: objectDefinition.baseSize
      };

      objects.push(newObject);
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
        gameStartTime: Date.now()
      });
    } catch (error) {
      console.error('Failed to initialize game:', error);
      // Fallback to empty game state
      setGameState({
        objects: [],
        hammeredCount: 0,
        totalCount: 0,
        isGameComplete: false,
        gameStartTime: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  }, [generateInitialObjects]);

  /**
   * Update a specific object's state
   * Used for transformations and state changes
   */
  const updateObjectState = useCallback((objectId: string, newState: ObjectState): void => {
    setGameState(prevState => {
      const updatedObjects = prevState.objects.map(obj => {
        if (obj.id === objectId) {
          return { ...obj, state: newState };
        }
        return obj;
      });

      return {
        ...prevState,
        objects: updatedObjects
      };
    });
  }, []);

  /**
   * Hammer an object - transforms it to a nail
   * This is the main game interaction
   */
  const hammerObject = useCallback((objectId: string): void => {
    setGameState(prevState => {
      // Find the object being hammered
      const targetObject = prevState.objects.find(obj => obj.id === objectId);
      
      if (!targetObject || targetObject.state === 'hammered') {
        // Object not found or already hammered
        return prevState;
      }

      // Update the object to hammered state
      const updatedObjects = prevState.objects.map(obj => {
        if (obj.id === objectId) {
          return { ...obj, state: 'hammered' as ObjectState };
        }
        return obj;
      });

      // Calculate new hammered count
      const newHammeredCount = updatedObjects.filter(obj => obj.state === 'hammered').length;
      const isComplete = newHammeredCount === prevState.totalCount;

      return {
        ...prevState,
        objects: updatedObjects,
        hammeredCount: newHammeredCount,
        isGameComplete: isComplete
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
  const getObjectById = useCallback((objectId: string): GameObject | undefined => {
    return gameState.objects.find(obj => obj.id === objectId);
  }, [gameState.objects]);

  /**
   * Get all objects in a specific state
   * Useful for filtering objects by their current state
   */
  const getObjectsInState = useCallback((state: ObjectState): GameObject[] => {
    return gameState.objects.filter(obj => obj.state === state);
  }, [gameState.objects]);

  /**
   * Initialize game when hook first runs
   */
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  /**
   * Log game completion for debugging
   */
  useEffect(() => {
    if (gameState.isGameComplete && gameState.totalCount > 0) {
      const timeElapsed = Date.now() - gameState.gameStartTime;
      console.log(`Game completed in ${timeElapsed}ms with ${gameState.hammeredCount} objects hammered`);
    }
  }, [gameState.isGameComplete, gameState.hammeredCount, gameState.totalCount, gameState.gameStartTime]);

  return {
    gameState,
    isLoading,
    initializeGame,
    updateObjectState,
    hammerObject,
    resetGame,
    getObjectById,
    getObjectsInState
  };
};

export default useGameState;