import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import { Player, PlayerConfig } from './Player';

export type GameMode = 'classic' | 'survival' | 'practice';

export class Engine {
    private app: PIXI.Application;
    private engine!: Matter.Engine;
    private graphics: PIXI.Graphics[] = [];
    private bodies: Matter.Body[] = [];
    private initialized = false;
    private backgroundContainer: PIXI.Container;
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
    private gameMode: GameMode; constructor(mode: GameMode) {
        this.gameMode = mode;

        // Initialize PIXI.js with full window size
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x000000,
            backgroundAlpha: 1,
            resizeTo: window, // Automatically resize with window
        });

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
        this.app.stage.addChild(this.minimap);

        // Add debug toggle
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyD') {
                this.showDebug = !this.showDebug;
                this.debugContainer.visible = this.showDebug;
            }
        });
    } private createGrid() {
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
    } private createStars() {
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
    }

    private createMinimap() {
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
            const graphic = this.graphics[i];
            if (body !== this.player?.body) {
                graphic.position.set(body.position.x, body.position.y);
                graphic.rotation = body.angle;
            }
        }

        // Update debug rendering
        if (this.showDebug) {
            this.renderDebug();
        }
    }

    private updateCamera() {
        if (!this.cameraTarget) return;

        // Calculate desired camera position (centered on target)
        const targetX = this.app.screen.width / 2 - this.cameraTarget.position.x;
        const targetY = this.app.screen.height / 2 - this.cameraTarget.position.y;

        // Smooth camera movement (lerp)
        const lerp = 0.1;
        this.cameraOffset.x += (targetX - this.cameraOffset.x) * lerp;
        this.cameraOffset.y += (targetY - this.cameraOffset.y) * lerp;

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
    } public async initialize() {
        if (this.initialized) return;

        // Initialize PIXI
        await this.app.init();
        this.initialized = true;

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
        this.bodies.push(this.player.body);
        this.gameContainer.addChild(this.player.graphic);
        this.graphics.push(this.player.graphic);

        // Set camera to follow player
        this.cameraTarget = this.player.body;

        // Create other objects
        const shapes = [
            // Rectangles of different sizes
            () => Matter.Bodies.rectangle(0, 0, 40, 40, {}),
            () => Matter.Bodies.rectangle(0, 0, 60, 30, {}),
            () => Matter.Bodies.rectangle(0, 0, 30, 60, {}),
            // Circles of different sizes
            () => Matter.Bodies.circle(0, 0, 20, {}),
            () => Matter.Bodies.circle(0, 0, 25, {}),
            () => Matter.Bodies.circle(0, 0, 30, {}),
            // Regular polygons
            () => Matter.Bodies.polygon(0, 0, 3, 25), // triangle
            () => Matter.Bodies.polygon(0, 0, 5, 25), // pentagon
            () => Matter.Bodies.polygon(0, 0, 6, 25), // hexagon
            () => Matter.Bodies.polygon(0, 0, 8, 25), // octagon
        ];

        const radii = [20, 20, 20, 20, 25, 30, 25, 25, 25, 25]; // Matching radii for shapes
        const colors = [
            0xFF0000, // red
            0x00FF00, // green
            0x0000FF, // blue
            0xFFFF00, // yellow
            0xFF00FF, // magenta
            0x00FFFF, // cyan
            0xFF8800, // orange
            0x8800FF, // purple
            0x00FF88, // mint
            0xFF0088  // pink
        ];

        // Create bodies and graphics for other objects
        const numObjects = 9; // One less since we already have the player
        for (let i = 0; i < numObjects; i++) {
            // Create body with random position and velocity
            const body = shapes[i]();
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1; // Random speed between 0.5 and 1.5

            // Set random position around the edges
            const radius = 250; // Distance from center
            const centerX = this.app.screen.width / 2;
            const centerY = this.app.screen.height / 2;
            Matter.Body.setPosition(body, {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });

            // Set velocity towards center with some randomness
            Matter.Body.setVelocity(body, {
                x: -Math.cos(angle) * speed,
                y: -Math.sin(angle) * speed
            });

            // Add random angular velocity for spinning (-0.05 to 0.05 radians per step)
            Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1);

            // Configure body properties
            Matter.Body.set(body, {
                friction: 0,
                frictionAir: 0,
                restitution: 1, // Perfect bounce
                // Remove infinite inertia to allow rotation
                mass: 1 // Ensure consistent mass for all objects
            });

            this.bodies.push(body);

            // Create corresponding PIXI graphic
            const graphic = new PIXI.Graphics();
            graphic.beginFill(colors[i]);

            if (i < 3) { // Rectangles
                const bounds = body.bounds;
                const width = bounds.max.x - bounds.min.x;
                const height = bounds.max.y - bounds.min.y;
                graphic.drawRect(-width / 2, -height / 2, width, height);
            } else if (i < 6) { // Circles
                graphic.drawCircle(0, 0, radii[i]); // Use predefined radius
            } else { // Polygons
                const vertices = body.vertices;
                graphic.moveTo(vertices[0].x - body.position.x, vertices[0].y - body.position.y);
                for (let j = 1; j < vertices.length; j++) {
                    graphic.lineTo(vertices[j].x - body.position.x, vertices[j].y - body.position.y);
                }
                graphic.lineTo(vertices[0].x - body.position.x, vertices[0].y - body.position.y);
            }

            graphic.endFill();
            this.gameContainer.addChild(graphic); // Add to game container instead of app.stage
            this.graphics.push(graphic);
        }

        // Add all bodies to physics world
        Matter.Composite.add(this.engine.world, this.bodies);

        // Create minimap after bodies are created
        this.createMinimap();

        // Start the render loop
        this.app.ticker.add(() => {
            this.update();
            this.updateParallax();
            this.updateMinimap();
        });
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
    }

    private updateMinimap() {
        const minimapSize = 150;
        const padding = 10;
        const scale = minimapSize / Math.max(this.app.screen.width, this.app.screen.height);

        this.bodies.forEach((body, i) => {
            const minimapObject = this.minimapObjects[i];
            minimapObject.position.set(
                this.app.screen.width - minimapSize - padding + body.position.x * scale,
                padding + body.position.y * scale
            );
        });
    }

    public getView(): HTMLCanvasElement {
        if (!this.initialized) {
            throw new Error('Engine must be initialized before getting view');
        }
        return this.app.view as HTMLCanvasElement;
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

    private getPlayerConfigForMode(): PlayerConfig {
        switch (this.gameMode) {
            case 'practice':
                return {
                    thrust: 0.0002,          // Lower thrust for easier control
                    rotationSpeed: 0.03,     // Slower rotation
                    maxSpeed: 3,             // Lower max speed
                    frictionAir: 0.05,       // More air resistance
                    color: 0x00ff00,         // Green
                    size: 20,
                    reverseMultiplier: 0.8   // Strong reverse thrust
                };
            case 'survival':
                return {
                    thrust: 0.0004,          // High thrust for quick maneuvers
                    rotationSpeed: 0.07,     // Fast rotation
                    maxSpeed: 7,             // High max speed
                    frictionAir: 0.01,       // Low air resistance
                    color: 0xff0000,         // Red
                    size: 15,                // Smaller ship
                    reverseMultiplier: 0.3   // Weak reverse thrust
                };
            case 'classic':
            default:
                return {
                    thrust: 0.0003,          // Balanced thrust
                    rotationSpeed: 0.05,     // Medium rotation
                    maxSpeed: 5,             // Medium max speed
                    frictionAir: 0.02,       // Medium air resistance
                    color: 0x00ff00,         // Green
                    size: 20,
                    reverseMultiplier: 0.5   // Medium reverse thrust
                };
        }
    }
}
