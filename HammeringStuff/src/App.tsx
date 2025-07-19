import React from "react";
import Header from "components/layout/Header";
import TestGame from "games/TestGame";
import "./App.css";

const App: React.FC = () => {
  return (
    <div className="App">
      <Header />
      <TestGame />
    </div>
  );
};

export default App;
