import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import * as PIXI from 'pixi.js';
import type { GameMode } from '../game/Engine';

interface MinimapProps {
    engine: any;
    gameMode: GameMode;
}

const Minimap: React.FC<MinimapProps> = ({ engine, gameMode }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    console.log('Minimap component rendered with engine:', !!engine, 'gameMode:', gameMode);

    // Initialize PIXI Application
    useEffect(() => {
        if (!containerRef.current) return;

        const initPixi = async () => {
            try {
                console.log('Initializing minimap PIXI app'); const app = new PIXI.Application();
                await app.init({
                    width: 150,
                    height: 150,
                    backgroundColor: 0x001122,
                    backgroundAlpha: 0.8,
                    antialias: true,
                    hello: false // Disable PIXI message in console
                });
                appRef.current = app;
                if (containerRef.current) {
                    containerRef.current.innerHTML = '';
                    containerRef.current.appendChild(app.canvas);
                    console.log('Minimap canvas added to DOM');
                } else {
                    console.error('containerRef.current is null');
                }

                console.log('Minimap PIXI app initialized successfully');

            } catch (error) {
                console.error('Minimap PIXI initialization failed:', error);
                // Fallback: show a simple colored div
                if (containerRef.current) {
                    containerRef.current.innerHTML = '<div style="width: 100%; height: 100%; background: #001122; border: 1px solid #00ffff;"></div>';
                }
            }
        };

        initPixi();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (appRef.current) {
                appRef.current.destroy(true);
                appRef.current = null;
            }
        };
    }, []);

    // Update minimap content
    useEffect(() => {
        console.log('Minimap update effect triggered, engine:', !!engine, 'appRef.current:', !!appRef.current);
        if (!engine || !appRef.current) {
            console.warn('Minimap update skipped: missing engine or app');
            return;
        }

        // Check if engine has getMinimapData method
        if (typeof engine.getMinimapData !== 'function') {
            console.warn('Engine does not have getMinimapData method'); return;
        }

        const updateMinimap = () => {
            const app = appRef.current;
            if (!app || !engine) {
                console.warn('Minimap update skipped: app or engine not available');
                return;
            }

            try {                // Clear previous frame
                app.stage.removeChildren();

                // Get minimap data from engine
                const minimapData = engine.getMinimapData?.();
                console.log('Minimap data:', minimapData);

                const minimapSize = 150;
                const centerX = minimapSize / 2;
                const centerY = minimapSize / 2;

                // Always draw a basic background first
                const background = new PIXI.Graphics();
                background.rect(0, 0, minimapSize, minimapSize);
                background.fill({ color: 0x001122, alpha: 0.8 });
                app.stage.addChild(background);

                // Always draw border
                const border = new PIXI.Graphics();
                border.stroke({ width: 2, color: 0x00FFFF, alpha: 0.8 });
                border.rect(1, 1, minimapSize - 2, minimapSize - 2);
                app.stage.addChild(border);

                // Always draw center crosshair
                const crosshair = new PIXI.Graphics();
                crosshair.stroke({ width: 1, color: 0x00FFFF, alpha: 0.4 });
                crosshair.moveTo(centerX - 8, centerY).lineTo(centerX + 8, centerY);
                crosshair.moveTo(centerX, centerY - 8).lineTo(centerX, centerY + 8);
                app.stage.addChild(crosshair); if (!minimapData) {
                    console.warn('No minimap data available, showing test pattern');
                    // Draw a simple test pattern if no data
                    const testGraphics = new PIXI.Graphics();
                    testGraphics.circle(75, 75, 5);
                    testGraphics.fill(0xFFFFFF);
                    app.stage.addChild(testGraphics);

                    animationFrameRef.current = requestAnimationFrame(updateMinimap);
                    return;
                }

                const scale = 0.15; // Adjusted scale for better visibility

                // Calculate player offset for centering
                let offsetX = 0;
                let offsetY = 0;
                if (minimapData.player && !minimapData.player.isDestroyed) {
                    offsetX = -minimapData.player.x * scale;
                    offsetY = -minimapData.player.y * scale;
                }                // Draw background grid
                const grid = new PIXI.Graphics();
                grid.stroke({ width: 1, color: 0x004466, alpha: 0.3 });
                const gridSpacing = 30;
                for (let i = 0; i <= minimapSize; i += gridSpacing) {
                    grid.moveTo(i, 0).lineTo(i, minimapSize);
                    grid.moveTo(0, i).lineTo(minimapSize, i);
                }
                app.stage.addChild(grid);

                // Draw objects (gray circles)
                if (minimapData.objects) {
                    minimapData.objects.forEach((obj: any) => {
                        if (obj.isDestroyed) return; const objGraphics = new PIXI.Graphics();
                        objGraphics.circle(0, 0, 2);
                        objGraphics.fill({ color: 0x666666, alpha: 0.6 });

                        objGraphics.x = centerX + (obj.x * scale) + offsetX;
                        objGraphics.y = centerY + (obj.y * scale) + offsetY;

                        if (objGraphics.x >= 0 && objGraphics.x <= minimapSize &&
                            objGraphics.y >= 0 && objGraphics.y <= minimapSize) {
                            app.stage.addChild(objGraphics);
                        }
                    });
                }

                // Draw enemies (red circles)
                if (minimapData.enemies) {
                    minimapData.enemies.forEach((enemy: any) => {
                        if (enemy.isDestroyed) return; const enemyGraphics = new PIXI.Graphics();
                        enemyGraphics.circle(0, 0, 3);
                        enemyGraphics.fill(0xFF3333);

                        enemyGraphics.x = centerX + (enemy.x * scale) + offsetX;
                        enemyGraphics.y = centerY + (enemy.y * scale) + offsetY;

                        if (enemyGraphics.x >= -10 && enemyGraphics.x <= minimapSize + 10 &&
                            enemyGraphics.y >= -10 && enemyGraphics.y <= minimapSize + 10) {
                            app.stage.addChild(enemyGraphics);
                        }
                    });
                }

                // Draw turrets (orange squares)
                if (minimapData.turrets) {
                    minimapData.turrets.forEach((turret: any) => {
                        if (turret.isDestroyed) return; const turretGraphics = new PIXI.Graphics();
                        turretGraphics.rect(-2, -2, 4, 4);
                        turretGraphics.fill(0xFF8800);

                        turretGraphics.x = centerX + (turret.x * scale) + offsetX;
                        turretGraphics.y = centerY + (turret.y * scale) + offsetY;

                        if (turretGraphics.x >= -10 && turretGraphics.x <= minimapSize + 10 &&
                            turretGraphics.y >= -10 && turretGraphics.y <= minimapSize + 10) {
                            app.stage.addChild(turretGraphics);
                        }
                    });
                }

                // Draw projectiles (yellow dots)
                if (minimapData.projectiles) {
                    minimapData.projectiles.forEach((projectile: any) => {
                        if (projectile.isDestroyed) return; const projGraphics = new PIXI.Graphics();
                        projGraphics.circle(0, 0, 1);
                        projGraphics.fill(0xFFFF00);

                        projGraphics.x = centerX + (projectile.x * scale) + offsetX;
                        projGraphics.y = centerY + (projectile.y * scale) + offsetY;

                        if (projGraphics.x >= 0 && projGraphics.x <= minimapSize &&
                            projGraphics.y >= 0 && projGraphics.y <= minimapSize) {
                            app.stage.addChild(projGraphics);
                        }
                    });
                }

                // Draw player (cyan triangle, always centered)
                if (minimapData.player && !minimapData.player.isDestroyed) {
                    const playerGraphics = new PIXI.Graphics();

                    // Triangle pointing up (direction of movement)
                    playerGraphics.poly([
                        0, -6,   // tip
                        -4, 4,   // left base
                        4, 4     // right base
                    ]);
                    playerGraphics.fill(0x00FFFF);
                    playerGraphics.stroke({ width: 1, color: 0xFFFFFF });

                    playerGraphics.x = centerX;
                    playerGraphics.y = centerY;
                    playerGraphics.rotation = minimapData.player.angle || 0;

                    app.stage.addChild(playerGraphics);

                    // Draw velocity vector (green line)
                    if (minimapData.player.velocity) {
                        const vel = minimapData.player.velocity;
                        const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
                        if (speed > 1) {
                            const velocityLine = new PIXI.Graphics();
                            velocityLine.stroke({ width: 2, color: 0x00FF00, alpha: 0.8 });

                            const length = Math.min(speed * 0.2, 15);
                            const angle = Math.atan2(vel.y, vel.x);

                            velocityLine.moveTo(centerX, centerY);
                            velocityLine.lineTo(
                                centerX + Math.cos(angle) * length,
                                centerY + Math.sin(angle) * length
                            ); app.stage.addChild(velocityLine);
                        }
                    }
                }

            } catch (error) {
                console.warn('Minimap update error:', error);
            }

            // Schedule next update
            animationFrameRef.current = requestAnimationFrame(updateMinimap);
        };        // Start the update loop
        console.log('Starting minimap update loop');
        updateMinimap();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [engine]);

    return (
        <Box
            ref={containerRef}
            sx={{
                position: 'fixed',
                top: 20,
                right: 20,
                width: 150,
                height: 150,
                border: '2px solid #00ffff',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 17, 34, 0.9)',
                zIndex: 1000,
                overflow: 'hidden',
                boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
            }}
        />
    );
};

export default Minimap;

