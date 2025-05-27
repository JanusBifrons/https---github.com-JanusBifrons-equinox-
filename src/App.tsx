import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { Engine } from './game/Engine';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initGame = async () => {
      if (!containerRef.current || engineRef.current) return;

      const engine = new Engine();
      engineRef.current = engine;

      await engine.initialize();
      containerRef.current.appendChild(engine.getView());
      setIsInitialized(true);

      const handleResize = () => engine.resize();
      window.addEventListener('resize', handleResize);
      handleResize();

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    initGame();
  }, []);

  return (
    <div className="App">
      <div ref={containerRef} className="game-container">
        {!isInitialized && <div>Loading...</div>}
      </div>
    </div>
  );
}

export default App;
