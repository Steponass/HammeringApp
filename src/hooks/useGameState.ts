import { useState, useCallback, useEffect, useRef } from "react";
import type {
  GameObject,
  GameState,
  ObjectState,
  PlacementConfig,
} from "types/game";
import { generateUniqueId } from "utils/helpers";
import { getRandomObjectPlacement } from "utils/layout";
import { GAME_CONFIG } from "data/gameConfig";
import { getAllObjectTypes, getObjectDefinition } from "data/objectDefinitions";
import { getResponsiveLayoutConfig } from "utils/responsiveLayout";
import { repositionExistingObjects } from "utils/repositioning";
import type { ResponsiveLayoutConfig } from "utils/responsiveLayout";

interface UseGameStateReturn {
  gameState: GameState;
  isLoading: boolean;
  isRepositioning: boolean;
  initializeGame: () => void;
  updateObjectState: (objectId: string, newState: ObjectState) => void;
  hammerObject: (objectId: string) => void;
  resetGame: () => void;
  getObjectById: (objectId: string) => GameObject | undefined;
  getObjectsInState: (state: ObjectState) => GameObject[];
  repositionObjects: (
    oldConfig: ResponsiveLayoutConfig,
    newConfig: ResponsiveLayoutConfig
  ) => void;
}

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

  const [isRepositioning, setIsRepositioning] = useState<boolean>(false);

  const repositionTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const resolveAnyRemainingOverlaps = useCallback(
    (objects: GameObject[], maxAttempts: number): GameObject[] => {
      let retryAttempts = 0;
      const workingObjects = [...objects];

      while (retryAttempts < maxAttempts) {
        const overlappingPairs = findOverlappingPairs(workingObjects);

        if (overlappingPairs.length === 0) {
          break;
        }

        for (const [, secondIndex] of overlappingPairs) {
          const objectToReplace = workingObjects[secondIndex];
          const otherObjects = workingObjects.filter(
            (_, idx) => idx !== secondIndex
          );

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
    },
    []
  );

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

  const repositionObjects = useCallback(
    (
      oldConfig: ResponsiveLayoutConfig,
      newConfig: ResponsiveLayoutConfig
    ): void => {
      setIsRepositioning(true);

      setGameState((previousGameState) => {
        if (previousGameState.objects.length === 0) {
          setIsRepositioning(false);
          return previousGameState;
        }

        // Hybrid repositioning srategy
        const repositionedObjects = repositionExistingObjects(
          previousGameState.objects,
          oldConfig,
          newConfig,
          {
            strategy: "hybrid",
            transitionDuration: 300,
            performanceMode: "smooth",
          }
        );
        // Clear the repositioning flag after transitions complete
        setTimeout(() => {
          setIsRepositioning(false);
        }, 350);

        return {
          ...previousGameState,
          objects: repositionedObjects,
        };
      });
    },
    []
  );

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
      console.error("Failed to generate initial objects:", error);
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
    // Clean up any pending operations when resetting
    if (repositionTimeoutRef.current) {
      clearTimeout(repositionTimeoutRef.current);
    }

    setIsRepositioning(false);

    initializeGame();
  }, [initializeGame]);

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
      return gameState.objects.filter(
        (gameObject) => gameObject.state === targetState
      );
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
