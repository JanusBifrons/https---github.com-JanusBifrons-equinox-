import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';

export abstract class Entity {
    protected graphics: PIXI.Graphics;
    protected body!: Matter.Body; // Will be initialized by child classes

    constructor(x: number, y: number) {
        this.graphics = new PIXI.Graphics();
        this.graphics.position.set(x, y);
    }

    public update(): void {
        // Update graphics position and rotation to match physics body
        if (this.body && this.graphics) {
            this.graphics.position.set(this.body.position.x, this.body.position.y);
            this.graphics.rotation = this.body.angle;
        }
    }

    public getGraphics(): PIXI.Graphics {
        return this.graphics;
    }

    public getBody(): Matter.Body {
        return this.body;
    }
}
