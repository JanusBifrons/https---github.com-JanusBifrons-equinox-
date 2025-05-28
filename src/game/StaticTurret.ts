import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import { Player } from './Player';
import { Projectile } from './Projectile';

export interface TurretConfig {
    size: number;
    health: number;
    color: number;
    fireRate: number; // milliseconds between shots
    range: number; // maximum shooting range
    damage: number;
    projectileSpeed: number;
}

export class StaticTurret {
    public body: Matter.Body;
    public graphic: PIXI.Graphics;
    private config: TurretConfig;
    private _isDestroyed = false;
    private lastFireTime = 0;
    private barrelGraphic: PIXI.Graphics;
    public onProjectileCreated?: (projectile: Projectile) => void;

    constructor(x: number, y: number, config: TurretConfig) {
        this.config = config;        // Create physics body (static, doesn't move)
        this.body = Matter.Bodies.circle(x, y, config.size, {
            isStatic: true, // Static turrets don't move
            friction: 0,
            frictionAir: 0,
            restitution: 0,
            label: 'turret'
        });

        // Store reference to this turret instance on the body for collision detection
        (this.body as any).entity = this;

        // Graphics: draw turret base (hexagon)
        this.graphic = new PIXI.Graphics();
        this.drawTurretBase();

        // Create barrel graphics (separate for rotation)
        this.barrelGraphic = new PIXI.Graphics();
        this.drawTurretBarrel();
        this.graphic.addChild(this.barrelGraphic);
    }

    private drawTurretBase(): void {
        this.graphic.clear();
        this.graphic.beginFill(this.config.color, 0.8);

        // Draw hexagonal base
        const size = this.config.size;
        const vertices: number[] = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            vertices.push(
                Math.cos(angle) * size,
                Math.sin(angle) * size
            );
        }
        this.graphic.drawPolygon(vertices);
        this.graphic.endFill();

        // Add inner ring for visual detail
        this.graphic.beginFill(0x444444, 0.6);
        this.graphic.drawCircle(0, 0, size * 0.6);
        this.graphic.endFill();
    }

    private drawTurretBarrel(): void {
        this.barrelGraphic.clear();
        this.barrelGraphic.beginFill(0x666666);

        // Draw barrel as rectangle
        const barrelLength = this.config.size * 1.5;
        const barrelWidth = this.config.size * 0.3;
        this.barrelGraphic.drawRoundedRect(0, -barrelWidth / 2, barrelLength, barrelWidth, 2);
        this.barrelGraphic.endFill();

        // Barrel tip
        this.barrelGraphic.beginFill(0x888888);
        this.barrelGraphic.drawCircle(barrelLength, 0, barrelWidth / 3);
        this.barrelGraphic.endFill();
    }

    public update(player: Player | null): boolean {
        if (this._isDestroyed) return false;

        // Update graphic position (body doesn't move since it's static)
        this.graphic.position.set(this.body.position.x, this.body.position.y);

        // Turret AI: aim at player and shoot if in range
        if (player && !player.isDestroyed) {
            const dx = player.body.position.x - this.body.position.x;
            const dy = player.body.position.y - this.body.position.y;
            const distance = Math.hypot(dx, dy);

            // Rotate barrel to face player
            const targetAngle = Math.atan2(dy, dx);
            this.barrelGraphic.rotation = targetAngle;

            // Shoot if player is in range and enough time has passed
            if (distance <= this.config.range) {
                this.tryShoot(targetAngle);
            }
        }

        return !this._isDestroyed;
    }

    private tryShoot(angle: number): void {
        const currentTime = Date.now();
        if (currentTime - this.lastFireTime < this.config.fireRate) {
            return; // Rate limiting
        }

        this.lastFireTime = currentTime;

        // Calculate projectile spawn position (at the barrel tip)
        const barrelLength = this.config.size * 1.5;
        const spawnX = this.body.position.x + Math.cos(angle) * barrelLength;
        const spawnY = this.body.position.y + Math.sin(angle) * barrelLength;

        // Create enemy projectile (different from player projectiles)
        const projectileConfig = {
            size: 3,
            speed: this.config.projectileSpeed,
            damage: this.config.damage,
            lifetime: 3000, // 3 seconds
            color: 0xff4444 // Red enemy projectiles
        };

        const projectile = new Projectile(spawnX, spawnY, angle, projectileConfig);

        // Notify engine about new projectile
        if (this.onProjectileCreated) {
            this.onProjectileCreated(projectile);
        }

        // Visual feedback: muzzle flash
        this.showMuzzleFlash(angle);
    }

    private showMuzzleFlash(angle: number): void {
        // Create temporary muzzle flash effect
        const flash = new PIXI.Graphics();
        flash.beginFill(0xffff44, 0.8);

        const barrelLength = this.config.size * 1.5;
        const flashX = Math.cos(angle) * barrelLength;
        const flashY = Math.sin(angle) * barrelLength;

        flash.drawCircle(flashX, flashY, 8);
        flash.endFill();

        this.graphic.addChild(flash);

        // Remove flash after short time
        setTimeout(() => {
            if (flash.parent) {
                flash.parent.removeChild(flash);
            }
        }, 100);
    }

    public takeDamage(dmg: number): void {
        this.config.health -= dmg;
        if (this.config.health <= 0) {
            this._isDestroyed = true;
        }

        // Visual feedback for taking damage
        this.graphic.tint = 0xff8888;
        setTimeout(() => {
            if (!this._isDestroyed) {
                this.graphic.tint = 0xffffff;
            }
        }, 150);
    }

    public get isDestroyed(): boolean {
        return this._isDestroyed;
    }

    public getSize(): number {
        return this.config.size;
    }

    public getRange(): number {
        return this.config.range;
    }
}
