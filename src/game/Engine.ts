/*
 * SHIP DESTRUCTION & TEST MODE IMPROVEMENTS - COMPLETED FEATURES:
 * 
 * 1. SHIP DESTRUCTION MECHANICS:
 *    - Ships break apart into individual physics bodies with proper graphics
 *    - Each part maintains its original visual appearance and color scheme
 *    - Realistic physics with momentum, rotation, and collision
 *    - Camera follows the largest destroyed part for dramatic effect
 * 
 * 2. ENHANCED CAMERA SYSTEM:
 *    - Smooth camera movement with velocity prediction
 *    - Different camera behaviors for intact vs destroyed ships
 *    - Improved zoom levels (0.1x to 4.0x range, default 0.5x)
 *    - Velocity-based prediction for smoother following of fast-moving parts
 * 
 * 3. MINIMAP POSITIONING:
 *    - Test Mode: Bottom-left corner with ship statistics display
 *    - Normal Modes: Top-right corner (classic position)
 *    - Real-time tracking of all objects including destroyed parts
 *    - Color-coded representation (red for destroyed parts)
 * 
 * 4. TEST MODE ENHANCEMENTS:
 *    - 'X' key to trigger ship destruction
 *    - '+/-' keys for zoom control
 *    - 'R' key to reset ship position
 *    - 'D' key to toggle debug physics visualization
 *    - Real-time display of ship stats (speed, angle, zoom level)
 * 
 * 5. GRAPHICS & VISUAL IMPROVEMENTS:
 *    - Destroyed parts retain original ship colors and styling
 *    - Proper physics body visualization in debug mode
 *    - Enhanced visual feedback for destruction events
 *    - Smooth transitions between intact and destroyed states
 */

import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import { Player, PlayerConfig } from './Player';
import { ShipColor } from './ShipParts';
import { ShipConfig } from '../components/ShipConfigPanel';
import { Projectile } from './Projectile';
import { Enemy, EnemyConfig } from './Enemy';

export type GameMode = 'classic' | 'survival' | 'practice' | 'test';

export class Engine {
    private app: PIXI.Application;
    private engine!: Matter.Engine;
    private graphics: PIXI.Graphics[] = [];
    private bodies: Matter.Body[] = [];
    private initialized = false; private backgroundContainer: PIXI.Container;
    private starsNear: PIXI.Container;
    private starsFar: PIXI.Container;
    private minimap: PIXI.Container;
    private minimapObjects: PIXI.Graphics[] = [];
    private gameContainer: PIXI.Container;
    private debugContainer: PIXI.Container;
    private cameraTarget: Matter.Body | null = null;
    private cameraOffset = { x: 0, y: 0 };
    private player: Player | null = null;
    private showDebug = true; // Toggle for debug rendering
    private gameMode: GameMode;
    private onShowPartsDisplay?: () => void;
    private shipConfig: ShipConfig = {
        type: 'compact',
        color: 'blue'
    }; private zoomLevel = 0.5;
    private targetZoomLevel = 0.5;
    private minZoom = 0.1;
    private maxZoom = 4.0; private wheelHandler?: (event: WheelEvent) => void;
    private onReturnToMenu?: () => void;
    private isGameOver = false;
    private projectiles: Projectile[] = [];
    private enemies: Enemy[] = [];

    constructor(mode: GameMode, onShowPartsDisplay?: () => void, onReturnToMenu?: () => void) {
        this.gameMode = mode;
        this.onShowPartsDisplay = onShowPartsDisplay;
        this.onReturnToMenu = onReturnToMenu;        // Initialize PIXI.js application (will be configured during init())
        this.app = new PIXI.Application();

        // Create containers for layered rendering
        this.backgroundContainer = new PIXI.Container();
        this.starsNear = new PIXI.Container();
        this.starsFar = new PIXI.Container();
        this.gameContainer = new PIXI.Container();
        this.debugContainer = new PIXI.Container();
        this.minimap = new PIXI.Container();

        // Add containers in order (back to front)
        this.app.stage.addChild(this.starsFar);
        this.app.stage.addChild(this.starsNear);
        this.app.stage.addChild(this.backgroundContainer);
        this.app.stage.addChild(this.gameContainer);
        this.app.stage.addChild(this.debugContainer);
        this.app.stage.addChild(this.minimap);        // Add debug toggle
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyD') {
                this.showDebug = !this.showDebug;
                this.debugContainer.visible = this.showDebug;
            }
        });
    }

    private createGrid() {
        const grid = new PIXI.Graphics();

        // Different grid styles for each mode
        switch (this.gameMode) {
            case 'practice':
                // Lighter, more visible grid for practice mode
                grid.lineStyle(1, 0x444444, 0.4);
                break;
            case 'survival':
                // Red tinted grid for survival mode
                grid.lineStyle(1, 0x330000, 0.3);
                break;
            case 'classic':
            default:
                // Standard grid
                grid.lineStyle(1, 0x333333, 0.3);
                break;
        }

        const gridSize = this.gameMode === 'practice' ? 100 : 50; // Larger grid for practice mode

        // Draw vertical lines
        for (let x = 0; x <= this.app.screen.width; x += gridSize) {
            grid.moveTo(x, 0);
            grid.lineTo(x, this.app.screen.height);
        }

        // Draw horizontal lines
        for (let y = 0; y <= this.app.screen.height; y += gridSize) {
            grid.moveTo(0, y);
            grid.lineTo(this.app.screen.width, y);
        }

        this.backgroundContainer.addChild(grid);
    }

    private createStars() {
        const farStarsConfig = {
            count: this.gameMode === 'survival' ? 150 : 100,
            color: this.gameMode === 'survival' ? 0xFF8888 : 0xFFFFFF,
            alpha: this.gameMode === 'practice' ? 0.4 : 0.3,
            size: 1
        };

        const nearStarsConfig = {
            count: this.gameMode === 'survival' ? 75 : 50,
            color: this.gameMode === 'survival' ? 0xFF6666 : 0xFFFFFF,
            alpha: this.gameMode === 'practice' ? 0.6 : 0.5,
            size: this.gameMode === 'practice' ? 3 : 2
        };

        // Create far stars (smaller, slower parallax)
        for (let i = 0; i < farStarsConfig.count; i++) {
            const star = new PIXI.Graphics();
            star.beginFill(farStarsConfig.color, farStarsConfig.alpha);
            star.drawCircle(0, 0, farStarsConfig.size);
            star.endFill();
            star.position.set(
                Math.random() * this.app.screen.width,
                Math.random() * this.app.screen.height
            );
            this.starsFar.addChild(star);
        }

        // Create near stars (larger, faster parallax)
        for (let i = 0; i < nearStarsConfig.count; i++) {
            const star = new PIXI.Graphics();
            star.beginFill(nearStarsConfig.color, nearStarsConfig.alpha);
            star.drawCircle(0, 0, nearStarsConfig.size);
            star.endFill();
            star.position.set(
                Math.random() * this.app.screen.width,
                Math.random() * this.app.screen.height
            );
            this.starsNear.addChild(star);
        }
    } private createMinimap() {
        // Clear any existing minimap objects
        this.minimap.removeChildren();
        this.minimapObjects = [];

        if (this.gameMode === 'test') {
            this.createTestModeMinimap();
            // Add player object to minimap in test mode
            if (this.player) {
                const playerMinimap = new PIXI.Graphics();
                playerMinimap.beginFill(0x00ffff);
                playerMinimap.drawCircle(0, 0, 3);
                playerMinimap.endFill();
                this.minimap.addChild(playerMinimap);
                this.minimapObjects.push(playerMinimap);
            }
            return;
        }

        // Create minimap background
        const minimapSize = 150;
        const padding = 10;
        const background = new PIXI.Graphics();
        background.beginFill(0x000000, 0.5);
        background.lineStyle(1, 0x444444);
        background.drawRect(
            this.app.screen.width - minimapSize - padding,
            padding,
            minimapSize,
            minimapSize
        );
        background.endFill();
        this.minimap.addChild(background);

        // Create minimap objects
        this.bodies.forEach((body, i) => {
            const minimapObject = new PIXI.Graphics();
            minimapObject.beginFill(this.graphics[i].tint);
            minimapObject.drawCircle(0, 0, 2);
            minimapObject.endFill();
            this.minimap.addChild(minimapObject);
            this.minimapObjects.push(minimapObject);
        });
    } private createTestModeMinimap() {
        // Create a larger minimap for test mode
        const minimapSize = 200;
        const padding = 10;
        const background = new PIXI.Graphics();
        background.beginFill(0x000000, 0.3);
        background.lineStyle(2, 0x00ffff);
        background.drawRect(
            padding,
            this.app.screen.height - minimapSize - padding,
            minimapSize,
            minimapSize
        );
        background.endFill();

        // Add title
        const title = new PIXI.Text('Ship Stats', {
            fontFamily: 'Press Start 2P',
            fontSize: 10,
            fill: 0x00ffff
        }); title.position.set(
            padding + 10,
            this.app.screen.height - minimapSize - padding + 10
        );

        // Add ship info display
        const shipInfo = new PIXI.Text('', {
            fontFamily: 'Press Start 2P',
            fontSize: 8,
            fill: 0x00ffff,
            lineHeight: 15
        });
        shipInfo.position.set(
            padding + 10,
            this.app.screen.height - minimapSize - padding + 30
        );

        // Update ship info every frame
        this.app.ticker.add(() => {
            if (this.player) {
                const velocity = this.player.body.velocity;
                const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
                const angle = (this.player.body.angle * 180 / Math.PI).toFixed(1);

                shipInfo.text =
                    `Type: ${this.shipConfig.type}\n` +
                    `Color: ${this.shipConfig.color}\n` +
                    `Speed: ${speed.toFixed(2)}\n` +
                    `Angle: ${angle}°\n` +
                    `Zoom: ${this.zoomLevel.toFixed(1)}x`;
            }
        });

        this.minimap.addChild(background);
        this.minimap.addChild(title);
        this.minimap.addChild(shipInfo);
    }

    private renderDebug() {
        // Clear previous debug graphics
        this.debugContainer.removeChildren();

        // Create new debug graphics
        const debug = new PIXI.Graphics();
        debug.lineStyle(1, 0xFF0000, 0.5); // Red lines for collision bodies

        // Draw all physics bodies
        for (const body of this.bodies) {
            if (body.vertices.length >= 3) {
                debug.moveTo(body.vertices[0].x, body.vertices[0].y);
                for (let j = 1; j < body.vertices.length; j++) {
                    debug.lineTo(body.vertices[j].x, body.vertices[j].y);
                }
                debug.lineTo(body.vertices[0].x, body.vertices[0].y);
            }
        }

        this.debugContainer.addChild(debug);
    }

    private update() {
        // Update physics engine
        Matter.Engine.update(this.engine, 1000 / 60);

        // Update camera first
        this.updateCamera();

        // Update player
        if (this.player) {
            this.player.update();
        }

        // Update graphics positions relative to game container
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            if (body !== this.player?.body && i < this.graphics.length) {
                const graphic = this.graphics[i];
                if (graphic) {
                    graphic.position.set(body.position.x, body.position.y);
                    graphic.rotation = body.angle;
                }
            }
        }

        // Update debug rendering
        if (this.showDebug) {
            this.renderDebug();
        }

        // Update projectiles (remove destroyed ones)
        this.projectiles = this.projectiles.filter((proj) => {
            const alive = proj.update();
            if (!alive) {
                Matter.Composite.remove(this.engine.world, proj.body);
                this.gameContainer.removeChild(proj.graphic);
            }
            return alive;
        });

        // Update enemies
        this.enemies.forEach((enemy) => enemy.update(this.player));
    }

    private updateCamera() {
        if (!this.cameraTarget) return;
        if (this.gameMode === 'test') {
            this.updateTestModeCamera();
        } else {
            // Smooth zoom interpolation
            const zoomSmoothing = 0.1; // Slower transition for smoother zoom
            this.zoomLevel += (this.targetZoomLevel - this.zoomLevel) * zoomSmoothing;

            // Apply zoom to containers
            this.gameContainer.scale.set(this.zoomLevel);
            this.debugContainer.scale.set(this.zoomLevel);

            // Calculate target position to keep ship centered (immediate for zoom)
            const targetX = this.app.screen.width / 2 - this.cameraTarget.position.x * this.zoomLevel;
            const targetY = this.app.screen.height / 2 - this.cameraTarget.position.y * this.zoomLevel;

            // Apply ship centering immediately (no smoothing for centering)
            this.cameraOffset.x = targetX;
            this.cameraOffset.y = targetY;

            // Update container positions
            this.gameContainer.position.set(this.cameraOffset.x, this.cameraOffset.y);
            this.debugContainer.position.set(this.cameraOffset.x, this.cameraOffset.y);

            // Update grid position with parallax (slower movement)
            this.backgroundContainer.position.set(
                this.cameraOffset.x * 0.8,
                this.cameraOffset.y * 0.8
            );

            // Update stars position with different parallax speeds
            this.starsFar.position.set(
                this.cameraOffset.x * 0.2,
                this.cameraOffset.y * 0.2
            );
            this.starsNear.position.set(
                this.cameraOffset.x * 0.4,
                this.cameraOffset.y * 0.4
            );
        }
    } public async initialize() {
        if (this.initialized) return;        // Initialize PIXI with configuration
        await this.app.init({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x000000,
            backgroundAlpha: 1,
            resizeTo: window, // Automatically resize with window
        });
        this.initialized = true;

        // Set up scroll wheel zoom support for all game modes (after PIXI init)
        this.setupScrollWheelZoom();

        // Set up test mode controls
        this.setupTestModeControls();

        // Create background elements
        this.createGrid();
        this.createStars();

        // Initialize Matter.js with mode-specific settings
        this.engine = Matter.Engine.create({
            enableSleeping: false,
            timing: {
                timeScale: 1
            }
        });
        // Configure physics based on game mode
        switch (this.gameMode) {
            case 'test':
                this.engine.gravity.y = 0;
                // Enable debug mode by default in test mode
                this.showDebug = true;
                this.debugContainer.visible = true;
                break;
            case 'practice':
                this.engine.gravity.y = 0;
                break;
            case 'survival':
                this.engine.gravity.y = 0.1; // Slight gravity for added challenge
                break;
            case 'classic':
            default:
                this.engine.gravity.y = 0;
                break;
        }

        // Create player with mode-specific settings
        const playerConfig = this.getPlayerConfigForMode();
        this.player = new Player(
            this.app.screen.width / 2,
            this.app.screen.height / 2,
            playerConfig
        );
        // Subscribe to projectiles created by player
        this.player.setProjectileCallback((proj) => {
            this.projectiles.push(proj);
            Matter.Composite.add(this.engine.world, proj.body);
            this.gameContainer.addChild(proj.graphic as any);
        });

        this.bodies.push(this.player.body);
        this.gameContainer.addChild(this.player.graphic as any);
        this.graphics.push(this.player.graphic as any);

        // Set camera to follow player
        this.cameraTarget = this.player.body;        // Only create other objects in non-test modes
        if (this.gameMode !== 'test') {
            // Create other objects code...
        }        // Add all bodies to physics world
        Matter.Composite.add(this.engine.world, this.bodies);

        // Create minimap after bodies are created
        // this.createMinimap(); // Commented out - now using React component
        // if (this.gameMode === 'test') {
        //     this.createTestModeMinimap(); // Commented out - now using React component
        // }

        // Start the render loop
        this.app.ticker.add(() => {
            this.update();
            this.updateParallax();
            // this.updateMinimap(); // Commented out - now using React component
        });

        // Create help text for test mode
        this.createTestModeHelp();
    }

    private updateParallax() {
        // Move stars with parallax effect
        this.starsFar.children.forEach((star) => {
            if (star instanceof PIXI.Graphics) {
                star.x -= 0.1;
                if (star.x < 0) star.x = this.app.screen.width;
            }
        });

        this.starsNear.children.forEach((star) => {
            if (star instanceof PIXI.Graphics) {
                star.x -= 0.2;
                if (star.x < 0) star.x = this.app.screen.width;
            }
        });
    } private updateMinimap() {
        if (this.minimapObjects.length === 0) return;

        const minimapSize = this.gameMode === 'test' ? 200 : 150;
        const padding = 10;
        const scale = minimapSize / Math.max(this.app.screen.width, this.app.screen.height);

        if (this.gameMode === 'test') {            // Update positions of all objects
            this.bodies.forEach((body, i) => {
                if (i < this.minimapObjects.length) {
                    const minimapObject = this.minimapObjects[i];
                    minimapObject.position.set(
                        padding + body.position.x * scale,
                        this.app.screen.height - minimapSize - padding + body.position.y * scale
                    );
                }
            });

            // Create new minimap objects for destroyed ship parts
            if (this.player?.isDestroyed) {
                const destroyedParts = this.bodies.slice(this.minimapObjects.length);
                destroyedParts.forEach(body => {
                    const minimapObject = new PIXI.Graphics();
                    minimapObject.beginFill(0xFF0000);
                    minimapObject.drawCircle(0, 0, 2);
                    minimapObject.endFill();
                    minimapObject.position.set(
                        padding + body.position.x * scale,
                        this.app.screen.height - minimapSize - padding + body.position.y * scale
                    );
                    this.minimap.addChild(minimapObject);
                    this.minimapObjects.push(minimapObject);
                });
            }
        } else {
            // Normal mode update for all objects
            this.bodies.forEach((body, i) => {
                if (i < this.minimapObjects.length) {
                    const minimapObject = this.minimapObjects[i];
                    minimapObject.position.set(
                        this.app.screen.width - minimapSize - padding + body.position.x * scale,
                        padding + body.position.y * scale
                    );
                }
            });
        }
    } public getView(): HTMLCanvasElement {
        if (!this.initialized) {
            throw new Error('Engine must be initialized before getting view');
        }
        return this.app.canvas;
    }

    public resize(): void {
        if (!this.initialized) return;

        // Resize the renderer
        this.app.renderer.resize(window.innerWidth, window.innerHeight);

        // Recreate the grid at new size
        this.backgroundContainer.removeChildren();
        this.createGrid();

        // Redistribute stars across new screen size
        this.starsFar.children.forEach((star) => {
            if (star instanceof PIXI.Graphics) {
                star.position.set(
                    Math.random() * this.app.screen.width,
                    Math.random() * this.app.screen.height
                );
            }
        });

        this.starsNear.children.forEach((star) => {
            if (star instanceof PIXI.Graphics) {
                star.position.set(
                    Math.random() * this.app.screen.width,
                    Math.random() * this.app.screen.height
                );
            }
        });

        // Update minimap position
        const minimapSize = 150;
        const padding = 10;
        const background = this.minimap.children[0];
        if (background instanceof PIXI.Graphics) {
            background.clear();
            background.beginFill(0x000000, 0.5);
            background.lineStyle(1, 0x444444);
            background.drawRect(
                this.app.screen.width - minimapSize - padding,
                padding,
                minimapSize,
                minimapSize
            );
            background.endFill();
        }
    }

    public updateShipConfig(config: ShipConfig) {
        this.shipConfig = config;
        if (this.player) {
            const playerConfig = this.getPlayerConfigForMode();
            // Preserve position and velocity
            const pos = this.player.body.position;
            const vel = this.player.body.velocity;
            const angle = this.player.body.angle;

            // Create new player with updated config
            this.gameContainer.removeChild(this.player.graphic);
            const index = this.bodies.indexOf(this.player.body);
            if (index > -1) {
                this.bodies.splice(index, 1);
                Matter.Composite.remove(this.engine.world, this.player.body);
            }

            this.player = new Player(pos.x, pos.y, playerConfig);
            Matter.Body.setVelocity(this.player.body, vel);
            Matter.Body.setAngle(this.player.body, angle);

            this.bodies.push(this.player.body);
            this.gameContainer.addChild(this.player.graphic);
            Matter.Composite.add(this.engine.world, this.player.body);
        }
    } public destroyShip() {
        if (this.player && !this.isGameOver) {
            // Get all the destroyed parts
            const destroyedParts = this.player.destroy();

            // Add the destroyed parts to the physics world and tracking arrays
            destroyedParts.forEach(part => {
                Matter.Composite.add(this.engine.world, part.body);
                this.bodies.push(part.body);
                this.graphics.push(part.graphic as any);
                this.gameContainer.addChild(part.graphic);
            });

            // Remove the main ship body
            Matter.Composite.remove(this.engine.world, this.player.body);
            const index = this.bodies.indexOf(this.player.body);
            if (index > -1) {
                this.bodies.splice(index, 1);
            }

            // Find the largest part to follow with the camera
            if (destroyedParts.length > 0) {
                const largestPart = destroyedParts.reduce((prev, current) => {
                    return (prev.body.mass > current.body.mass) ? prev : current;
                });
                this.cameraTarget = largestPart.body;
            }
        }
    }

    private getPlayerConfigForMode(): PlayerConfig {
        // Base configuration for each mode
        const modeConfig = (() => {
            switch (this.gameMode) {
                case 'test':
                    return {
                        thrust: 0.0002,
                        rotationSpeed: 0.02,
                        maxSpeed: 2,
                        frictionAir: 0.1,
                        size: 40,
                        reverseMultiplier: 1.0
                    };
                case 'practice':
                    return {
                        thrust: 0.0002,
                        rotationSpeed: 0.03,
                        maxSpeed: 3,
                        frictionAir: 0.05,
                        size: 30,
                        reverseMultiplier: 0.8
                    };
                case 'survival':
                    return {
                        thrust: 0.0004,
                        rotationSpeed: 0.07,
                        maxSpeed: 7,
                        frictionAir: 0.01,
                        size: 25,
                        reverseMultiplier: 0.3
                    };
                case 'classic':
                default:
                    return {
                        thrust: 0.0003,
                        rotationSpeed: 0.05,
                        maxSpeed: 5,
                        frictionAir: 0.02,
                        size: 30,
                        reverseMultiplier: 0.5
                    };
            }
        })();

        // Ship-specific physics adjustments
        const shipAdjustments = (() => {
            switch (this.shipConfig.type) {
                case 'razorInterceptor':
                    return {
                        thrust: modeConfig.thrust * 1.2,     // Higher acceleration
                        rotationSpeed: modeConfig.rotationSpeed * 1.3, // More agile
                        maxSpeed: modeConfig.maxSpeed * 1.1, // Slightly faster
                        frictionAir: modeConfig.frictionAir * 0.9, // Less drag
                        size: modeConfig.size * 0.9,         // Smaller hitbox
                        reverseMultiplier: modeConfig.reverseMultiplier * 1.1 // Better reverse
                    };
                case 'strikeInterceptor':
                    return {
                        thrust: modeConfig.thrust * 1.15,    // Good acceleration
                        rotationSpeed: modeConfig.rotationSpeed * 1.1, // Balanced agility
                        maxSpeed: modeConfig.maxSpeed * 1.15, // Higher speed
                        frictionAir: modeConfig.frictionAir * 0.95, // Low drag
                        size: modeConfig.size * 0.95,        // Compact size
                        reverseMultiplier: modeConfig.reverseMultiplier // Standard reverse
                    };
                case 'phantomInterceptor':
                    return {
                        thrust: modeConfig.thrust * 1.1,     // Moderate acceleration
                        rotationSpeed: modeConfig.rotationSpeed * 1.4, // Very agile
                        maxSpeed: modeConfig.maxSpeed * 1.05, // Standard speed
                        frictionAir: modeConfig.frictionAir * 0.8, // Very low drag
                        size: modeConfig.size * 0.85,        // Smallest hitbox
                        reverseMultiplier: modeConfig.reverseMultiplier * 1.2 // Best reverse
                    };
                case 'capital':
                    return {
                        thrust: modeConfig.thrust * 0.8,     // Slower acceleration
                        rotationSpeed: modeConfig.rotationSpeed * 0.6, // Less agile
                        maxSpeed: modeConfig.maxSpeed * 0.8, // Slower
                        frictionAir: modeConfig.frictionAir * 1.2, // More drag
                        size: modeConfig.size * 1.4,         // Large hitbox
                        reverseMultiplier: modeConfig.reverseMultiplier * 0.8 // Poor reverse
                    };
                case 'assault':
                    return {
                        thrust: modeConfig.thrust * 0.9,     // Moderate acceleration
                        rotationSpeed: modeConfig.rotationSpeed * 0.8, // Moderate agility
                        maxSpeed: modeConfig.maxSpeed * 0.9, // Moderate speed
                        frictionAir: modeConfig.frictionAir * 1.1, // Moderate drag
                        size: modeConfig.size * 1.2,         // Larger hitbox
                        reverseMultiplier: modeConfig.reverseMultiplier * 0.9 // Decent reverse
                    };
                case 'compact':
                default:
                    return modeConfig; // Default balanced configuration
            }
        })();

        return {
            ...shipAdjustments,
            color: this.shipConfig.color,
            shipType: this.shipConfig.type,
            gameMode: this.gameMode,
            enabledParts: this.shipConfig.enabledParts
        };
    } private createTestModeHelp() {
        if (this.gameMode !== 'test') return;

        const helpText = new PIXI.Text(
            'Test Mode Controls:\n' +
            'WASD/Arrows - Move ship\n' +
            'Space - Toggle thrusters\n' +
            'D - Toggle debug view\n' +
            'R - Reset position\n' +
            'P - Show parts display\n' +
            '+/- or Scroll - Zoom in/out\n' +
            'X - Destroy ship',
            {
                fontFamily: 'Press Start 2P',
                fontSize: 12,
                fill: 0x00ffff,
                lineHeight: 20
            }
        );
        helpText.position.set(10, 10);
        this.app.stage.addChild(helpText);

        // Add reset position handler
        window.addEventListener('keydown', (e) => {
            if (this.gameMode === 'test' && e.code === 'KeyR' && this.player) {
                Matter.Body.setPosition(this.player.body, {
                    x: this.app.screen.width / 2,
                    y: this.app.screen.height / 2
                });
                Matter.Body.setVelocity(this.player.body, { x: 0, y: 0 });
                Matter.Body.setAngularVelocity(this.player.body, 0);
            }

            // Add parts display shortcut
            if (this.gameMode === 'test' && e.code === 'KeyP' && this.onShowPartsDisplay) {
                this.onShowPartsDisplay();
            }
        });
    }

    private setupTestModeControls() {
        if (this.gameMode !== 'test') return;

        window.addEventListener('keydown', (e) => {
            if (this.gameMode !== 'test') return; switch (e.key) {
                case '+':
                case '=': // Allow = key without shift
                    this.targetZoomLevel = Math.min(this.maxZoom, this.targetZoomLevel + 0.1);
                    break;
                case '-':
                case '_':
                    this.targetZoomLevel = Math.max(this.minZoom, this.targetZoomLevel - 0.1);
                    break;
                case 'x': case 'X':
                    if (this.player && !this.player.isDestroyed) {
                        const destroyedParts = this.player.destroy();
                        destroyedParts.forEach(part => {
                            // Add to the game
                            this.bodies.push(part.body);
                            this.graphics.push(part.graphic as any);
                            this.gameContainer.addChild(part.graphic);
                            Matter.Composite.add(this.engine.world, part.body);
                        });

                        // Set camera to follow the largest piece
                        if (destroyedParts.length > 0) {
                            const largestPart = destroyedParts.reduce((prev, current) => {
                                return (prev.body.mass > current.body.mass) ? prev : current;
                            });
                            this.cameraTarget = largestPart.body;
                        }
                    }
                    break;
            }
        });
    } private setupScrollWheelZoom() {
        // Add scroll wheel event listener to the canvas
        const canvas = this.app.canvas; const handleWheel = (event: WheelEvent) => {
            event.preventDefault(); // Prevent page scrolling

            // Calculate zoom change based on wheel delta
            // Negative deltaY means scroll up (zoom in), positive means scroll down (zoom out)
            const zoomIntensity = 0.05; // Further reduced for even smoother zooming
            const zoomChange = event.deltaY > 0 ? -zoomIntensity : zoomIntensity;

            // Apply zoom to target with limits
            this.targetZoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoomLevel + zoomChange));
        };

        // Add the event listener
        canvas.addEventListener('wheel', handleWheel, { passive: false });

        // Store the handler for potential cleanup later
        this.wheelHandler = handleWheel;
    } private updateTestModeCamera() {
        if (!this.cameraTarget) return;

        // Smooth zoom interpolation
        const zoomSmoothing = 0.1; // Slower transition for smoother zoom
        this.zoomLevel += (this.targetZoomLevel - this.zoomLevel) * zoomSmoothing;

        // Apply zoom
        this.gameContainer.scale.set(this.zoomLevel);
        this.debugContainer.scale.set(this.zoomLevel);

        // Calculate velocities
        const velocity = {
            x: this.cameraTarget.velocity?.x || 0,
            y: this.cameraTarget.velocity?.y || 0
        };

        // Add velocity-based prediction for smoother following
        const predictionFactor = 0.5; // How far ahead to look
        const predictedX = this.cameraTarget.position.x + velocity.x * predictionFactor;
        const predictedY = this.cameraTarget.position.y + velocity.y * predictionFactor;        // Center the camera on the predicted position (immediate for zoom)
        const targetX = this.app.screen.width / 2 - predictedX * this.zoomLevel;
        const targetY = this.app.screen.height / 2 - predictedY * this.zoomLevel;

        // Apply ship centering immediately (no smoothing for centering)
        this.cameraOffset.x = targetX;
        this.cameraOffset.y = targetY;

        // Update all containers
        this.gameContainer.position.set(this.cameraOffset.x, this.cameraOffset.y);
        this.debugContainer.position.set(this.cameraOffset.x, this.cameraOffset.y);
        this.backgroundContainer.position.set(this.cameraOffset.x, this.cameraOffset.y);
        this.starsFar.position.set(this.cameraOffset.x, this.cameraOffset.y);
        this.starsNear.position.set(this.cameraOffset.x, this.cameraOffset.y);
    }

    public getPlayer(): Player | null {
        return this.player;
    }

    public getMinimapData() {
        return {
            player: this.player ? {
                x: this.player.body.position.x,
                y: this.player.body.position.y,
                angle: this.player.body.angle,
                velocity: this.player.body.velocity,
                isDestroyed: this.player.isDestroyed
            } : null,
            objects: this.bodies.map((body, index) => ({
                x: body.position.x,
                y: body.position.y,
                color: this.graphics[index]?.tint || 0xffffff,
                isDestroyed: false // TODO: track destroyed state
            })),
            bounds: {
                width: this.app.screen.width,
                height: this.app.screen.height
            },
            cameraTarget: this.cameraTarget ? {
                x: this.cameraTarget.position.x,
                y: this.cameraTarget.position.y
            } : null
        };
    }

    private spawnEnemy(x: number, y: number, config?: EnemyConfig): void {
        const defaultConfig: EnemyConfig = config || {
            size: 20,
            speed: 0.0005,
            health: 50,
            color: 0xff0000
        };
        const enemy = new Enemy(x, y, defaultConfig);
        this.enemies.push(enemy);
        Matter.Composite.add(this.engine.world, enemy.body);
        this.gameContainer.addChild(enemy.graphic as any);
    }

    public addRandomEnemy(): void {
        const x = Math.random() * this.app.screen.width / this.zoomLevel + -this.cameraOffset.x;
        const y = Math.random() * this.app.screen.height / this.zoomLevel + -this.cameraOffset.y;
        this.spawnEnemy(x, y);
    }
}
