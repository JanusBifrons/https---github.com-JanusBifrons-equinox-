import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { ShipPart, ShipComponents, ShipColor, PartType } from '../game/ShipParts';

interface PartTestDisplayProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export const PartTestDisplay: React.FC<PartTestDisplayProps> = ({ isOpen = true, onClose }) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const [selectedColor, setSelectedColor] = useState<ShipColor>('blue');
    const [renderingMode, setRenderingMode] = useState<'detailed' | 'legacy'>('detailed');

    useEffect(() => {
        if (!isOpen || !canvasRef.current) return;

        // Create PIXI application
        const app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: 0x1a1a2e,
            antialias: true
        });

        canvasRef.current.appendChild(app.view as HTMLCanvasElement);
        appRef.current = app;

        createPartDisplay(app);

        return () => {
            if (appRef.current) {
                appRef.current.destroy(true);
                appRef.current = null;
            }
        };
    }, [isOpen, selectedColor, renderingMode]);

    const createPartDisplay = (app: PIXI.Application) => {
        app.stage.removeChildren();

        // Create title
        const title = new PIXI.Text('Individual Ship Parts Display', {
            fontFamily: 'Press Start 2P',
            fontSize: 16,
            fill: 0x00ffff
        });
        title.position.set(20, 20);
        app.stage.addChild(title);

        // Create subtitle
        const subtitle = new PIXI.Text(`Color: ${selectedColor} | Mode: ${renderingMode}`, {
            fontFamily: 'Press Start 2P',
            fontSize: 10,
            fill: 0xffffff
        });
        subtitle.position.set(20, 50);
        app.stage.addChild(subtitle);

        // Define all parts to display
        const partsToShow = [
            { name: 'Compact Ship', component: ShipComponents.compactShip(selectedColor) },
            { name: 'Assault Ship', component: ShipComponents.assaultShip(selectedColor) },
            { name: 'Capital Ship', component: ShipComponents.capitalShip(selectedColor) },
            { name: 'Standard Wings', component: ShipComponents.standardWings(selectedColor) },
            { name: 'Assault Wings', component: ShipComponents.assaultWings(selectedColor) },
            { name: 'Dual Engine', component: ShipComponents.dualEngine(selectedColor) },
            { name: 'Quad Engine', component: ShipComponents.quadEngine(selectedColor) },
            { name: 'Side Cannons', component: ShipComponents.sideCannons(selectedColor) },
            { name: 'Vector Thrusters', component: ShipComponents.vectorThrusters(selectedColor) },
            { name: 'Razor Interceptor', component: ShipComponents.razorInterceptor(selectedColor) },
            { name: 'Strike Interceptor', component: ShipComponents.strikeInterceptor(selectedColor) },
            { name: 'Phantom Interceptor', component: ShipComponents.phantomInterceptor(selectedColor) },
            { name: 'Interceptor Wings', component: ShipComponents.interceptorWings(selectedColor) },
            { name: 'Interceptor Engine', component: ShipComponents.interceptorEngine(selectedColor) }
        ];

        // Layout parts in a grid
        const cols = 4;
        const spacing = 180;
        const startX = 100;
        const startY = 100;

        partsToShow.forEach((partData, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * spacing;
            const y = startY + row * spacing;

            // Create part instance
            const part = new ShipPart(partData.component, renderingMode === 'detailed');

            // Create test display for this part
            const testDisplay = part.createTestDisplay();
            testDisplay.position.set(x, y);

            // Add part name label
            const nameLabel = new PIXI.Text(partData.name, {
                fontFamily: 'Press Start 2P',
                fontSize: 6,
                fill: 0xcccccc
            });
            nameLabel.anchor.set(0.5, 1);
            nameLabel.position.set(0, -20);
            testDisplay.addChild(nameLabel);

            // Add vertex count info
            const vertexInfo = new PIXI.Text(`${partData.component.vertices.length} vertices`, {
                fontFamily: 'Press Start 2P',
                fontSize: 5,
                fill: 0x888888
            });
            vertexInfo.anchor.set(0.5, 0);
            vertexInfo.position.set(0, 55);
            testDisplay.addChild(vertexInfo);

            app.stage.addChild(testDisplay);
        });

        // Add instructions
        const instructions = new PIXI.Text(
            'Each part shows:\n• Detailed rendering with metallic panels\n• Bounding box (green)\n• Part type and vertex count\n• Squadron color support',
            {
                fontFamily: 'Press Start 2P',
                fontSize: 8,
                fill: 0xffffff,
                lineHeight: 12
            }
        );
        instructions.position.set(20, app.screen.height - 100);
        app.stage.addChild(instructions);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg p-6 max-w-6xl max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-cyan-400">Ship Parts Test Display</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="flex gap-4 mb-4">
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Squadron Color:</label>
                        <select
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value as ShipColor)}
                            className="bg-gray-800 text-white rounded px-3 py-1"
                        >
                            <option value="red">Red Squadron</option>
                            <option value="blue">Blue Squadron</option>
                            <option value="green">Green Squadron</option>
                            <option value="orange">Orange Squadron</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Rendering Mode:</label>
                        <select
                            value={renderingMode}
                            onChange={(e) => setRenderingMode(e.target.value as 'detailed' | 'legacy')}
                            className="bg-gray-800 text-white rounded px-3 py-1"
                        >
                            <option value="detailed">Detailed Sprites</option>
                            <option value="legacy">Legacy Graphics</option>
                        </select>
                    </div>
                </div>

                <div ref={canvasRef} className="border border-gray-600 rounded" />
                <div className="mt-4 text-sm text-gray-400">
                    <p>This display shows all individual ship parts with their enhanced sprite-like rendering.</p>
                    <p>Green boxes show collision boundaries. Labels indicate part types and complexity.</p>
                </div>
            </div>
        </div>
    );
};

export default PartTestDisplay;
