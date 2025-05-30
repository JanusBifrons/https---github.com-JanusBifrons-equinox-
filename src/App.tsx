import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { Engine } from './game/Engine';
import WelcomeScreen from './components/WelcomeScreen';
import ShipConfigPanel, { ShipConfig } from './components/ShipConfigPanel';
import PartTestDisplay from './components/PartTestDisplay';
import GameUI from './components/GameUI';
import OptionsMenu from './components/OptionsMenu';
// import Minimap from './components/Minimap'; // Temporarily disabled
import type { GameMode } from './game/Engine';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [showPartDisplay, setShowPartDisplay] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [shipConfig, setShipConfig] = useState<ShipConfig>({
    type: 'compact',
    color: 'blue'
  });

  useEffect(() => {
    if (!selectedMode) return;

    const initGame = async () => {
      if (!containerRef.current || engineRef.current) return;

      const engine = new Engine(selectedMode, () => setShowPartDisplay(true), handleReturnToMenu);
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

  const handleReturnToMenu = () => {
    // Clean up the engine
    if (engineRef.current) {
      engineRef.current = null;
    }
    setIsInitialized(false);
    setGameStarted(false);
    setSelectedMode(null);
    setShowPartDisplay(false);
    setShowOptionsMenu(false);
  };

  const handleConfigChange = (newConfig: ShipConfig) => {
    setShipConfig(newConfig);
    if (engineRef.current) {
      engineRef.current.updateShipConfig(newConfig);
    }
  };

  return (
    <div className="App">
      {!gameStarted ? (
        <WelcomeScreen onStartGame={handleStartGame} />
      ) : showPartDisplay ? (
        <div className="relative">
          <button
            onClick={() => setShowPartDisplay(false)}
            className="absolute top-4 left-4 z-50 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-['Press_Start_2P'] text-sm transition-colors"
          >
            ← Back to Game
          </button>
          <PartTestDisplay />
        </div>
      ) : (
        <div ref={containerRef} className="game-container">
          {selectedMode === 'test' && isInitialized && (
            <>
              <ShipConfigPanel
                onConfigChange={handleConfigChange}
                currentConfig={shipConfig}
              />
              <button
                onClick={() => setShowPartDisplay(true)}
                className="absolute top-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-['Press_Start_2P'] text-sm transition-colors"
              >
                View Parts
              </button>
            </>
          )}

          {/* Game UI overlay */}
          {isInitialized && (
            <>
              <GameUI
                player={engineRef.current?.getPlayer() || null}
                onReturnToMenu={handleReturnToMenu}
                onShowOptions={() => setShowOptionsMenu(true)}
              />
              {/* Minimap temporarily disabled - return to this later
              <Minimap
                engine={engineRef.current}
                gameMode={selectedMode || 'classic'}
              />
              */}
            </>
          )}

          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isInitialized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="font-['Press_Start_2P'] text-[#00ff00] animate-pulse">
              Loading...
            </div>
          </div>
        </div>
      )}

      {/* Options Menu */}
      <OptionsMenu
        open={showOptionsMenu}
        onClose={() => setShowOptionsMenu(false)}
      />
    </div>
  );
}

export default App;
