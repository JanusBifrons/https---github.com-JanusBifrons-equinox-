import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';

export interface PlayerConfig {
    thrust: number;
    rotationSpeed: number;
    maxSpeed: number;
    frictionAir: number;
    color: number;
    size: number;
    reverseMultiplier: number;
}

export class Player {
    public body: Matter.Body;
    public graphic: PIXI.Graphics;
    private thrust: number;
    private rotationSpeed: number;
    private maxSpeed: number;
    private reverseMultiplier: number;
    private input = {
        up: false,
        down: false,
        left: false,
        right: false,
        fire: false
    };

    constructor(x: number, y: number, config: PlayerConfig) {
        this.thrust = config.thrust;
        this.rotationSpeed = config.rotationSpeed;
        this.maxSpeed = config.maxSpeed;
        this.reverseMultiplier = config.reverseMultiplier;

        // Create triangular ship body
        this.body = Matter.Bodies.polygon(x, y, 3, config.size, {
            friction: 0,
            frictionAir: config.frictionAir,
            restitution: 0.8,
            mass: 1
        });

        // Create ship graphics
        this.graphic = new PIXI.Graphics();
        this.graphic.beginFill(config.color);
        this.graphic.lineStyle(2, config.color, 1);
        this.graphic.moveTo(config.size, 0);
        this.graphic.lineTo(-config.size / 2, -config.size / 2);
        this.graphic.lineTo(-config.size / 2, config.size / 2);
        this.graphic.lineTo(config.size, 0);
        this.graphic.endFill();

        // Setup input handlers
        this.setupControls();
    }

    private setupControls() {
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
            }
        });

        window.addEventListener('keyup', (e) => {
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
            }
        });
    }

    public update() {
        // Rotation
        if (this.input.left) {
            Matter.Body.setAngularVelocity(this.body, -this.rotationSpeed);
        } else if (this.input.right) {
            Matter.Body.setAngularVelocity(this.body, this.rotationSpeed);
        } else {
            Matter.Body.setAngularVelocity(this.body, 0);
        }

        // Thrust
        if (this.input.up || this.input.down) {
            const angle = this.body.angle;
            const direction = this.input.up ? 1 : -this.reverseMultiplier; // Reverse is half power

            // Apply thrust force
            Matter.Body.applyForce(this.body, this.body.position, {
                x: Math.cos(angle) * this.thrust * direction,
                y: Math.sin(angle) * this.thrust * direction
            });

            // Limit maximum speed
            const velocity = this.body.velocity;
            const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
            if (speed > this.maxSpeed) {
                const ratio = this.maxSpeed / speed;
                Matter.Body.setVelocity(this.body, {
                    x: velocity.x * ratio,
                    y: velocity.y * ratio
                });
            }
        }

        // Update graphics to match physics body
        this.graphic.position.set(this.body.position.x, this.body.position.y);
        this.graphic.rotation = this.body.angle;
    }
}
