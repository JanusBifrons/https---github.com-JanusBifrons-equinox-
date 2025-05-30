import * as PIXI from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';
import { BloomFilter } from '@pixi/filter-bloom';
import { MotionBlurFilter } from '@pixi/filter-motion-blur';
import { DisplacementFilter } from '@pixi/filter-displacement';
import { OutlineFilter } from '@pixi/filter-outline';
import { SpriteRenderer, DetailedPartConfig } from './SpriteRenderer';
import { DetailedShipParts } from './DetailedShipParts';
import { SimpleShipComponents } from './SimpleShipParts';

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

    private isAfterburnerActive: boolean = false;
    private afterburnerIntensity: number = 1.0;

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
    } public getVertices(): { x: number, y: number }[] {
        return this.config.vertices;
    }

    public getPartType(): PartType {
        return this.config.type;
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

    setAfterburnerState(active: boolean, intensity: number = 1.0): void {
        // Add a slight delay when deactivating afterburner for a smoother visual transition
        if (!active && this.isAfterburnerActive) {
            // Schedule a delayed deactivation
            setTimeout(() => {
                this.isAfterburnerActive = active;
                this.afterburnerIntensity = intensity;
                this.updateTrailEffectsForAfterburner();
            }, 150); // 150ms delay when turning off
        } else {
            // Immediate activation
            this.isAfterburnerActive = active;
            this.afterburnerIntensity = intensity;
            this.updateTrailEffectsForAfterburner();
        }
    } private updateTrailEffectsForAfterburner(): void {
        if (!this.effectsContainer || this.config.type !== PartType.ENGINE) return;

        // Remove existing trail effects
        this.effectsContainer.removeChildren();

        const colors = this.getColorValue(this.config.color);
        let coreColor, midColor, outerColor; if (this.isAfterburnerActive) {
            // Enhanced colors for afterburner - more vibrant and noticeable
            coreColor = 0x00FFFF; // Bright cyan
            midColor = 0x0088FF;  // Electric blue  
            outerColor = 0x4444FF; // Deep blue

            // Add subtle color variation based on time for a more dynamic effect
            const timeBasedVariation = Date.now() % 1000 / 1000; // 0 to 1 value that cycles every second
            if (timeBasedVariation > 0.7) {
                coreColor = 0xFFFFFF; // Occasional white flash in the core for "overheating" effect
            }
        } else {
            // Normal engine colors
            coreColor = colors.light;
            midColor = colors.glow;
            outerColor = colors.glow;
        }

        // Create new trail graphics with enhanced effects
        const trailOuter = new PIXI.Graphics();
        const trailMid = new PIXI.Graphics();
        const trailCore = new PIXI.Graphics();

        // For afterburner, make the trail much longer
        const trailLengthMultiplier = this.isAfterburnerActive ? 2.0 : 1.0;

        // Outer diffuse glow
        trailOuter.beginFill(outerColor, this.isAfterburnerActive ? 0.4 * this.afterburnerIntensity : 0.15);
        trailOuter.drawEllipse(
            -26 - (this.isAfterburnerActive ? 10 : 0), // Move further back for afterburner
            0,
            (this.isAfterburnerActive ? 22 : 12) * trailLengthMultiplier,
            this.isAfterburnerActive ? 12 : 7
        );
        trailOuter.endFill();

        // Mid layer with color
        trailMid.beginFill(midColor, this.isAfterburnerActive ? 0.6 * this.afterburnerIntensity : 0.3);
        trailMid.drawEllipse(
            -23 - (this.isAfterburnerActive ? 8 : 0), // Move further back for afterburner
            0,
            (this.isAfterburnerActive ? 16 : 8) * trailLengthMultiplier,
            this.isAfterburnerActive ? 8 : 5
        );
        trailMid.endFill();

        // Bright core
        trailCore.beginFill(coreColor, this.isAfterburnerActive ? 0.8 * this.afterburnerIntensity : 0.4);
        trailCore.drawEllipse(
            -20 - (this.isAfterburnerActive ? 5 : 0), // Move further back for afterburner
            0,
            (this.isAfterburnerActive ? 8 : 4) * trailLengthMultiplier,
            this.isAfterburnerActive ? 5 : 3
        );
        trailCore.endFill();
        // Add flame particles for afterburner
        if (this.isAfterburnerActive) {
            // Add additional flame effects
            const flameParticles = new PIXI.Container();

            // Create several flame particles
            for (let i = 0; i < 8; i++) { // Increased from 5 to 8 particles
                const particle = new PIXI.Graphics();
                const size = 2 + Math.random() * 3;
                const distance = 15 + Math.random() * 30; // Increased range from 25 to 30
                const yOffset = (Math.random() - 0.5) * 8; // Increased spread from 6 to 8

                // Vary colors for realistic flame effect
                const flameColors = [0x00FFFF, 0x0088FF, 0xFFFFFF, 0x80FFFF]; // Added light cyan color
                const color = flameColors[Math.floor(Math.random() * flameColors.length)];

                particle.beginFill(color, 0.6 + Math.random() * 0.4);
                particle.drawCircle(-distance, yOffset, size);
                particle.endFill();

                // Add random animation parameters to each particle
                (particle as any).animSpeed = 0.5 + Math.random() * 2;
                (particle as any).animPhase = Math.random() * Math.PI * 2;
                (particle as any).baseX = -distance;
                (particle as any).baseY = yOffset;
                (particle as any).size = size;
                (particle as any).maxDistance = -distance - (Math.random() * 10); // For trailing effect

                flameParticles.addChild(particle);
            }

            flameParticles.name = 'flameParticles';
            this.effectsContainer.addChild(flameParticles);
        }

        // Enhanced filter effects during afterburner
        if (this.isAfterburnerActive) {
            // Apply filters with type casting to avoid TypeScript errors
            trailCore.filters = [
                new GlowFilter({
                    distance: 20 * this.afterburnerIntensity,
                    outerStrength: 3 * this.afterburnerIntensity,
                    innerStrength: 2 * this.afterburnerIntensity,
                    color: 0x00FFFF,
                    quality: 0.5
                }) as unknown as PIXI.Filter,
                new BloomFilter(2.0 * this.afterburnerIntensity, 3, 5, 0.6) as unknown as PIXI.Filter,
                new MotionBlurFilter([25 * this.afterburnerIntensity, 0], 5) as unknown as PIXI.Filter
            ];

            // Lighter effects for mid layer
            trailMid.filters = [
                new GlowFilter({
                    distance: 15 * this.afterburnerIntensity,
                    outerStrength: 2.0 * this.afterburnerIntensity,
                    innerStrength: 1.0 * this.afterburnerIntensity,
                    color: 0x0088FF,
                    quality: 0.4
                }) as unknown as PIXI.Filter
            ];

            // Outline effect for outer layer
            trailOuter.filters = [
                new OutlineFilter(3, 0x4444FF, 0.5 * this.afterburnerIntensity) as unknown as PIXI.Filter
            ];
        } else {
            // Clear filters for normal operation
            trailCore.filters = [];
            trailMid.filters = [];
            trailOuter.filters = [];
        }

        // Add all layers to effects container
        this.effectsContainer.addChild(trailOuter);
        this.effectsContainer.addChild(trailMid);
        this.effectsContainer.addChild(trailCore);

        // Store references for animation
        trailOuter.name = 'trailOuter';
        trailMid.name = 'trailMid';
        trailCore.name = 'trailCore';
    } updateTrailEffects(deltaTime: number): void {
        if (!this.effectsContainer || this.config.type !== PartType.ENGINE) return;

        const trailCore = this.effectsContainer.getChildByName('trailCore') as PIXI.Graphics;
        const trailMid = this.effectsContainer.getChildByName('trailMid') as PIXI.Graphics;
        const trailOuter = this.effectsContainer.getChildByName('trailOuter') as PIXI.Graphics;
        const flameParticles = this.effectsContainer.getChildByName('flameParticles') as PIXI.Container;

        // Base animation speed multiplier
        let animationSpeed = 1.0;
        let scaleMultiplier = 1.0;
        let alphaMultiplier = 1.0;

        // Enhanced effects during afterburner
        if (this.isAfterburnerActive) {
            animationSpeed = 2.5 * this.afterburnerIntensity;
            scaleMultiplier = 1.5 + (0.5 * this.afterburnerIntensity);
            alphaMultiplier = 1.2;
        }

        const time = Date.now() * 0.001 * animationSpeed;        // Animate trail effects with enhanced parameters
        if (trailCore) {
            trailCore.scale.x = (1.0 + Math.sin(time * 8) * 0.1) * scaleMultiplier;
            trailCore.scale.y = 1.0 + Math.sin(time * 6) * 0.05;
            trailCore.alpha = (0.8 + Math.sin(time * 10) * 0.2) * alphaMultiplier;

            // Add subtle position oscillation for more dynamic effect
            if (this.isAfterburnerActive) {
                trailCore.x = -2 + Math.sin(time * 20) * 2; // Rapid subtle x movement
                trailCore.y = Math.sin(time * 15) * 1.5;    // Rapid subtle y movement
            } else {
                trailCore.x = 0;
                trailCore.y = 0;
            }
        }

        if (trailMid) {
            trailMid.scale.x = (1.0 + Math.sin(time * 6) * 0.15) * scaleMultiplier;
            trailMid.scale.y = 1.0 + Math.sin(time * 4) * 0.1;
            trailMid.alpha = (0.6 + Math.sin(time * 8) * 0.2) * alphaMultiplier;

            // Add subtle position oscillation offset from core
            if (this.isAfterburnerActive) {
                trailMid.x = -1 + Math.sin(time * 15 + 1) * 1.5; // Different phase than core
                trailMid.y = Math.sin(time * 12 + 1) * 1.2;      // Different phase than core
            } else {
                trailMid.x = 0;
                trailMid.y = 0;
            }
        }

        if (trailOuter) {
            trailOuter.scale.x = (1.0 + Math.sin(time * 4) * 0.2) * scaleMultiplier;
            trailOuter.scale.y = 1.0 + Math.sin(time * 3) * 0.15;
            trailOuter.alpha = (0.4 + Math.sin(time * 6) * 0.2) * alphaMultiplier;

            // Add subtle position oscillation offset from others
            if (this.isAfterburnerActive) {
                trailOuter.x = Math.sin(time * 10 + 2) * 1.0; // Different phase than others
                trailOuter.y = Math.sin(time * 8 + 2) * 0.8;  // Different phase than others
            } else {
                trailOuter.x = 0;
                trailOuter.y = 0;
            }
        }
        // Animate flame particles if they exist
        if (flameParticles && this.isAfterburnerActive) {
            flameParticles.children.forEach((child) => {
                const particle = child as PIXI.Graphics;
                const speed = (particle as any).animSpeed || 1;
                const phase = (particle as any).animPhase || 0;
                const baseX = (particle as any).baseX || -20;
                const baseY = (particle as any).baseY || 0;
                const maxDistance = (particle as any).maxDistance || baseX - 10;
                const size = (particle as any).size || 2;

                // Calculate oscillation for x and y positions
                const xOscillation = Math.sin(time * speed + phase) * 3;
                const yOscillation = Math.sin(time * speed * 2 + phase) * 4;

                // Create trailing effect where particles move further back then reset
                const trailPosition = baseX + (Math.sin(time * speed * 0.5 + phase) * 10);
                particle.x = Math.min(trailPosition, maxDistance) + xOscillation;
                particle.y = baseY + yOscillation;

                // Pulse alpha for flicker effect with occasional bright flashes
                const randomFlash = Math.random() > 0.95 ? 0.3 : 0; // Occasional bright flash
                particle.alpha = 0.6 + Math.sin(time * speed * 3 + phase) * 0.3 + randomFlash;

                // Pulse scale for flame pulsing - more intense than before
                const scaleBase = 0.8 + Math.sin(time * speed * 4 + phase) * 0.4;
                const randomScale = Math.random() * 0.2; // Add slight randomness to each frame
                particle.scale.set(scaleBase + randomScale);

                // Occasionally change the particle color for a dynamic effect
                if (Math.random() > 0.98) {
                    particle.clear();
                    const flameColors = [0x00FFFF, 0x0088FF, 0xFFFFFF, 0x80FFFF];
                    const color = flameColors[Math.floor(Math.random() * flameColors.length)];
                    particle.beginFill(color, 0.6 + Math.random() * 0.4);
                    particle.drawCircle(0, 0, size * (1 + Math.random() * 0.5));
                    particle.endFill();
                }
            });
        }
    }
}

// Simple geometric ship components - organized in groups of 5-10 basic shapes
// Circles reserved exclusively for shields as "leaves" to the ship "tree" structure
export const ShipComponents = {
    // HULL COMPONENTS - Basic geometric shapes
    compactShip: SimpleShipComponents.compactShip,
    assaultShip: SimpleShipComponents.assaultShip,
    capitalShip: SimpleShipComponents.capitalShip,

    // WING COMPONENTS - Triangles and rectangles
    standardWings: SimpleShipComponents.basicWings,
    assaultWings: SimpleShipComponents.basicWings,
    deltaWings: SimpleShipComponents.basicWings,
    sweptWings: SimpleShipComponents.basicWings,
    interceptorWings: SimpleShipComponents.basicWings,

    // ENGINE COMPONENTS - Rectangle-based propulsion
    dualEngine: SimpleShipComponents.basicEngine,
    quadEngine: SimpleShipComponents.basicEngine,
    interceptorEngine: SimpleShipComponents.basicEngine,
    boosterPack: SimpleShipComponents.basicEngine,
    ionDrive: SimpleShipComponents.basicEngine,

    // WEAPON COMPONENTS - Rectangle and triangle arrays  
    sideCannons: SimpleShipComponents.basicWeapon,
    plasmaCannon: SimpleShipComponents.basicWeapon,
    railgun: SimpleShipComponents.basicWeapon,
    missilePod: SimpleShipComponents.basicWeapon,

    // THRUSTER COMPONENTS - Simple geometric nozzles
    vectorThrusters: SimpleShipComponents.basicThruster,

    // SHIELD COMPONENTS - Circles only (leaves of the ship tree)
    shieldGenerator: SimpleShipComponents.basicShield,
    reactiveArmor: SimpleShipComponents.basicShield,

    // INTERCEPTOR HULLS - Simple geometric fighters
    razorInterceptor: SimpleShipComponents.basicFighter,
    strikeInterceptor: SimpleShipComponents.compactShip,
    phantomInterceptor: SimpleShipComponents.basicFighter,

    // SPECIALIZED HULLS - Geometric variants
    stealthFighter: SimpleShipComponents.assaultShip,
    heavyBomber: SimpleShipComponents.capitalShip,

    // SUPPORT SYSTEMS - Basic shapes
    powerCore: SimpleShipComponents.basicShield, // Circle for energy core
    sensorArray: SimpleShipComponents.basicShield // Circle for sensor array
};
