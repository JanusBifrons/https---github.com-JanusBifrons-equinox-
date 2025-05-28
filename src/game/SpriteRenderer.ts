// Enhanced Sprite-like Rendering System for Ship Parts
// This creates detailed, pixel-perfect ship parts based on typical space game aesthetics

import * as PIXI from 'pixi.js';
import { ShipColor } from './ShipParts';

export interface DetailedPartConfig {
    baseShape: { x: number; y: number }[];
    details: DetailLayer[];
    effects?: EffectConfig;
    boundingBox: { width: number; height: number };
}

interface DetailLayer {
    type: 'outline' | 'fill' | 'panel' | 'vent' | 'window' | 'engine' | 'weapon' | 'highlight';
    color: string | 'auto'; // 'auto' uses ship color variants
    alpha: number;
    thickness?: number;
    points?: { x: number; y: number }[];
    shapes?: Array<{
        type: 'rect' | 'circle' | 'ellipse' | 'polygon';
        x: number;
        y: number;
        width?: number;
        height?: number;
        radius?: number;
        points?: { x: number; y: number }[];
    }>;
}

interface EffectConfig {
    glow?: { color: string; intensity: number; size: number };
    trail?: { length: number; fade: number };
    pulses?: { color: string; speed: number };
}

export class SpriteRenderer {
    private static getColorPalette(baseColor: ShipColor) {
        const palettes = {
            red: {
                primary: 0xFF4444,
                secondary: 0xCC2222,
                accent: 0xFF8888,
                dark: 0x880000,
                metal: 0xCCCCCC,
                metalDark: 0x888888,
                glow: 0xFF6666,
                window: 0x4444FF
            },
            blue: {
                primary: 0x4444FF,
                secondary: 0x2222CC,
                accent: 0x8888FF,
                dark: 0x000088,
                metal: 0xCCCCCC,
                metalDark: 0x888888,
                glow: 0x6666FF,
                window: 0x44FFFF
            },
            green: {
                primary: 0x44FF44,
                secondary: 0x22CC22,
                accent: 0x88FF88,
                dark: 0x008800,
                metal: 0xCCCCCC,
                metalDark: 0x888888,
                glow: 0x66FF66,
                window: 0xFF4444
            },
            orange: {
                primary: 0xFF8844,
                secondary: 0xCC6622,
                accent: 0xFFAA88,
                dark: 0x884400,
                metal: 0xCCCCCC,
                metalDark: 0x888888,
                glow: 0xFF8866,
                window: 0x44FF44
            }
        };
        return palettes[baseColor];
    }

    public static renderDetailedPart(config: DetailedPartConfig, color: ShipColor): PIXI.Container {
        const container = new PIXI.Container();
        const palette = this.getColorPalette(color);

        // Render each detail layer
        config.details.forEach(layer => {
            const graphic = new PIXI.Graphics();

            // Determine layer color
            let layerColor: number;
            if (layer.color === 'auto') {
                switch (layer.type) {
                    case 'fill':
                        layerColor = palette.primary;
                        break;
                    case 'outline':
                        layerColor = palette.dark;
                        break;
                    case 'panel':
                        layerColor = palette.secondary;
                        break;
                    case 'highlight':
                        layerColor = palette.accent;
                        break;
                    case 'window':
                        layerColor = palette.window;
                        break;
                    case 'engine':
                        layerColor = palette.glow;
                        break;
                    case 'weapon':
                        layerColor = palette.metalDark;
                        break;
                    case 'vent':
                        layerColor = palette.metal;
                        break;
                    default:
                        layerColor = palette.primary;
                }
            } else {
                layerColor = parseInt(layer.color.replace('#', '0x'));
            }

            // Render based on layer type
            this.renderLayer(graphic, layer, layerColor);
            container.addChild(graphic);
        });

        // Add effects if specified
        if (config.effects) {
            this.addEffects(container, config.effects, palette);
        }

        return container;
    }

    private static renderLayer(graphic: PIXI.Graphics, layer: DetailLayer, color: number) {
        graphic.alpha = layer.alpha;

        switch (layer.type) {
            case 'fill':
            case 'panel':
                graphic.beginFill(color, layer.alpha);
                if (layer.points && layer.points.length > 0) {
                    graphic.moveTo(layer.points[0].x, layer.points[0].y);
                    for (let i = 1; i < layer.points.length; i++) {
                        graphic.lineTo(layer.points[i].x, layer.points[i].y);
                    }
                    graphic.lineTo(layer.points[0].x, layer.points[0].y);
                }
                graphic.endFill();
                break;

            case 'outline':
            case 'highlight':
                graphic.lineStyle(layer.thickness || 1, color, layer.alpha);
                if (layer.points && layer.points.length > 0) {
                    graphic.moveTo(layer.points[0].x, layer.points[0].y);
                    for (let i = 1; i < layer.points.length; i++) {
                        graphic.lineTo(layer.points[i].x, layer.points[i].y);
                    }
                    if (layer.type === 'outline') {
                        graphic.lineTo(layer.points[0].x, layer.points[0].y);
                    }
                }
                break;

            case 'window':
            case 'engine':
            case 'weapon':
            case 'vent':
                graphic.beginFill(color, layer.alpha);
                if (layer.thickness) {
                    graphic.lineStyle(layer.thickness, color, Math.min(1, layer.alpha + 0.3));
                }

                if (layer.shapes) {
                    layer.shapes.forEach(shape => {
                        switch (shape.type) {
                            case 'rect':
                                graphic.drawRect(
                                    shape.x - (shape.width || 10) / 2,
                                    shape.y - (shape.height || 10) / 2,
                                    shape.width || 10,
                                    shape.height || 10
                                );
                                break;
                            case 'circle':
                                graphic.drawCircle(shape.x, shape.y, shape.radius || 5);
                                break;
                            case 'ellipse':
                                graphic.drawEllipse(shape.x, shape.y, shape.width || 10, shape.height || 5);
                                break;
                            case 'polygon':
                                if (shape.points && shape.points.length > 0) {
                                    graphic.moveTo(shape.points[0].x + shape.x, shape.points[0].y + shape.y);
                                    for (let i = 1; i < shape.points.length; i++) {
                                        graphic.lineTo(shape.points[i].x + shape.x, shape.points[i].y + shape.y);
                                    }
                                    graphic.lineTo(shape.points[0].x + shape.x, shape.points[0].y + shape.y);
                                }
                                break;
                        }
                    });
                }
                graphic.endFill();
                break;
        }
    }

    private static addEffects(container: PIXI.Container, effects: EffectConfig, palette: any) {
        // Add glow effect
        if (effects.glow) {
            const glowGraphic = new PIXI.Graphics();
            glowGraphic.beginFill(palette.glow, 0.3);
            glowGraphic.drawCircle(0, 0, effects.glow.size);
            glowGraphic.endFill();
            glowGraphic.filters = [new PIXI.BlurFilter(4)];
            container.addChildAt(glowGraphic, 0); // Add behind main graphics
        }

        // Add pulsing effect (animated)
        if (effects.pulses) {
            const pulseGraphic = new PIXI.Graphics();
            pulseGraphic.beginFill(palette.glow, 0.2);
            pulseGraphic.drawCircle(0, 0, 15);
            pulseGraphic.endFill();
            container.addChild(pulseGraphic);

            // Simple pulse animation
            let pulseTime = 0;
            const animate = () => {
                pulseTime += 0.1;
                pulseGraphic.alpha = 0.2 + Math.sin(pulseTime * effects.pulses!.speed) * 0.15;
                pulseGraphic.scale.set(1 + Math.sin(pulseTime * effects.pulses!.speed) * 0.1);
                requestAnimationFrame(animate);
            };
            animate();
        }
    }
}
