import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';

export class Engine {
    private app: PIXI.Application;
    private engine!: Matter.Engine;
    private graphics: PIXI.Graphics[] = [];
    private bodies: Matter.Body[] = [];
    private initialized = false;

    constructor() {
        // Initialize PIXI.js
        this.app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: 0x000000,
            backgroundAlpha: 1,
        });
    }

    public async initialize() {
        if (this.initialized) return;

        // Initialize PIXI
        await this.app.init();
        this.initialized = true;

        // Initialize Matter.js
        this.engine = Matter.Engine.create();
        this.engine.gravity.y = 0;

        // Create first box on the left
        const box1 = Matter.Bodies.rectangle(200, 300, 50, 50, {
            restitution: 0.8,
            friction: 0,
            frictionAir: 0
        });
        Matter.Body.setVelocity(box1, { x: 5, y: 0 });

        // Create second box on the right
        const box2 = Matter.Bodies.rectangle(600, 300, 50, 50, {
            restitution: 0.8,
            friction: 0,
            frictionAir: 0
        });
        Matter.Body.setVelocity(box2, { x: -5, y: 0 });

        // Add boxes to physics world
        Matter.Composite.add(this.engine.world, [box1, box2]);
        this.bodies.push(box1, box2);

        // Create graphics for the boxes
        for (let i = 0; i < 2; i++) {
            const graphics = new PIXI.Graphics();
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(-25, -25, 50, 50);
            graphics.endFill();
            this.app.stage.addChild(graphics);
            this.graphics.push(graphics);
        }

        // Start the physics simulation
        Matter.Runner.run(this.engine);

        // Start the render loop
        this.app.ticker.add(() => this.update());
    }

    private update() {
        // Update graphics positions to match physics bodies
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            const graphic = this.graphics[i];
            graphic.position.set(body.position.x, body.position.y);
            graphic.rotation = body.angle;
        }
    }

    public getView(): HTMLCanvasElement {
        if (!this.initialized) {
            throw new Error('Engine must be initialized before getting view');
        }
        return this.app.view as HTMLCanvasElement;
    }

    public resize(): void {
        if (!this.initialized) return;
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
    }
}
