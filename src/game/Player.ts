import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import { ShipPart, ShipComponents, ShipColor, PartType } from './ShipParts';
import { Projectile, ProjectileConfig } from './Projectile';
import { ShieldBubble, ShieldConfig } from './ShieldBubble';
import { Stats } from './Stats';

export interface PlayerConfig {
    thrust: number;
    rotationSpeed: number;
    maxSpeed: number;
    frictionAir: number;
    color: ShipColor;
    size: number;
    reverseMultiplier: number;
    shipType?: 'compact' | 'assault' | 'capital' | 'razorInterceptor' | 'strikeInterceptor' | 'phantomInterceptor';
    gameMode?: 'classic' | 'survival' | 'practice' | 'test';
    enabledParts?: {
        [key: string]: boolean;
    };
}

interface ShipPartInstance {
    part: ShipPart;
    body: Matter.Body;
    isDestroyed: boolean;
}

export class Player {
    public body: Matter.Body;
    public graphic: PIXI.Container;
    private shipParts: ShipPartInstance[] = [];
    private thrust: number;
    private rotationSpeed: number;
    private maxSpeed: number;
    private reverseMultiplier: number; private input = {
        up: false,
        down: false,
        left: false,
        right: false,
        fire: false,
        afterburner: false
    };
    private lastFireTime = 0;
    private fireRate = 200; // Milliseconds between shots
    private projectiles: Projectile[] = [];
    private onProjectileCreated?: (projectile: Projectile) => void; private config: PlayerConfig;
    private container: PIXI.Container;
    private _isDestroyed = false;
    private _stats: Stats; private lastSpeed: number = 0;
    private accelerationValue: number = 0;
    private shield?: ShieldBubble;
    private lastRegenTime: number = 0; private afterburnerPowerCost: number = 15; // Power per second for afterburner - REDUCED for longer use
    private afterburnerThrust: number = 2.5; // Multiplier for thrust when afterburner is active - INCREASED for better responsiveness

    constructor(x: number, y: number, config: PlayerConfig) {
        this.config = config;
        this.thrust = config.thrust;
        this.rotationSpeed = config.rotationSpeed;
        this.maxSpeed = config.maxSpeed;
        this.reverseMultiplier = config.reverseMultiplier;        // Initialize ship stats based on ship type
        this._stats = Stats.createForShipType(config.shipType || 'compact');

        // Initialize regeneration timer
        this.lastRegenTime = Date.now();

        // Create container for ship parts
        this.container = new PIXI.Container();
        this.container.position.set(x, y);        // Create composite ship body
        const vertices = this.createShipVertices(config.size);
        this.body = Matter.Bodies.fromVertices(x, y, [vertices], {
            friction: 0,
            frictionAir: config.frictionAir,
            restitution: 0.8,
            mass: 1,
            label: 'player'
        });

        // Store reference to this player instance on the body for collision detection
        (this.body as any).entity = this;// Set up the composite ship
        this.graphic = this.container;
        this.createShipParts(config);
        this.initializeShield(config);
        this.setupControls();
    } public get isDestroyed(): boolean {
        return this._isDestroyed;
    } public get stats(): {
        shield: { current: number; max: number; regen: number; regenCap: number };
        armor: { current: number; max: number; regen: number; regenCap: number };
        hull: { current: number; max: number; regen: number; regenCap: number };
        power: { current: number; max: number; regen: number; regenCap: number };
        torque: number;
        acceleration: number;
    } {
        return {
            shield: {
                current: this._stats.shields,
                max: this._stats.shieldCap,
                regen: this._stats.shieldRegen,
                regenCap: this._stats.shieldCap
            },
            armor: {
                current: this._stats.armor,
                max: this._stats.armorCap,
                regen: this._stats.armorRegen,
                regenCap: this._stats.armorCap
            },
            hull: {
                current: this._stats.hull,
                max: this._stats.hullCap,
                regen: this._stats.hullRegen,
                regenCap: this._stats.hullCap
            },
            power: {
                current: this._stats.power,
                max: this._stats.powerCap,
                regen: this._stats.powerRegen,
                regenCap: this._stats.powerCap
            },
            torque: this._stats.torque,
            acceleration: this._stats.acceleration
        };
    } public destroy(): { body: Matter.Body, graphic: PIXI.Container }[] {
        if (this._isDestroyed) return [];
        this._isDestroyed = true;

        // Create individual physics bodies for each part
        const destroyedParts: { body: Matter.Body, graphic: PIXI.Container }[] = [];

        this.shipParts.forEach(partInstance => {
            if (!partInstance.isDestroyed) {
                const part = partInstance.part;
                const graphic = part.graphic;                // Create a physics body for the part with realistic properties
                const partBody = Matter.Bodies.fromVertices(
                    this.body.position.x + graphic.position.x,
                    this.body.position.y + graphic.position.y,
                    [part.getVertices()],
                    {
                        friction: 0.1,
                        frictionAir: 0.03, // Slightly more air resistance to slow them down
                        restitution: 0.4, // Less bouncy
                        mass: 0.5 // Slightly heavier for more stable movement
                    }
                );// Apply realistic random velocity and rotation for destruction effect
                const explosionStrength = 0.008; // Much smaller force for realistic physics
                const force = {
                    x: (Math.random() - 0.5) * explosionStrength,
                    y: (Math.random() - 0.5) * explosionStrength
                };
                Matter.Body.applyForce(partBody, partBody.position, force);

                // Set initial velocity for more immediate effect
                const initialVelocity = {
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 2
                };
                Matter.Body.setVelocity(partBody, initialVelocity);
                Matter.Body.setAngularVelocity(partBody, (Math.random() - 0.5) * 0.3);// Clone the original graphics for the destroyed part
                const partGraphic = new PIXI.Container();

                // Create a simplified version of the original part graphics
                const simpleGraphic = new PIXI.Graphics();
                const vertices = part.getVertices();

                // Get the ship color for visual consistency
                const colorMap = {
                    'red': 0xFF3333,
                    'blue': 0x3333FF,
                    'green': 0x33FF33,
                    'orange': 0xFF9933
                };
                const partColor = colorMap[this.config.color] || 0xFFFFFF;

                // Draw the part shape with proper colors
                simpleGraphic.beginFill(partColor, 0.8);
                simpleGraphic.lineStyle(1, partColor, 1);

                if (vertices.length > 0) {
                    simpleGraphic.moveTo(vertices[0].x, vertices[0].y);
                    for (let i = 1; i < vertices.length; i++) {
                        simpleGraphic.lineTo(vertices[i].x, vertices[i].y);
                    }
                    simpleGraphic.lineTo(vertices[0].x, vertices[0].y);
                }
                simpleGraphic.endFill();

                partGraphic.addChild(simpleGraphic);

                // Set initial position
                partGraphic.position.set(partBody.position.x, partBody.position.y);
                partGraphic.rotation = partBody.angle;

                destroyedParts.push({ body: partBody, graphic: partGraphic });
                partInstance.isDestroyed = true;
                partInstance.body = partBody;
            }
        });

        return destroyedParts;
    }

    private createShipVertices(size: number): Array<{ x: number; y: number }> {
        return [
            { x: size, y: 0 },
            { x: size / 2, y: -size / 2 },
            { x: -size / 2, y: -size / 2 },
            { x: -size, y: 0 },
            { x: -size / 2, y: size / 2 },
            { x: size / 2, y: size / 2 }
        ];
    } private createShipParts(config: PlayerConfig) {
        // Remove existing parts
        this.shipParts = [];
        this.container.removeChildren();

        const parts: { component: ShipPart, key: string }[] = [];        // Helper function to add a part if it's enabled
        const useDetailed = config.gameMode === 'test';
        const addPartIfEnabled = (partKey: string, partComponent: () => ShipPart) => {
            if (!config.enabledParts || config.enabledParts[partKey] !== false) {
                const part = partComponent();
                // Enable detailed rendering if in test mode
                if (useDetailed && part.setRenderingMode) {
                    part.setRenderingMode(true);
                }
                parts.push({ component: part, key: partKey });
            }
        };

        // Create ship parts based on configuration
        switch (config.shipType) {
            case 'razorInterceptor':
                addPartIfEnabled('razorInterceptor', () => new ShipPart(ShipComponents.razorInterceptor(config.color)));
                addPartIfEnabled('interceptorWings', () => new ShipPart(ShipComponents.interceptorWings(config.color)));
                addPartIfEnabled('interceptorEngine', () => new ShipPart(ShipComponents.interceptorEngine(config.color)));
                break;

            case 'strikeInterceptor':
                addPartIfEnabled('strikeInterceptor', () => new ShipPart(ShipComponents.strikeInterceptor(config.color)));
                addPartIfEnabled('interceptorWings', () => new ShipPart(ShipComponents.interceptorWings(config.color)));
                addPartIfEnabled('interceptorEngine', () => new ShipPart(ShipComponents.interceptorEngine(config.color)));
                break;

            case 'phantomInterceptor':
                addPartIfEnabled('phantomInterceptor', () => new ShipPart(ShipComponents.phantomInterceptor(config.color)));
                addPartIfEnabled('interceptorWings', () => new ShipPart(ShipComponents.interceptorWings(config.color)));
                addPartIfEnabled('interceptorEngine', () => new ShipPart(ShipComponents.interceptorEngine(config.color)));
                break;

            case 'capital':
                addPartIfEnabled('capitalShip', () => new ShipPart(ShipComponents.capitalShip(config.color)));
                addPartIfEnabled('quadEngine', () => new ShipPart(ShipComponents.quadEngine(config.color)));
                addPartIfEnabled('sideCannons', () => new ShipPart(ShipComponents.sideCannons(config.color)));
                break;

            case 'assault':
                addPartIfEnabled('assaultShip', () => new ShipPart(ShipComponents.assaultShip(config.color)));
                addPartIfEnabled('assaultWings', () => new ShipPart(ShipComponents.assaultWings(config.color)));
                addPartIfEnabled('dualEngine', () => new ShipPart(ShipComponents.dualEngine(config.color)));
                break;

            case 'compact':
            default:
                addPartIfEnabled('compactShip', () => new ShipPart(ShipComponents.compactShip(config.color)));
                addPartIfEnabled('standardWings', () => new ShipPart(ShipComponents.standardWings(config.color)));
                addPartIfEnabled('vectorThrusters', () => new ShipPart(ShipComponents.vectorThrusters(config.color)));
                break;
        }

        // Add parts to container and initialize ShipPartInstances
        parts.forEach(({ component }) => {
            this.container.addChild(component.graphic);
            this.shipParts.push({
                part: component,
                body: this.body,
                isDestroyed: false
            });
        });
    } private setupControls() {
        window.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.input.up = true;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.input.down = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.input.left = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.input.right = true;
                    break;
                case 'Space':
                    this.input.fire = true;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.input.afterburner = true;
                    break;
            }
        }); window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.input.up = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.input.down = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.input.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.input.right = false;
                    break;
                case 'Space':
                    this.input.fire = false;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.input.afterburner = false;
                    break;
            }
        });
    }

    public setProjectileCallback(callback: (projectile: Projectile) => void): void {
        this.onProjectileCreated = callback;
    }

    private getProjectileConfig(): ProjectileConfig {
        // Base projectile config that varies by ship type
        const baseConfig: ProjectileConfig = {
            speed: 8,
            lifetime: 2000, // 2 seconds
            damage: 10,
            color: 0x00ff00, // Green by default
            size: 2
        };

        // Adjust based on ship type
        switch (this.config.shipType) {
            case 'razorInterceptor':
            case 'strikeInterceptor':
            case 'phantomInterceptor':
                return {
                    ...baseConfig,
                    speed: 10,
                    damage: 8,
                    color: 0x00ffff, // Cyan for interceptors
                    size: 1.5
                };
            case 'assault':
                return {
                    ...baseConfig,
                    speed: 6,
                    damage: 15,
                    color: 0xff4444, // Red for assault
                    size: 3
                };
            case 'capital':
                return {
                    ...baseConfig,
                    speed: 4,
                    damage: 25,
                    color: 0xffaa00, // Orange for capital
                    size: 4
                };
            case 'compact':
            default:
                return baseConfig;
        }
    }

    private shoot(): void {
        const currentTime = Date.now();
        if (currentTime - this.lastFireTime < this.fireRate) {
            return; // Rate limiting
        }

        this.lastFireTime = currentTime;

        // Calculate projectile spawn position (at the front of the ship)
        const shipAngle = this.body.angle;
        const spawnDistance = 25; // Distance from ship center
        const spawnX = this.body.position.x + Math.cos(shipAngle) * spawnDistance;
        const spawnY = this.body.position.y + Math.sin(shipAngle) * spawnDistance;

        // Create projectile
        const projectileConfig = this.getProjectileConfig();
        const projectile = new Projectile(spawnX, spawnY, shipAngle, projectileConfig);

        // Notify engine about new projectile
        if (this.onProjectileCreated) {
            this.onProjectileCreated(projectile);
        }
    }

    public getSpeed(): number {
        return Math.sqrt(
            this.body.velocity.x * this.body.velocity.x +
            this.body.velocity.y * this.body.velocity.y
        );
    }

    public getAcceleration(): number {
        return this.accelerationValue;
    } public isAfterburnerActive(): boolean {
        return this.input.afterburner && this._stats.power > 0;
    } public takeDamage(amount: number): void {
        // Use the Stats class damage system
        const isDestroyed = this._stats.applyDamage(amount);
        if (isDestroyed) {
            this._isDestroyed = true;
        }
    }

    public update() {
        if (this._isDestroyed) {
            // Update individual part graphics when destroyed
            this.shipParts.forEach(partInstance => {
                if (partInstance.isDestroyed && partInstance.body) {
                    partInstance.part.graphic.position.set(
                        partInstance.body.position.x,
                        partInstance.body.position.y
                    );
                    partInstance.part.graphic.rotation = partInstance.body.angle;
                }
            });
            return;
        }

        // Rotation
        if (this.input.left) {
            Matter.Body.setAngularVelocity(this.body, -this.rotationSpeed);
        } else if (this.input.right) {
            Matter.Body.setAngularVelocity(this.body, this.rotationSpeed);
        } else {
            Matter.Body.setAngularVelocity(this.body, 0);
        }        // Thrust
        if (this.input.up || this.input.down) {
            const angle = this.body.angle;
            const direction = this.input.up ? 1 : -this.reverseMultiplier;            // Calculate thrust multiplier based on afterburner
            let thrustMultiplier = 1;
            let thrustPowerCost = 5; // Base power cost per second for thrust

            if (this.input.afterburner && this._stats.power > 0) {
                thrustMultiplier = this.afterburnerThrust;
                thrustPowerCost = this.afterburnerPowerCost;

                // Consume power for afterburner (scaled by frame rate)
                const powerConsumption = thrustPowerCost / 60; // Per frame at 60fps
                this._stats.consumePower(powerConsumption);
            } else {
                // Regular thrust power consumption
                const powerConsumption = thrustPowerCost / 60;
                this._stats.consumePower(powerConsumption);
            }

            // Apply thrust force with multiplier
            Matter.Body.applyForce(this.body, this.body.position, {
                x: Math.cos(angle) * this.thrust * direction * thrustMultiplier,
                y: Math.sin(angle) * this.thrust * direction * thrustMultiplier
            });// Update engine parts with afterburner state
            const isAfterburnerActive = this.input.afterburner && this._stats.power > 0;
            this.updateEnginePartsAfterburner(isAfterburnerActive, thrustMultiplier / this.afterburnerThrust);

            // Apply a visual pulsing effect to engine parts during afterburner
            if (isAfterburnerActive) {
                this.updateEnginePartAnimations();
            }            // Limit maximum speed (afterburner can exceed normal max speed slightly)
            const velocity = this.body.velocity;
            const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y); const maxSpeedLimit = this.input.afterburner && this._stats.power > 0
                ? this.maxSpeed * 1.3  // INCREASED from 1.15 to 1.3 for better afterburner speed boost
                : this.maxSpeed;

            if (speed > maxSpeedLimit) {
                const ratio = maxSpeedLimit / speed;
                Matter.Body.setVelocity(this.body, {
                    x: velocity.x * ratio,
                    y: velocity.y * ratio
                });
            }
        } else {
            // Reset engine effects when not thrusting
            this.updateEnginePartsAfterburner(false, 0);
        }

        // Update engine part animations regardless of thrust state
        this.updateEnginePartAnimations();        // Stats regeneration system using the new Stats class
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastRegenTime;

        if (deltaTime >= 100) { // Update every 100ms for smooth regeneration
            // Use the Stats class update method for all regeneration
            this._stats.update(deltaTime);
            this.lastRegenTime = currentTime;
        }

        // Shooting (with power consumption)
        if (this.input.fire) {
            // Shooting consumes power using the Stats class method
            const shotPowerCost = 8;
            if (this._stats.consumePower(shotPowerCost)) {
                this.shoot();
            }
        }// Update graphics to match physics body
        this.graphic.position.set(this.body.position.x, this.body.position.y);
        this.graphic.rotation = this.body.angle;

        // Always update engine animations for smooth transitions between states
        this.updateEnginePartAnimations();        // Compute speed and acceleration
        const currentSpeed = this.getSpeed();
        this.accelerationValue = (currentSpeed - this.lastSpeed) * 60; // approximate per second

        // Cap acceleration at reasonable levels for better game balance
        const maxAcceleration = 800; // Maximum acceleration value
        this.accelerationValue = Math.max(-maxAcceleration, Math.min(maxAcceleration, this.accelerationValue));

        this.lastSpeed = currentSpeed;
    } private updateEnginePartsAfterburner(isActive: boolean, intensity: number): void {
        // Find all engine parts and update their afterburner state
        this.shipParts.forEach(partInstance => {
            if (partInstance.part.getPartType() === PartType.ENGINE) {
                partInstance.part.setAfterburnerState(isActive, intensity);
            }
        });
    }

    private initializeShield(config: PlayerConfig): void {
        // Only add shield if ship has shield generator or is capital/assault type
        const hasShieldGenerator = config.enabledParts?.shieldGenerator;
        const hasShieldCapability = ['capital', 'assault', 'phantomInterceptor'].includes(config.shipType || '');

        if (hasShieldGenerator || hasShieldCapability) {
            const shieldConfig: ShieldConfig = {
                radius: config.size * 1.8, // Shield extends beyond ship
                strength: this.getShieldStrengthForShipType(config.shipType),
                rechargeRate: this.getShieldRechargeForShipType(config.shipType),
                rechargeDelay: 3000, // 3 seconds delay before recharge
                color: this.getShieldColorForShipType(config.shipType),
                opacity: 0.4
            };

            this.shield = new ShieldBubble(shieldConfig);
            this.container.addChild(this.shield.graphic);
        }
    }

    private getShieldStrengthForShipType(shipType?: string): number {
        switch (shipType) {
            case 'capital': return 200;
            case 'assault': return 150;
            case 'phantomInterceptor': return 100;
            case 'strikeInterceptor': return 80;
            case 'razorInterceptor': return 60;
            default: return 100;
        }
    }

    private getShieldRechargeForShipType(shipType?: string): number {
        switch (shipType) {
            case 'capital': return 20; // 20 points per second
            case 'assault': return 15;
            case 'phantomInterceptor': return 25; // Fast recharge for stealth
            case 'strikeInterceptor': return 18;
            case 'razorInterceptor': return 12;
            default: return 15;
        }
    }

    private getShieldColorForShipType(shipType?: string): number {
        switch (shipType) {
            case 'capital': return 0x0088ff; // Blue
            case 'assault': return 0xff4444; // Red
            case 'phantomInterceptor': return 0x8844ff; // Purple
            case 'strikeInterceptor': return 0x44ff44; // Green
            case 'razorInterceptor': return 0xffff44; // Yellow
            default: return 0x00ffff; // Cyan
        }
    }

    private updateEnginePartAnimations(): void {
        // Update animation for all engine parts
        this.shipParts.forEach(partInstance => {
            if (partInstance.part.getPartType() === PartType.ENGINE) {
                // Pass deltaTime (1/60 second is a reasonable approximation for each frame)
                const deltaTime = 1 / 60;
                partInstance.part.updateTrailEffects(deltaTime);
            }
        });
    }
}
