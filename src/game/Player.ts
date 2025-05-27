import * as Matter from 'matter-js';
import { Entity } from './Entity';

export class Player extends Entity {
    private thrust: number = 0.1;
    private rotationSpeed: number = 0.1;
    private maxSpeed: number = 5;

    constructor(x: number, y: number) {
        super(x, y);

        // Create a triangular ship shape
        const vertices = [
            { x: 20, y: 0 },   // tip
            { x: -10, y: -10 }, // left corner
            { x: -10, y: 10 }   // right corner
        ];

        // Create the physics body
        this.body = Matter.Bodies.fromVertices(x, y, [vertices], {
            mass: 1,
            friction: 0,
            frictionAir: 0.02,
            vertices: vertices // Explicitly set vertices
        });

        if (!this.body) {
            // Fallback to a simple rectangle if vertex creation fails
            this.body = Matter.Bodies.rectangle(x, y, 40, 20, {
                mass: 1,
                friction: 0,
                frictionAir: 0.02
            });
        }

        // Setup ship graphics
        this.graphics
            .clear()
            .fill({ color: 0xFFFFFF })
            .poly(vertices);
        this.graphics.pivot.set(0, 0);
    }

    public update(): void {
        super.update();
        this.handleInput();
    }

    private handleInput(): void {
        if (Matter.Vector.magnitude(this.body.velocity) < this.maxSpeed) {
            if (this.isKeyPressed('ArrowUp')) {
                const force = Matter.Vector.rotate(
                    { x: this.thrust, y: 0 },
                    this.body.angle
                );
                Matter.Body.applyForce(this.body, this.body.position, force);
            }
        }

        if (this.isKeyPressed('ArrowLeft')) {
            Matter.Body.rotate(this.body, -this.rotationSpeed);
        }
        if (this.isKeyPressed('ArrowRight')) {
            Matter.Body.rotate(this.body, this.rotationSpeed);
        }
    } public isKeyPressed(key: string): boolean {
        return (window as any).gameEngine?.isKeyPressed(key) || false;
    }
}
