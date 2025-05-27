import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { Engine } from './game/Engine';
import WelcomeScreen from './components/WelcomeScreen';
import type { GameMode } from './game/Engine';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  useEffect(() => {
    if (!selectedMode) return;

    const initGame = async () => {
      if (!containerRef.current || engineRef.current) return;

      const engine = new Engine(selectedMode);
      engineRef.current = engine;

      await engine.initialize();
      containerRef.current.appendChild(engine.getView());
      setIsInitialized(true);
      setGameStarted(true);

      const handleResize = () => engine.resize();
      window.addEventListener('resize', handleResize);
      handleResize();

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    initGame();
  }, [selectedMode]);

  const handleStartGame = (mode: GameMode) => {
    setSelectedMode(mode);
    setGameStarted(true);
  };

  return (
    <div className="App">
      {!gameStarted ? (
        <WelcomeScreen onStartGame={handleStartGame} />
      ) : (
        <div ref={containerRef} className="game-container">
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isInitialized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="font-['Press_Start_2P'] text-[#00ff00] animate-pulse">
              Loading...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
