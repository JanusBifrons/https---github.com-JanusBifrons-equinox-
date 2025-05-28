import * as PIXI from 'pixi.js';
import { SpriteRenderer, DetailedPartConfig } from './SpriteRenderer';
import { DetailedShipParts } from './DetailedShipParts';

export type ShipColor = 'red' | 'green' | 'blue' | 'orange';

export enum PartType {
    COCKPIT,
    WING,
    ENGINE,
    ARMOR,
    WEAPON,
    THRUSTER
}

export interface ShipPartConfig {
    type: PartType;
    color: ShipColor;
    position: { x: number, y: number };
    rotation: number;
    vertices: Array<{ x: number, y: number }>;
    anchor?: { x: number, y: number };
    effects?: {
        glow?: boolean;
        trail?: boolean;
        shield?: boolean;
    };
}

export class ShipPart {
    public graphic: PIXI.Container;
    private config: ShipPartConfig;
    private baseGraphic: PIXI.Graphics;
    private effectsContainer: PIXI.Container;
    private highlightGraphic: PIXI.Graphics;
    private detailsGraphic: PIXI.Graphics;
    private useDetailedRendering: boolean = true; // Toggle for enhanced rendering

    constructor(config: ShipPartConfig, useDetailed: boolean = true) {
        this.config = config;
        this.useDetailedRendering = useDetailed;
        this.graphic = new PIXI.Container();
        this.baseGraphic = new PIXI.Graphics();
        this.highlightGraphic = new PIXI.Graphics();
        this.detailsGraphic = new PIXI.Graphics();
        this.effectsContainer = new PIXI.Container();

        // Add layers in correct order
        this.graphic.addChild(this.baseGraphic);
        this.graphic.addChild(this.highlightGraphic);
        this.graphic.addChild(this.detailsGraphic);
        this.graphic.addChild(this.effectsContainer);

        this.createGraphics();
    }

    public getVertices(): { x: number, y: number }[] {
        return this.config.vertices;
    }

    private getColorValue(color: ShipColor): { base: number, light: number, dark: number, glow: number } {
        switch (color) {
            case 'red':
                return {
                    base: 0xFF3333,
                    light: 0xFF6666,
                    dark: 0xCC0000,
                    glow: 0xFF0000
                };
            case 'green':
                return {
                    base: 0x33FF33,
                    light: 0x66FF66,
                    dark: 0x00CC00,
                    glow: 0x00FF00
                };
            case 'blue':
                return {
                    base: 0x3333FF,
                    light: 0x6666FF,
                    dark: 0x0000CC,
                    glow: 0x0000FF
                };
            case 'orange':
                return {
                    base: 0xFF9933,
                    light: 0xFFBB66,
                    dark: 0xCC6600,
                    glow: 0xFF6600
                };
        }
    } private createGraphics() {
        if (this.useDetailedRendering) {
            this.createDetailedGraphics();
        } else {
            this.createLegacyGraphics();
        }

        // Set position and rotation
        this.graphic.position.set(this.config.position.x, this.config.position.y);
        this.graphic.rotation = this.config.rotation;

        // Set anchor point if provided
        if (this.config.anchor) {
            this.graphic.pivot.set(this.config.anchor.x, this.config.anchor.y);
        }
    }

    private createDetailedGraphics() {
        // Clear existing graphics
        this.graphic.removeChildren();

        // Get detailed part configuration based on part type and config
        const detailedConfig = this.getDetailedPartConfig();

        if (detailedConfig) {
            // Use new sprite-like rendering system
            const detailedGraphic = SpriteRenderer.renderDetailedPart(detailedConfig, this.config.color);
            this.graphic.addChild(detailedGraphic);
        } else {
            // Fallback to legacy rendering
            this.createLegacyGraphics();
        }
    }

    private getDetailedPartConfig(): DetailedPartConfig | null {
        // Map current part configurations to detailed configurations
        // This is based on the part's vertices and type to determine which detailed config to use
        const vertices = this.config.vertices;

        // Determine part type based on vertex count and shape
        if (vertices.length === 6 && this.isCompactShipShape(vertices)) {
            return DetailedShipParts.compactShip();
        } else if (vertices.length >= 8 && this.isAssaultShipShape(vertices)) {
            return DetailedShipParts.assaultShip();
        } else if (vertices.length >= 8 && this.isCapitalShipShape(vertices)) {
            return DetailedShipParts.capitalShip();
        } else if (this.config.type === PartType.WING && this.isStandardWingShape(vertices)) {
            return DetailedShipParts.standardWings();
        } else if (this.config.type === PartType.ENGINE && this.isDualEngineShape(vertices)) {
            return DetailedShipParts.dualEngine();
        } else if (this.isRazorInterceptorShape(vertices)) {
            return DetailedShipParts.razorInterceptor();
        }

        return null; // Fallback to legacy rendering
    }

    private isCompactShipShape(vertices: { x: number; y: number }[]): boolean {
        // Check if this matches the compact ship profile
        return vertices.length === 6 &&
            vertices[0].y < 0 && vertices[2].x > 15 &&
            Math.abs(vertices[vertices.length - 1].x + 10) < 5;
    }

    private isAssaultShipShape(vertices: { x: number; y: number }[]): boolean {
        // Check if this matches the assault ship profile
        return vertices.length >= 8 &&
            Math.max(...vertices.map(v => Math.abs(v.x))) > 20 &&
            Math.max(...vertices.map(v => Math.abs(v.y))) > 20;
    }

    private isCapitalShipShape(vertices: { x: number; y: number }[]): boolean {
        // Check if this matches the capital ship profile
        return vertices.length >= 8 &&
            Math.max(...vertices.map(v => Math.abs(v.x))) > 30 &&
            Math.max(...vertices.map(v => Math.abs(v.y))) > 30;
    }

    private isStandardWingShape(vertices: { x: number; y: number }[]): boolean {
        // Check if this matches standard wing profile
        return this.config.type === PartType.WING &&
            Math.max(...vertices.map(v => Math.abs(v.y))) > 20;
    }

    private isDualEngineShape(vertices: { x: number; y: number }[]): boolean {
        // Check if this matches dual engine profile
        return this.config.type === PartType.ENGINE &&
            vertices.some(v => v.x < -15);
    }

    private isRazorInterceptorShape(vertices: { x: number; y: number }[]): boolean {
        // Check if this matches razor interceptor profile
        return vertices.length >= 7 && vertices.length <= 8 &&
            Math.max(...vertices.map(v => v.x)) > 20 &&
            Math.max(...vertices.map(v => Math.abs(v.y))) < 20;
    }

    private createLegacyGraphics() {
        const colors = this.getColorValue(this.config.color);

        // Clear previous graphics
        this.baseGraphic.clear();
        this.highlightGraphic.clear();
        this.detailsGraphic.clear();
        this.effectsContainer.removeChildren();

        // Re-add graphics containers
        this.graphic.addChild(this.baseGraphic);
        this.graphic.addChild(this.highlightGraphic);
        this.graphic.addChild(this.detailsGraphic);
        this.graphic.addChild(this.effectsContainer);

        // Draw base metallic shape with gradient
        this.baseGraphic.beginFill(colors.base, 0.9);
        this.baseGraphic.lineStyle(2, colors.dark, 1);

        // Draw using vertices
        if (this.config.vertices.length > 0) {
            this.baseGraphic.moveTo(this.config.vertices[0].x, this.config.vertices[0].y);
            for (let i = 1; i < this.config.vertices.length; i++) {
                this.baseGraphic.lineTo(this.config.vertices[i].x, this.config.vertices[i].y);
            }
            this.baseGraphic.lineTo(this.config.vertices[0].x, this.config.vertices[0].y);
        }
        this.baseGraphic.endFill();

        // Add metallic highlights
        this.highlightGraphic.lineStyle(1, colors.light, 0.7);
        // Draw highlight lines along edges
        for (let i = 0; i < this.config.vertices.length; i++) {
            const start = this.config.vertices[i];
            const end = this.config.vertices[(i + 1) % this.config.vertices.length];

            // Draw highlight line slightly offset inward
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const normalX = -dy / length;
            const normalY = dx / length;

            this.highlightGraphic.moveTo(
                start.x + normalX,
                start.y + normalY
            );
            this.highlightGraphic.lineTo(
                end.x + normalX,
                end.y + normalY
            );
        }

        // Add part-specific details
        this.addPartDetails(colors);

        // Add effects based on part type
        this.addPartEffects(colors);
    } private addPartDetails(colors: { base: number, light: number, dark: number, glow: number }) {
        switch (this.config.type) {
            case PartType.COCKPIT:
                // Main viewport with metallic frame
                this.detailsGraphic.lineStyle(2, colors.dark, 0.8);
                this.detailsGraphic.beginFill(colors.dark, 0.4);
                this.detailsGraphic.drawEllipse(5, 0, 12, 8);
                this.detailsGraphic.endFill();

                // Viewport glass shine
                this.detailsGraphic.lineStyle(1, colors.light, 0.6);
                this.detailsGraphic.moveTo(-5, -4);
                this.detailsGraphic.quadraticCurveTo(5, -8, 15, -2);

                // Detailed panel work
                this.detailsGraphic.lineStyle(1, colors.light, 0.5);
                // Upper panels
                this.detailsGraphic.moveTo(-15, -18);
                this.detailsGraphic.lineTo(10, -18);
                this.detailsGraphic.moveTo(-12, -15);
                this.detailsGraphic.lineTo(8, -15);
                // Lower panels
                this.detailsGraphic.moveTo(-15, 18);
                this.detailsGraphic.lineTo(10, 18);
                this.detailsGraphic.moveTo(-12, 15);
                this.detailsGraphic.lineTo(8, 15);

                // Side details
                this.detailsGraphic.lineStyle(1, colors.dark, 0.7);
                [-1, 1].forEach(side => {
                    const y = 10 * side;
                    this.detailsGraphic.moveTo(-8, y);
                    this.detailsGraphic.lineTo(-15, y + 2 * side);
                    this.detailsGraphic.lineTo(-18, y + 5 * side);
                });
                break;

            case PartType.ENGINE:
                // Main engine core with gradient
                this.detailsGraphic.beginFill(colors.glow, 0.4);
                this.detailsGraphic.drawCircle(-20, 0, 6);
                this.detailsGraphic.endFill();
                this.detailsGraphic.beginFill(colors.light, 0.3);
                this.detailsGraphic.drawCircle(-20, 0, 4);
                this.detailsGraphic.endFill();

                // Engine housing details
                this.detailsGraphic.lineStyle(1.5, colors.dark, 0.8);
                this.detailsGraphic.moveTo(-15, -10);
                this.detailsGraphic.lineTo(-25, -10);
                this.detailsGraphic.lineTo(-28, -5);
                this.detailsGraphic.lineTo(-28, 5);
                this.detailsGraphic.lineTo(-25, 10);
                this.detailsGraphic.lineTo(-15, 10);

                // Cooling vents with gradient
                this.detailsGraphic.lineStyle(1, colors.light, 0.5);
                for (let i = -3; i <= 3; i++) {
                    const y = i * 3;
                    // Vent frame
                    this.detailsGraphic.moveTo(-26, y - 1);
                    this.detailsGraphic.lineTo(-22, y - 1);
                    this.detailsGraphic.moveTo(-26, y + 1);
                    this.detailsGraphic.lineTo(-22, y + 1);
                    // Vent glow
                    this.detailsGraphic.lineStyle(1, colors.glow, 0.3);
                    this.detailsGraphic.moveTo(-26, y);
                    this.detailsGraphic.lineTo(-22, y);
                }
                break;

            case PartType.WING:
                // Wing panel framework
                this.detailsGraphic.lineStyle(1.5, colors.dark, 0.7);
                this.detailsGraphic.moveTo(-25, 0);
                this.detailsGraphic.lineTo(25, 0);

                // Detailed panel work
                this.detailsGraphic.lineStyle(1, colors.light, 0.4);
                [-1, 1].forEach(side => {
                    for (let i = 1; i <= 3; i++) {
                        const y = i * 8 * side;
                        // Main panel lines
                        this.detailsGraphic.moveTo(-22, y);
                        this.detailsGraphic.lineTo(22, y);
                        // Connection details
                        this.detailsGraphic.moveTo(-20, y - 2 * side);
                        this.detailsGraphic.lineTo(-20, y + 2 * side);
                        this.detailsGraphic.moveTo(20, y - 2 * side);
                        this.detailsGraphic.lineTo(20, y + 2 * side);
                    }
                });

                // Edge reinforcement details
                this.detailsGraphic.lineStyle(1, colors.dark, 0.6);
                [-1, 1].forEach(side => {
                    const y = 25 * side;
                    for (let x = -20; x <= 20; x += 5) {
                        this.detailsGraphic.moveTo(x, y);
                        this.detailsGraphic.lineTo(x + 2, y - 2 * side);
                    }
                });
                break;

            case PartType.WEAPON:
                // Main barrel structure
                this.detailsGraphic.lineStyle(2, colors.dark, 0.8);
                [-1, 1].forEach(side => {
                    const y = 6 * side;
                    this.detailsGraphic.moveTo(15, y);
                    this.detailsGraphic.lineTo(28, y);
                });

                // Barrel details and reinforcement
                this.detailsGraphic.lineStyle(1, colors.light, 0.5);
                for (let x = 16; x <= 26; x += 4) {
                    // Cooling rings
                    this.detailsGraphic.drawCircle(x, -6, 1);
                    this.detailsGraphic.drawCircle(x, 6, 1);
                }

                // Housing details
                this.detailsGraphic.lineStyle(1, colors.dark, 0.6);
                [-1, 1].forEach(side => {
                    const y = 4 * side;
                    this.detailsGraphic.moveTo(15, y);
                    this.detailsGraphic.lineTo(10, y);
                    this.detailsGraphic.lineTo(8, y + 2 * side);
                });

                // Energy conduits
                this.detailsGraphic.lineStyle(1, colors.glow, 0.3);
                this.detailsGraphic.moveTo(15, -2);
                this.detailsGraphic.lineTo(25, -2);
                this.detailsGraphic.moveTo(15, 2);
                this.detailsGraphic.lineTo(25, 2);
                break;
        }
    }

    private addPartEffects(colors: { base: number, light: number, dark: number, glow: number }) {
        if (this.config.effects?.glow) {
            // Create layered glow effect
            const innerGlow = new PIXI.Graphics();
            const outerGlow = new PIXI.Graphics();

            // Intense inner glow
            innerGlow.beginFill(colors.glow, 0.3);
            innerGlow.drawCircle(0, 0, 15);
            innerGlow.endFill();

            // Soft outer glow
            outerGlow.beginFill(colors.glow, 0.1);
            outerGlow.drawCircle(0, 0, 30);
            outerGlow.endFill();

            this.effectsContainer.addChild(outerGlow);
            this.effectsContainer.addChild(innerGlow);

            // Sophisticated pulsing animation
            const pulseTime = 2;
            let elapsed = 0;
            const ticker = PIXI.Ticker.shared;
            ticker.add(() => {
                elapsed += ticker.deltaTime / 60;

                // Inner glow pulses more intensely
                const innerScale = 0.9 + Math.sin(elapsed / pulseTime) * 0.15;
                innerGlow.scale.set(innerScale);
                innerGlow.alpha = 0.3 + Math.sin(elapsed / pulseTime) * 0.1;

                // Outer glow pulses more slowly and subtly
                const outerScale = 0.95 + Math.sin(elapsed / (pulseTime * 1.5)) * 0.1;
                outerGlow.scale.set(outerScale);
                outerGlow.alpha = 0.1 + Math.sin(elapsed / (pulseTime * 2)) * 0.05;
            });
        } if (this.config.effects?.trail) {
            // Create multi-layered engine trail
            const trailCore = new PIXI.Graphics();
            const trailMid = new PIXI.Graphics();
            const trailOuter = new PIXI.Graphics();

            // Bright core
            trailCore.beginFill(colors.light, 0.4);
            trailCore.drawEllipse(-20, 0, 4, 3);
            trailCore.endFill();

            // Mid layer with color
            trailMid.beginFill(colors.glow, 0.3);
            trailMid.drawEllipse(-23, 0, 8, 5);
            trailMid.endFill();

            // Outer diffuse glow
            trailOuter.beginFill(colors.glow, 0.15);
            trailOuter.drawEllipse(-26, 0, 12, 7);
            trailOuter.endFill();

            // Add all layers
            this.effectsContainer.addChild(trailOuter);
            this.effectsContainer.addChild(trailMid);
            this.effectsContainer.addChild(trailCore);

            // Sophisticated animation
            let elapsed = 0;
            const ticker = PIXI.Ticker.shared;
            ticker.add(() => {
                elapsed += ticker.deltaTime / 60;

                // Core flickers rapidly
                trailCore.alpha = 0.4 + Math.random() * 0.2;

                // Mid layer pulses
                const midPulse = 0.3 + Math.sin(elapsed * 10) * 0.1;
                trailMid.alpha = midPulse;

                // Outer layer flows
                const outerFlow = 0.15 + Math.sin(elapsed * 5) * 0.05;
                trailOuter.alpha = outerFlow;

                // Subtle size variations
                const sizeVar = 1 + Math.sin(elapsed * 15) * 0.1;
                trailCore.scale.set(sizeVar);
                trailMid.scale.set(1 + Math.sin(elapsed * 7) * 0.05);
            });
        }

        if (this.config.effects?.shield) {
            const shield = new PIXI.Graphics();
            shield.lineStyle(2, colors.light, 0.3);
            shield.drawCircle(0, 0, 40);
            this.effectsContainer.addChild(shield);

            // Add shield ripple effect
            let elapsed = 0;
            const ticker = PIXI.Ticker.shared;
            ticker.add(() => {
                elapsed += ticker.deltaTime / 60;
                shield.alpha = 0.2 + Math.sin(elapsed * 2) * 0.1;
            });
        }
    }

    // Method to toggle between detailed and legacy rendering
    public setRenderingMode(useDetailed: boolean) {
        this.useDetailedRendering = useDetailed;
        this.createGraphics();
    }

    // Method to create an isolated display of this part for testing
    public createTestDisplay(): PIXI.Container {
        const testContainer = new PIXI.Container();

        // Create a labeled version of the part for testing
        const partClone = new PIXI.Container();

        if (this.useDetailedRendering) {
            const detailedConfig = this.getDetailedPartConfig();
            if (detailedConfig) {
                const detailedGraphic = SpriteRenderer.renderDetailedPart(detailedConfig, this.config.color);
                partClone.addChild(detailedGraphic);
            }
        } else {
            // Clone the legacy graphics
            const colors = this.getColorValue(this.config.color);
            const legacyGraphic = new PIXI.Graphics();

            legacyGraphic.beginFill(colors.base, 0.9);
            legacyGraphic.lineStyle(2, colors.dark, 1);

            if (this.config.vertices.length > 0) {
                legacyGraphic.moveTo(this.config.vertices[0].x, this.config.vertices[0].y);
                for (let i = 1; i < this.config.vertices.length; i++) {
                    legacyGraphic.lineTo(this.config.vertices[i].x, this.config.vertices[i].y);
                }
                legacyGraphic.lineTo(this.config.vertices[0].x, this.config.vertices[0].y);
            }
            legacyGraphic.endFill();

            partClone.addChild(legacyGraphic);
        }
        // Add part type label
        const label = new PIXI.Text(PartType[this.config.type], {
            fontFamily: 'Press Start 2P',
            fontSize: 8,
            fill: 0xFFFFFF,
            stroke: 0x000000
        });
        label.anchor.set(0.5, 0);
        label.position.set(0, 40);

        // Add bounding box outline for testing
        const bounds = partClone.getBounds();
        const boundingBox = new PIXI.Graphics();
        boundingBox.lineStyle(1, 0x00FF00, 0.5);
        boundingBox.drawRect(
            bounds.x - partClone.x,
            bounds.y - partClone.y,
            bounds.width,
            bounds.height
        );

        testContainer.addChild(boundingBox);
        testContainer.addChild(partClone);
        testContainer.addChild(label);

        return testContainer;
    }
}

// Define advanced ship components based on sprite sheet
export const ShipComponents = {
    // Small Ships (Top Row)
    compactShip: (color: ShipColor): ShipPartConfig => ({
        type: PartType.COCKPIT,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            { x: 0, y: -15 },
            { x: 15, y: -10 },
            { x: 20, y: 0 },
            { x: 15, y: 10 },
            { x: 0, y: 15 },
            { x: -10, y: 0 }
        ],
        effects: { glow: true }
    }),

    // Medium Ships (Middle Row)
    assaultShip: (color: ShipColor): ShipPartConfig => ({
        type: PartType.COCKPIT,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            { x: 25, y: 0 },
            { x: 15, y: -20 },
            { x: 0, y: -25 },
            { x: -15, y: -20 },
            { x: -25, y: -10 },
            { x: -25, y: 10 },
            { x: -15, y: 20 },
            { x: 0, y: 25 },
            { x: 15, y: 20 },
            { x: 25, y: 0 }
        ],
        effects: { glow: true, shield: true }
    }),

    // Large Ships (Bottom Row)
    capitalShip: (color: ShipColor): ShipPartConfig => ({
        type: PartType.COCKPIT,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            { x: 35, y: 0 },
            { x: 25, y: -30 },
            { x: 0, y: -35 },
            { x: -25, y: -30 },
            { x: -35, y: -15 },
            { x: -35, y: 15 },
            { x: -25, y: 30 },
            { x: 0, y: 35 },
            { x: 25, y: 30 },
            { x: 35, y: 0 }
        ],
        effects: { glow: true, shield: true }
    }),

    // Wings
    standardWings: (color: ShipColor): ShipPartConfig => ({
        type: PartType.WING,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            { x: 15, y: -25 },
            { x: 25, y: -15 },
            { x: 25, y: 15 },
            { x: 15, y: 25 },
            { x: -15, y: 25 },
            { x: -25, y: 15 },
            { x: -25, y: -15 },
            { x: -15, y: -25 }
        ]
    }),

    assaultWings: (color: ShipColor): ShipPartConfig => ({
        type: PartType.WING,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            { x: 30, y: -20 },
            { x: 35, y: 0 },
            { x: 30, y: 20 },
            { x: -30, y: 20 },
            { x: -35, y: 0 },
            { x: -30, y: -20 }
        ]
    }),

    // Engines
    dualEngine: (color: ShipColor): ShipPartConfig => ({
        type: PartType.ENGINE,
        color,
        position: { x: -20, y: 0 },
        rotation: 0,
        vertices: [
            { x: 0, y: -12 },
            { x: -20, y: -12 },
            { x: -25, y: -6 },
            { x: -25, y: 6 },
            { x: -20, y: 12 },
            { x: 0, y: 12 }
        ],
        effects: { trail: true, glow: true }
    }),

    quadEngine: (color: ShipColor): ShipPartConfig => ({
        type: PartType.ENGINE,
        color,
        position: { x: -25, y: 0 },
        rotation: 0,
        vertices: [
            { x: 0, y: -20 },
            { x: -15, y: -20 },
            { x: -20, y: -10 },
            { x: -20, y: 10 },
            { x: -15, y: 20 },
            { x: 0, y: 20 }
        ],
        effects: { trail: true, glow: true }
    }),

    // Weapons
    sideCannons: (color: ShipColor): ShipPartConfig => ({
        type: PartType.WEAPON,
        color,
        position: { x: 10, y: 0 },
        rotation: 0,
        vertices: [
            { x: 20, y: -25 },
            { x: 25, y: -20 },
            { x: 25, y: 20 },
            { x: 20, y: 25 },
            { x: -20, y: 25 },
            { x: -25, y: 20 },
            { x: -25, y: -20 },
            { x: -20, y: -25 }
        ]
    }),

    // Thrusters
    vectorThrusters: (color: ShipColor): ShipPartConfig => ({
        type: PartType.THRUSTER,
        color,
        position: { x: -30, y: 0 },
        rotation: 0,
        vertices: [
            { x: 0, y: -8 },
            { x: -10, y: -8 },
            { x: -15, y: 0 },
            { x: -10, y: 8 },
            { x: 0, y: 8 }
        ],
        effects: { trail: true, glow: true }
    }),

    // Interceptor Ships (Top Row)
    razorInterceptor: (color: ShipColor): ShipPartConfig => ({
        type: PartType.COCKPIT,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            { x: 25, y: 0 },
            { x: 15, y: -12 },
            { x: 0, y: -15 },
            { x: -15, y: -10 },
            { x: -20, y: 0 },
            { x: -15, y: 10 },
            { x: 0, y: 15 },
            { x: 15, y: 12 }
        ],
        effects: { glow: true }
    }),

    strikeInterceptor: (color: ShipColor): ShipPartConfig => ({
        type: PartType.COCKPIT,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            { x: 20, y: 0 },
            { x: 12, y: -15 },
            { x: -5, y: -18 },
            { x: -18, y: -8 },
            { x: -18, y: 8 },
            { x: -5, y: 18 },
            { x: 12, y: 15 }
        ],
        effects: { glow: true }
    }),

    phantomInterceptor: (color: ShipColor): ShipPartConfig => ({
        type: PartType.COCKPIT,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            { x: 22, y: 0 },
            { x: 15, y: -8 },
            { x: 5, y: -12 },
            { x: -10, y: -15 },
            { x: -20, y: -5 },
            { x: -20, y: 5 },
            { x: -10, y: 15 },
            { x: 5, y: 12 },
            { x: 15, y: 8 }
        ],
        effects: { glow: true }
    }),

    // Specialized Interceptor Components
    interceptorWings: (color: ShipColor): ShipPartConfig => ({
        type: PartType.WING,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            { x: 20, y: -15 },
            { x: 25, y: -5 },
            { x: 25, y: 5 },
            { x: 20, y: 15 },
            { x: -20, y: 15 },
            { x: -25, y: 5 },
            { x: -25, y: -5 },
            { x: -20, y: -15 }
        ]
    }),

    interceptorEngine: (color: ShipColor): ShipPartConfig => ({
        type: PartType.ENGINE,
        color,
        position: { x: -18, y: 0 },
        rotation: 0,
        vertices: [
            { x: 0, y: -10 },
            { x: -15, y: -10 },
            { x: -20, y: -5 },
            { x: -20, y: 5 },
            { x: -15, y: 10 },
            { x: 0, y: 10 }
        ],
        effects: { trail: true, glow: true }
    }),

    // Heavy Weapons Systems
    plasmaCannon: (color: ShipColor): ShipPartConfig => ({
        type: PartType.WEAPON,
        color,
        position: { x: 15, y: 0 },
        rotation: 0,
        vertices: [
            { x: 25, y: 0 },
            { x: 20, y: -5 },
            { x: 10, y: -8 },
            { x: 0, y: -5 },
            { x: 0, y: 5 },
            { x: 10, y: 8 },
            { x: 20, y: 5 }
        ],
        effects: { glow: true }
    }),

    railgun: (color: ShipColor): ShipPartConfig => ({
        type: PartType.WEAPON,
        color,
        position: { x: 20, y: 0 },
        rotation: 0,
        vertices: [
            { x: 30, y: 0 },
            { x: 25, y: -3 },
            { x: 0, y: -6 },
            { x: -5, y: -3 },
            { x: -5, y: 3 },
            { x: 0, y: 6 },
            { x: 25, y: 3 }
        ],
        effects: { glow: true }
    }),

    missilePod: (color: ShipColor): ShipPartConfig => ({
        type: PartType.WEAPON,
        color,
        position: { x: 10, y: 0 },
        rotation: 0,
        vertices: [
            { x: 15, y: -10 },
            { x: 20, y: -8 },
            { x: 18, y: -2 },
            { x: 20, y: 2 },
            { x: 18, y: 8 },
            { x: 15, y: 10 },
            { x: 0, y: 12 },
            { x: -5, y: 8 },
            { x: -5, y: -8 },
            { x: 0, y: -12 }
        ],
        effects: { glow: true }
    }),

    // Defensive Systems
    shieldGenerator: (color: ShipColor): ShipPartConfig => ({
        type: PartType.ARMOR,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            { x: 8, y: -12 },
            { x: 12, y: -8 },
            { x: 12, y: 8 },
            { x: 8, y: 12 },
            { x: -8, y: 12 },
            { x: -12, y: 8 },
            { x: -12, y: -8 },
            { x: -8, y: -12 }
        ],
        effects: { shield: true, glow: true }
    }),

    reactiveArmor: (color: ShipColor): ShipPartConfig => ({
        type: PartType.ARMOR,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            { x: 15, y: -8 },
            { x: 18, y: -5 },
            { x: 15, y: 0 },
            { x: 18, y: 5 },
            { x: 15, y: 8 },
            { x: -15, y: 8 },
            { x: -18, y: 5 },
            { x: -15, y: 0 },
            { x: -18, y: -5 },
            { x: -15, y: -8 }
        ]
    }),

    // Advanced Propulsion
    boosterPack: (color: ShipColor): ShipPartConfig => ({
        type: PartType.ENGINE,
        color,
        position: { x: -20, y: 0 },
        rotation: 0,
        vertices: [
            { x: 5, y: -15 },
            { x: 0, y: -18 },
            { x: -10, y: -15 },
            { x: -15, y: -10 },
            { x: -18, y: 0 },
            { x: -15, y: 10 },
            { x: -10, y: 15 },
            { x: 0, y: 18 },
            { x: 5, y: 15 },
            { x: 8, y: 10 },
            { x: 8, y: -10 }
        ],
        effects: { trail: true, glow: true }
    }),

    ionDrive: (color: ShipColor): ShipPartConfig => ({
        type: PartType.ENGINE,
        color,
        position: { x: -25, y: 0 },
        rotation: 0,
        vertices: [
            { x: 0, y: -8 },
            { x: -12, y: -12 },
            { x: -20, y: -8 },
            { x: -25, y: 0 },
            { x: -20, y: 8 },
            { x: -12, y: 12 },
            { x: 0, y: 8 }
        ],
        effects: { trail: true, glow: true }
    }),

    // Specialized Hull Designs
    stealthFighter: (color: ShipColor): ShipPartConfig => ({
        type: PartType.COCKPIT,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            { x: 25, y: 0 },
            { x: 20, y: -5 },
            { x: 15, y: -12 },
            { x: 5, y: -15 },
            { x: -10, y: -12 },
            { x: -20, y: -5 },
            { x: -25, y: 0 },
            { x: -20, y: 5 },
            { x: -10, y: 12 },
            { x: 5, y: 15 },
            { x: 15, y: 12 },
            { x: 20, y: 5 }
        ],
        effects: { glow: true }
    }),

    heavyBomber: (color: ShipColor): ShipPartConfig => ({
        type: PartType.COCKPIT,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            { x: 20, y: 0 },
            { x: 15, y: -20 },
            { x: 0, y: -25 },
            { x: -15, y: -25 },
            { x: -25, y: -15 },
            { x: -30, y: 0 },
            { x: -25, y: 15 },
            { x: -15, y: 25 },
            { x: 0, y: 25 },
            { x: 15, y: 20 }
        ],
        effects: { glow: true }
    }),

    // Wing Configurations
    deltaWings: (color: ShipColor): ShipPartConfig => ({
        type: PartType.WING,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            { x: 15, y: -25 },
            { x: 25, y: -15 },
            { x: 20, y: 0 },
            { x: 25, y: 15 },
            { x: 15, y: 25 },
            { x: -15, y: 15 },
            { x: -20, y: 0 },
            { x: -15, y: -15 }
        ]
    }),

    sweptWings: (color: ShipColor): ShipPartConfig => ({
        type: PartType.WING,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            { x: 30, y: -20 },
            { x: 35, y: -10 },
            { x: 25, y: -5 },
            { x: 15, y: 0 },
            { x: 25, y: 5 },
            { x: 35, y: 10 },
            { x: 30, y: 20 },
            { x: -30, y: 20 },
            { x: -35, y: 10 },
            { x: -25, y: 5 },
            { x: -15, y: 0 },
            { x: -25, y: -5 },
            { x: -35, y: -10 },
            { x: -30, y: -20 }
        ]
    }),

    // Energy Systems
    powerCore: (color: ShipColor): ShipPartConfig => ({
        type: PartType.ENGINE,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            { x: 10, y: -10 },
            { x: 10, y: 10 },
            { x: -10, y: 10 },
            { x: -10, y: -10 }
        ],
        effects: { glow: true }
    }),

    // Support Systems
    sensorArray: (color: ShipColor): ShipPartConfig => ({
        type: PartType.ARMOR,
        color,
        position: { x: 0, y: -15 },
        rotation: 0,
        vertices: [
            { x: 8, y: -5 },
            { x: 12, y: 0 },
            { x: 8, y: 5 },
            { x: 0, y: 8 },
            { x: -8, y: 5 },
            { x: -12, y: 0 },
            { x: -8, y: -5 },
            { x: 0, y: -8 }
        ],
        effects: { glow: true }
    })
};
