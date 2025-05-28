import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    IconButton,
    Paper,
    Typography,
    Tooltip
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import * as PIXI from 'pixi.js';
import { Engine } from '../game/Engine';

interface MinimapProps {
    engine: Engine | null;
    gameMode: string;
}

const Minimap: React.FC<MinimapProps> = ({ engine, gameMode }) => {
    const minimapRef = useRef<HTMLDivElement>(null);
    const pixiAppRef = useRef<PIXI.Application | null>(null);
    const [minimapZoom, setMinimapZoom] = useState(1.0);
    const [minimapData, setMinimapData] = useState<{
        player: { x: number; y: number; angle: number } | null;
        objects: Array<{ x: number; y: number; color: number; isDestroyed?: boolean }>;
        bounds: { width: number; height: number };
    }>({
        player: null,
        objects: [],
        bounds: { width: 0, height: 0 }
    });

    const minimapSize = gameMode === 'test' ? 180 : 150;
    const minZoom = 0.5;
    const maxZoom = 3.0; useEffect(() => {
        if (!minimapRef.current || pixiAppRef.current) return;

        // Create PIXI application for minimap
        const initPixiApp = async () => {
            const app = new PIXI.Application();

            await app.init({
                width: minimapSize,
                height: minimapSize,
                backgroundColor: 0x000000,
                backgroundAlpha: 0.8,
            });

            pixiAppRef.current = app;
            if (minimapRef.current) {
                minimapRef.current.appendChild(app.canvas);
            }
        };

        initPixiApp().catch(console.error);

        return () => {
            if (pixiAppRef.current) {
                pixiAppRef.current.destroy();
                pixiAppRef.current = null;
            }
        };
    }, [minimapSize]); useEffect(() => {
        if (!engine || !pixiAppRef.current) return; const updateMinimap = () => {
            const app = pixiAppRef.current;
            if (!app || !app.canvas) return;

            try {
                // Clear previous frame
                app.stage.removeChildren();

                // Create border with glow effect
                const border = new PIXI.Graphics();
                border.lineStyle(2, 0x00ffff, 0.9);
                border.drawRect(1, 1, minimapSize - 2, minimapSize - 2);

                // Add inner glow
                const innerGlow = new PIXI.Graphics();
                innerGlow.lineStyle(1, 0x00ffff, 0.3);
                innerGlow.drawRect(3, 3, minimapSize - 6, minimapSize - 6);

                app.stage.addChild(innerGlow);
                app.stage.addChild(border);

                // Get world data from engine
                if (!engine) return;
                const minimapData = engine.getMinimapData();
                if (!minimapData) return;

                // Calculate scaling
                const worldSize = Math.max(minimapData.bounds.width, minimapData.bounds.height);
                const scale = (minimapSize - 20) / (worldSize / minimapZoom);
                const centerX = minimapSize / 2;
                const centerY = minimapSize / 2;

                // Draw grid
                const grid = new PIXI.Graphics();
                grid.lineStyle(1, 0x333333, 0.3);
                const gridSpacing = 50 * scale;
                if (gridSpacing > 5) { // Only draw grid if spacing is reasonable
                    for (let x = gridSpacing; x < minimapSize; x += gridSpacing) {
                        grid.moveTo(x, 0);
                        grid.lineTo(x, minimapSize);
                    }
                    for (let y = gridSpacing; y < minimapSize; y += gridSpacing) {
                        grid.moveTo(0, y);
                        grid.lineTo(minimapSize, y);
                    }
                    app.stage.addChild(grid);
                }

                // Calculate camera offset for centering
                let offsetX = 0;
                let offsetY = 0;
                if (minimapData.player) {
                    offsetX = centerX - minimapData.player.x * scale;
                    offsetY = centerY - minimapData.player.y * scale;
                }            // Draw other objects
                minimapData.objects.forEach((obj: { x: number; y: number; color: number; isDestroyed?: boolean }) => {
                    const objDot = new PIXI.Graphics();
                    const color = obj.isDestroyed ? 0xff0000 : (obj.color || 0x888888);
                    const alpha = obj.isDestroyed ? 0.8 : 0.6;
                    const size = obj.isDestroyed ? 1.5 : 2.5;

                    objDot.beginFill(color, alpha);
                    objDot.drawCircle(0, 0, size);
                    objDot.endFill();

                    // Add subtle glow for better visibility
                    if (!obj.isDestroyed) {
                        objDot.lineStyle(1, color, 0.3);
                        objDot.drawCircle(0, 0, size + 1);
                    }

                    objDot.position.set(
                        obj.x * scale + offsetX,
                        obj.y * scale + offsetY
                    );
                    app.stage.addChild(objDot);
                });// Draw player (on top)
                if (minimapData.player && !minimapData.player.isDestroyed) {
                    // Player glow effect
                    const playerGlow = new PIXI.Graphics();
                    playerGlow.beginFill(0x00ffff, 0.3);
                    playerGlow.drawCircle(0, 0, 8);
                    playerGlow.endFill();
                    playerGlow.position.set(centerX, centerY);
                    app.stage.addChild(playerGlow);

                    // Main player shape
                    const playerDot = new PIXI.Graphics();
                    playerDot.beginFill(0x00ffff);
                    playerDot.drawPolygon([
                        0, -5,  // tip
                        -3, 4,  // left bottom
                        0, 2,   // center bottom
                        3, 4    // right bottom
                    ]);
                    playerDot.endFill();

                    // Add outline
                    playerDot.lineStyle(1, 0xffffff, 0.8);
                    playerDot.drawPolygon([
                        0, -5,  // tip
                        -3, 4,  // left bottom
                        0, 2,   // center bottom
                        3, 4    // right bottom
                    ]);

                    playerDot.position.set(centerX, centerY);
                    playerDot.rotation = minimapData.player.angle;
                    app.stage.addChild(playerDot);

                    // Draw velocity indicator
                    const velocity = minimapData.player.velocity;
                    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
                    if (speed > 0.1) {
                        const velocityLine = new PIXI.Graphics();
                        velocityLine.lineStyle(3, 0x00ff00, 0.8);
                        velocityLine.moveTo(centerX, centerY);
                        const velocityLength = Math.min(speed * scale * 15, 25);
                        const velocityAngle = Math.atan2(velocity.y, velocity.x);
                        velocityLine.lineTo(
                            centerX + Math.cos(velocityAngle) * velocityLength,
                            centerY + Math.sin(velocityAngle) * velocityLength
                        );
                        app.stage.addChild(velocityLine);
                    }
                }            // Draw destroyed parts indicator if player is destroyed
                if (minimapData.player?.isDestroyed) {
                    const destroyedPartsIndicator = new PIXI.Graphics();
                    destroyedPartsIndicator.beginFill(0xff0000, 0.6);
                    destroyedPartsIndicator.drawCircle(centerX, centerY, 8);
                    destroyedPartsIndicator.endFill();
                    app.stage.addChild(destroyedPartsIndicator);
                }
            } catch (error) {
                console.warn('Minimap rendering error:', error);
            }
        };

        // Update minimap on each frame
        const ticker = new PIXI.Ticker();
        ticker.add(updateMinimap);
        ticker.start();

        return () => {
            ticker.destroy();
        };
    }, [engine, minimapZoom, minimapSize]);

    const handleZoomIn = () => {
        setMinimapZoom(prev => Math.min(maxZoom, prev + 0.2));
    };

    const handleZoomOut = () => {
        setMinimapZoom(prev => Math.max(minZoom, prev - 0.2));
    };

    if (!engine) return null;

    return (<Paper
        sx={{
            position: 'fixed',
            top: gameMode === 'test' ? 'auto' : 20,
            bottom: gameMode === 'test' ? 20 : 'auto',
            left: gameMode === 'test' ? 20 : 'auto',
            right: gameMode === 'test' ? 'auto' : 20,
            width: minimapSize + 40,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '2px solid rgba(0, 255, 255, 0.8)',
            borderRadius: '8px',
            overflow: 'hidden',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            '&:hover': {
                borderColor: 'rgba(0, 255, 255, 1)',
                boxShadow: '0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.15)',
            },
        }}
    >
        {/* Header */}
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                borderBottom: '1px solid rgba(0, 255, 255, 0.3)',
            }}
        >                <Typography
            variant="caption"
            sx={{
                fontFamily: 'Press Start 2P',
                fontSize: '8px',
                color: '#00ffff',
                textTransform: 'uppercase',
                textShadow: '0 0 4px rgba(0, 255, 255, 0.5)',
            }}
        >
                {gameMode === 'test' ? 'Navigation' : 'Minimap'}
            </Typography>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Zoom Out" arrow>
                    <IconButton
                        size="small"
                        onClick={handleZoomOut}
                        disabled={minimapZoom <= minZoom}
                        sx={{
                            color: '#00ffff',
                            width: 20,
                            height: 20,
                            '&:hover': {
                                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                            },
                            '&:disabled': {
                                color: 'rgba(0, 255, 255, 0.3)',
                            },
                        }}
                    >
                        <ZoomOutIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Zoom In" arrow>
                    <IconButton
                        size="small"
                        onClick={handleZoomIn}
                        disabled={minimapZoom >= maxZoom}
                        sx={{
                            color: '#00ffff',
                            width: 20,
                            height: 20,
                            '&:hover': {
                                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                            },
                            '&:disabled': {
                                color: 'rgba(0, 255, 255, 0.3)',
                            },
                        }}
                    >
                        <ZoomInIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>            {/* Minimap Canvas */}
        <Box
            ref={minimapRef}
            sx={{
                position: 'relative',
                width: minimapSize,
                height: minimapSize,
                margin: '10px auto',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid rgba(0, 255, 255, 0.4)',
                boxShadow: 'inset 0 0 10px rgba(0, 255, 255, 0.2)',
            }}
        />

        {/* Zoom indicator */}
        <Box
            sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                borderRadius: '4px',
                px: 1,
                py: 0.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    borderColor: 'rgba(0, 255, 255, 0.6)',
                },
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    fontFamily: 'Press Start 2P',
                    fontSize: '6px',
                    color: '#00ffff',
                    textShadow: '0 0 2px rgba(0, 255, 255, 0.8)',
                }}
            >
                {minimapZoom.toFixed(1)}x
            </Typography>
        </Box>
    </Paper>
    );
};

export default Minimap;
