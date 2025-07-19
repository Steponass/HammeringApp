interface GameConfiguration {
  defaultObjectCount: number;
  minObjectDistance: number;
  screenMargin: number;
  
  shadowConfig: {
    radius: number;
    opacity: number;
    blurAmount: number;
  };
  
  animation: {
    hammerSwingDuration: number;
    transformDuration: number;
    easingFunction: string;
  };
  
  difficulty: {
    objectSizeVariation: number;
    placementAttempts: number;
    minimumGameObjects: number;
  };
  
  responsive: {
    mobileBreakpoint: number;
    scaleFactors: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
  };
}

export const GAME_CONFIG: GameConfiguration = {
  defaultObjectCount: 35,
  minObjectDistance: 80,
  screenMargin: 40,
  
  shadowConfig: {
    radius: 45,
    opacity: 0.7,
    blurAmount: 2
  },
  
  animation: {
    hammerSwingDuration: 500,
    transformDuration: 200,
    easingFunction: 'ease-out'
  },
  
  difficulty: {
    objectSizeVariation: 0.3,
    placementAttempts: 100,
    minimumGameObjects: 20
  },
  
  responsive: {
    mobileBreakpoint: 768,
    scaleFactors: {
      mobile: 0.8,
      tablet: 0.9,
      desktop: 1.0
    }
  }
};