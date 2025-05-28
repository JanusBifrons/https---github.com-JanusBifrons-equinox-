import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import { Player } from './Player';

export interface EnemyConfig {
    size: number;
    speed: number; // force magnitude
    health: number;
    color: number;
}

export class Enemy {
    public body: Matter.Body;
    public graphic: PIXI.Graphics;
    private config: EnemyConfig;
    private _isDestroyed = false;

    constructor(x: number, y: number, config: EnemyConfig) {
        this.config = config;        // Create physics body
        this.body = Matter.Bodies.circle(x, y, config.size, {
            friction: 0.05,
            frictionAir: 0.05,
            restitution: 0.2,
            mass: 1,
            label: 'enemy'
        });

        // Store reference to this enemy instance on the body for collision detection
        (this.body as any).entity = this;

        // Graphics: draw simple triangle ship
        this.graphic = new PIXI.Graphics();
        this.graphic.beginFill(config.color);
        const s = config.size;
        this.graphic.drawPolygon([
            s, 0,
            -s, s * 0.6,
            -s, -s * 0.6
        ]);
        this.graphic.endFill();
    }

    // Apply simple AI: move towards player
    public update(player: Player | null): boolean {
        if (this._isDestroyed) return false;
        if (player && !player.isDestroyed) {
            const px = player.body.position.x;
            const py = player.body.position.y;
            const dx = px - this.body.position.x;
            const dy = py - this.body.position.y;
            const distance = Math.hypot(dx, dy);
            if (distance > 0) {
                const fx = (dx / distance) * this.config.speed;
                const fy = (dy / distance) * this.config.speed;
                Matter.Body.applyForce(this.body, this.body.position, { x: fx, y: fy });
            }
        }
        // Update graphic position and rotation
        this.graphic.position.set(this.body.position.x, this.body.position.y);
        this.graphic.rotation = this.body.angle;
        return !this._isDestroyed;
    }

    public takeDamage(dmg: number) {
        this.config.health -= dmg;
        if (this.config.health <= 0) {
            this._isDestroyed = true;
        }
    }

    public get isDestroyed(): boolean {
        return this._isDestroyed;
    }

    public getSize(): number {
        return this.config.size;
    }
}
