import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';

export interface ProjectileConfig {
    speed: number;
    lifetime: number; // in milliseconds
    damage: number;
    color: number;
    size: number;
}

export class Projectile {
    public body: Matter.Body;
    public graphic: PIXI.Graphics;
    private config: ProjectileConfig;
    private createdAt: number;
    private _isDestroyed = false;

    constructor(x: number, y: number, angle: number, config: ProjectileConfig) {
        this.config = config;
        this.createdAt = Date.now();        // Create physics body
        this.body = Matter.Bodies.circle(x, y, config.size, {
            friction: 0,
            frictionAir: 0,
            restitution: 0.1,
            isSensor: true, // Projectiles don't collide with other objects physically
            mass: 0.1,
            label: 'projectile'
        });

        // Store reference to this projectile instance on the body for collision detection
        (this.body as any).entity = this;

        // Set initial velocity based on angle and speed
        const velocity = {
            x: Math.cos(angle) * config.speed,
            y: Math.sin(angle) * config.speed
        };
        Matter.Body.setVelocity(this.body, velocity);

        // Create graphics
        this.graphic = new PIXI.Graphics();
        this.updateGraphics();
    }

    private updateGraphics(): void {
        this.graphic.clear();

        // Draw projectile with glow effect
        this.graphic.beginFill(this.config.color, 0.9);
        this.graphic.drawCircle(0, 0, this.config.size);
        this.graphic.endFill();

        // Add glow
        this.graphic.beginFill(this.config.color, 0.3);
        this.graphic.drawCircle(0, 0, this.config.size * 2);
        this.graphic.endFill();
    }

    public update(): boolean {
        if (this._isDestroyed) return false;

        // Check if projectile has exceeded its lifetime
        const age = Date.now() - this.createdAt;
        if (age > this.config.lifetime) {
            this._isDestroyed = true;
            return false;
        }

        // Update graphics position
        this.graphic.position.set(this.body.position.x, this.body.position.y);

        // Add slight fade effect as projectile ages
        const fadeRatio = 1 - (age / this.config.lifetime);
        this.graphic.alpha = Math.max(0.3, fadeRatio);

        return true;
    }

    public get isDestroyed(): boolean {
        return this._isDestroyed;
    }

    public destroy(): void {
        this._isDestroyed = true;
    }

    public getDamage(): number {
        return this.config.damage;
    }

    public getSize(): number {
        return this.config.size;
    }
}
