import React, {useState} from "react";
import SplashScreen from "components/SplashScreen";
import Header from "components/layout/Header";
import TestGame from "games/TestGame";
import "./styles/css-reset.css";
import "./styles/variables.css";
import "./styles/fonts.css";
import "./styles/globals.css";

interface AppState {
  showSplash: boolean;
}



const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    showSplash: true,
  });

  const handleStartGame = (): void => {
    setAppState({ showSplash: false });
  };

  if (appState.showSplash) {
    return <SplashScreen onStartGame={handleStartGame} />;
  }

  return (
    <div className="App">
      <Header />
      <TestGame />
    </div>
  );
};

export default App;
