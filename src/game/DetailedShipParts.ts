// Detailed Ship Part Configurations
// Based on typical space shooter aesthetics with accurate shapes and details

import { DetailedPartConfig } from './SpriteRenderer';

export const DetailedShipParts = {
    // COMPACT SHIP - Small, agile fighter
    compactShip: (): DetailedPartConfig => ({
        baseShape: [
            { x: 0, y: -15 },
            { x: 15, y: -10 },
            { x: 20, y: 0 },
            { x: 15, y: 10 },
            { x: 0, y: 15 },
            { x: -10, y: 0 }
        ],
        boundingBox: { width: 30, height: 30 },
        details: [
            // Main hull fill
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.9,
                points: [
                    { x: 0, y: -15 },
                    { x: 15, y: -10 },
                    { x: 20, y: 0 },
                    { x: 15, y: 10 },
                    { x: 0, y: 15 },
                    { x: -10, y: 0 }
                ]
            },
            // Hull outline
            {
                type: 'outline',
                color: 'auto',
                alpha: 1.0,
                thickness: 2,
                points: [
                    { x: 0, y: -15 },
                    { x: 15, y: -10 },
                    { x: 20, y: 0 },
                    { x: 15, y: 10 },
                    { x: 0, y: 15 },
                    { x: -10, y: 0 }
                ]
            },
            // Cockpit window
            {
                type: 'window',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'ellipse', x: 5, y: 0, width: 8, height: 6 }
                ]
            },
            // Panel lines
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.6,
                thickness: 1,
                points: [
                    { x: -5, y: -8 },
                    { x: 10, y: -8 },
                    { x: 12, y: 0 },
                    { x: 10, y: 8 },
                    { x: -5, y: 8 }
                ]
            },
            // Wing highlights
            {
                type: 'highlight',
                color: 'auto',
                alpha: 0.7,
                thickness: 1,
                points: [
                    { x: 0, y: -12 },
                    { x: 12, y: -8 }
                ]
            },
            {
                type: 'highlight',
                color: 'auto',
                alpha: 0.7,
                thickness: 1,
                points: [
                    { x: 0, y: 12 },
                    { x: 12, y: 8 }
                ]
            }
        ],
        effects: {
            glow: { color: 'auto', intensity: 0.5, size: 20 }
        }
    }),

    // ASSAULT SHIP - Medium sized balanced fighter
    assaultShip: (): DetailedPartConfig => ({
        baseShape: [
            { x: 25, y: 0 },
            { x: 15, y: -20 },
            { x: 0, y: -25 },
            { x: -15, y: -20 },
            { x: -25, y: -10 },
            { x: -25, y: 10 },
            { x: -15, y: 20 },
            { x: 0, y: 25 },
            { x: 15, y: 20 }
        ],
        boundingBox: { width: 50, height: 50 },
        details: [
            // Main hull fill
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.9,
                points: [
                    { x: 25, y: 0 },
                    { x: 15, y: -20 },
                    { x: 0, y: -25 },
                    { x: -15, y: -20 },
                    { x: -25, y: -10 },
                    { x: -25, y: 10 },
                    { x: -15, y: 20 },
                    { x: 0, y: 25 },
                    { x: 15, y: 20 }
                ]
            },
            // Hull outline
            {
                type: 'outline',
                color: 'auto',
                alpha: 1.0,
                thickness: 2,
                points: [
                    { x: 25, y: 0 },
                    { x: 15, y: -20 },
                    { x: 0, y: -25 },
                    { x: -15, y: -20 },
                    { x: -25, y: -10 },
                    { x: -25, y: 10 },
                    { x: -15, y: 20 },
                    { x: 0, y: 25 },
                    { x: 15, y: 20 }
                ]
            },
            // Cockpit window
            {
                type: 'window',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'ellipse', x: 8, y: 0, width: 12, height: 8 }
                ]
            },
            // Main panel sections
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.6,
                shapes: [
                    { type: 'rect', x: -5, y: -15, width: 15, height: 8 },
                    { type: 'rect', x: -5, y: 7, width: 15, height: 8 }
                ]
            },
            // Weapon hardpoints
            {
                type: 'weapon',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'rect', x: 18, y: -12, width: 4, height: 6 },
                    { type: 'rect', x: 18, y: 6, width: 4, height: 6 }
                ]
            },
            // Engine intakes
            {
                type: 'vent',
                color: 'auto',
                alpha: 0.7,
                shapes: [
                    { type: 'rect', x: -20, y: -6, width: 8, height: 3 },
                    { type: 'rect', x: -20, y: 3, width: 8, height: 3 }
                ]
            }
        ],
        effects: {
            glow: { color: 'auto', intensity: 0.6, size: 25 },
            pulses: { color: 'auto', speed: 2 }
        }
    }),

    // CAPITAL SHIP - Large, heavily armored
    capitalShip: (): DetailedPartConfig => ({
        baseShape: [
            { x: 35, y: 0 },
            { x: 25, y: -30 },
            { x: 0, y: -35 },
            { x: -25, y: -30 },
            { x: -35, y: -15 },
            { x: -35, y: 15 },
            { x: -25, y: 30 },
            { x: 0, y: 35 },
            { x: 25, y: 30 }
        ],
        boundingBox: { width: 70, height: 70 },
        details: [
            // Main hull fill
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.9,
                points: [
                    { x: 35, y: 0 },
                    { x: 25, y: -30 },
                    { x: 0, y: -35 },
                    { x: -25, y: -30 },
                    { x: -35, y: -15 },
                    { x: -35, y: 15 },
                    { x: -25, y: 30 },
                    { x: 0, y: 35 },
                    { x: 25, y: 30 }
                ]
            },
            // Hull outline
            {
                type: 'outline',
                color: 'auto',
                alpha: 1.0,
                thickness: 3,
                points: [
                    { x: 35, y: 0 },
                    { x: 25, y: -30 },
                    { x: 0, y: -35 },
                    { x: -25, y: -30 },
                    { x: -35, y: -15 },
                    { x: -35, y: 15 },
                    { x: -25, y: 30 },
                    { x: 0, y: 35 },
                    { x: 25, y: 30 }
                ]
            },
            // Bridge
            {
                type: 'window',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'rect', x: 15, y: 0, width: 16, height: 10 }
                ]
            },
            // Armor panels
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.6,
                shapes: [
                    { type: 'rect', x: 0, y: -20, width: 20, height: 12 },
                    { type: 'rect', x: 0, y: 8, width: 20, height: 12 },
                    { type: 'rect', x: -15, y: -10, width: 12, height: 20 }
                ]
            },
            // Heavy weapons
            {
                type: 'weapon',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'rect', x: 25, y: -20, width: 6, height: 8 },
                    { type: 'rect', x: 25, y: 12, width: 6, height: 8 },
                    { type: 'rect', x: 8, y: -25, width: 8, height: 6 },
                    { type: 'rect', x: 8, y: 19, width: 8, height: 6 }
                ]
            },
            // Engine systems
            {
                type: 'vent',
                color: 'auto',
                alpha: 0.7,
                shapes: [
                    { type: 'rect', x: -28, y: -10, width: 10, height: 4 },
                    { type: 'rect', x: -28, y: -3, width: 10, height: 4 },
                    { type: 'rect', x: -28, y: 4, width: 10, height: 4 }
                ]
            }
        ],
        effects: {
            glow: { color: 'auto', intensity: 0.8, size: 35 },
            pulses: { color: 'auto', speed: 1.5 }
        }
    }),

    // WINGS - Extended wing systems
    standardWings: (): DetailedPartConfig => ({
        baseShape: [
            { x: 15, y: -25 },
            { x: 25, y: -15 },
            { x: 25, y: 15 },
            { x: 15, y: 25 },
            { x: -15, y: 25 },
            { x: -25, y: 15 },
            { x: -25, y: -15 },
            { x: -15, y: -25 }
        ],
        boundingBox: { width: 50, height: 50 },
        details: [
            // Wing structure fill
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.8,
                points: [
                    { x: 15, y: -25 },
                    { x: 25, y: -15 },
                    { x: 25, y: 15 },
                    { x: 15, y: 25 },
                    { x: -15, y: 25 },
                    { x: -25, y: 15 },
                    { x: -25, y: -15 },
                    { x: -15, y: -25 }
                ]
            },
            // Wing outline
            {
                type: 'outline',
                color: 'auto',
                alpha: 1.0,
                thickness: 2,
                points: [
                    { x: 15, y: -25 },
                    { x: 25, y: -15 },
                    { x: 25, y: 15 },
                    { x: 15, y: 25 },
                    { x: -15, y: 25 },
                    { x: -25, y: 15 },
                    { x: -25, y: -15 },
                    { x: -15, y: -25 }
                ]
            },
            // Wing struts
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.6,
                thickness: 1,
                points: [
                    { x: 0, y: -20 },
                    { x: 0, y: 20 }
                ]
            },
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.6,
                thickness: 1,
                points: [
                    { x: -20, y: -10 },
                    { x: 20, y: -10 }
                ]
            },
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.6,
                thickness: 1,
                points: [
                    { x: -20, y: 10 },
                    { x: 20, y: 10 }
                ]
            },
            // Wing tips (weapon mounts)
            {
                type: 'weapon',
                color: 'auto',
                alpha: 0.7,
                shapes: [
                    { type: 'rect', x: 20, y: -18, width: 4, height: 6 },
                    { type: 'rect', x: 20, y: 12, width: 4, height: 6 },
                    { type: 'rect', x: -20, y: -18, width: 4, height: 6 },
                    { type: 'rect', x: -20, y: 12, width: 4, height: 6 }
                ]
            }
        ]
    }),

    // DUAL ENGINE - Twin engine configuration
    dualEngine: (): DetailedPartConfig => ({
        baseShape: [
            { x: 0, y: -12 },
            { x: -20, y: -12 },
            { x: -25, y: -6 },
            { x: -25, y: 6 },
            { x: -20, y: 12 },
            { x: 0, y: 12 }
        ],
        boundingBox: { width: 25, height: 24 },
        details: [
            // Engine housing fill
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.9,
                points: [
                    { x: 0, y: -12 },
                    { x: -20, y: -12 },
                    { x: -25, y: -6 },
                    { x: -25, y: 6 },
                    { x: -20, y: 12 },
                    { x: 0, y: 12 }
                ]
            },
            // Engine outline
            {
                type: 'outline',
                color: 'auto',
                alpha: 1.0,
                thickness: 2,
                points: [
                    { x: 0, y: -12 },
                    { x: -20, y: -12 },
                    { x: -25, y: -6 },
                    { x: -25, y: 6 },
                    { x: -20, y: 12 },
                    { x: 0, y: 12 }
                ]
            },
            // Engine cores
            {
                type: 'engine',
                color: 'auto',
                alpha: 0.9,
                shapes: [
                    { type: 'circle', x: -18, y: -6, radius: 4 },
                    { type: 'circle', x: -18, y: 6, radius: 4 }
                ]
            },
            // Exhaust ports
            {
                type: 'vent',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'rect', x: -23, y: -6, width: 3, height: 2 },
                    { type: 'rect', x: -23, y: 6, width: 3, height: 2 }
                ]
            },
            // Cooling vents
            {
                type: 'vent',
                color: 'auto',
                alpha: 0.6,
                thickness: 1,
                points: [
                    { x: -15, y: -9 },
                    { x: -8, y: -9 }
                ]
            },
            {
                type: 'vent',
                color: 'auto',
                alpha: 0.6,
                thickness: 1,
                points: [
                    { x: -15, y: 9 },
                    { x: -8, y: 9 }
                ]
            }
        ],
        effects: {
            glow: { color: 'auto', intensity: 0.8, size: 15 },
            trail: { length: 20, fade: 0.8 }
        }
    }),

    // INTERCEPTOR VARIANTS
    razorInterceptor: (): DetailedPartConfig => ({
        baseShape: [
            { x: 25, y: 0 },
            { x: 15, y: -12 },
            { x: 0, y: -15 },
            { x: -15, y: -10 },
            { x: -20, y: 0 },
            { x: -15, y: 10 },
            { x: 0, y: 15 },
            { x: 15, y: 12 }
        ],
        boundingBox: { width: 45, height: 30 },
        details: [
            // Sleek hull fill
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.9,
                points: [
                    { x: 25, y: 0 },
                    { x: 15, y: -12 },
                    { x: 0, y: -15 },
                    { x: -15, y: -10 },
                    { x: -20, y: 0 },
                    { x: -15, y: 10 },
                    { x: 0, y: 15 },
                    { x: 15, y: 12 }
                ]
            },
            // Sharp outline
            {
                type: 'outline',
                color: 'auto',
                alpha: 1.0,
                thickness: 2,
                points: [
                    { x: 25, y: 0 },
                    { x: 15, y: -12 },
                    { x: 0, y: -15 },
                    { x: -15, y: -10 },
                    { x: -20, y: 0 },
                    { x: -15, y: 10 },
                    { x: 0, y: 15 },
                    { x: 15, y: 12 }
                ]
            },
            // Cockpit
            {
                type: 'window',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'ellipse', x: 8, y: 0, width: 10, height: 6 }
                ]
            },
            // Razor edges
            {
                type: 'highlight',
                color: 'auto',
                alpha: 0.9,
                thickness: 1,
                points: [
                    { x: 15, y: -12 },
                    { x: 25, y: 0 },
                    { x: 15, y: 12 }
                ]
            },
            // Weapon systems
            {
                type: 'weapon',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'rect', x: 20, y: -6, width: 3, height: 4 },
                    { type: 'rect', x: 20, y: 2, width: 3, height: 4 }
                ]
            }
        ],
        effects: {
            glow: { color: 'auto', intensity: 0.7, size: 22 }
        }
    }),

    // HEAVY WEAPONS - Plasma Cannon
    plasmaCannon: (): DetailedPartConfig => ({
        baseShape: [
            { x: 25, y: 0 },
            { x: 20, y: -5 },
            { x: 10, y: -8 },
            { x: 0, y: -5 },
            { x: 0, y: 5 },
            { x: 10, y: 8 },
            { x: 20, y: 5 }
        ],
        boundingBox: { width: 25, height: 16 },
        details: [
            // Main cannon body
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.9,
                points: [
                    { x: 25, y: 0 },
                    { x: 20, y: -5 },
                    { x: 10, y: -8 },
                    { x: 0, y: -5 },
                    { x: 0, y: 5 },
                    { x: 10, y: 8 },
                    { x: 20, y: 5 }
                ]
            },
            // Barrel detail
            {
                type: 'outline',
                color: 'auto',
                alpha: 1.0,
                thickness: 2,
                points: [
                    { x: 15, y: -3 },
                    { x: 25, y: 0 },
                    { x: 15, y: 3 }
                ]
            },
            // Energy coils
            {
                type: 'highlight',
                color: 'auto',
                alpha: 0.8,
                thickness: 1,
                points: [
                    { x: 5, y: -6 },
                    { x: 15, y: -4 },
                    { x: 18, y: -2 }
                ]
            },
            {
                type: 'highlight',
                color: 'auto',
                alpha: 0.8,
                thickness: 1,
                points: [
                    { x: 5, y: 6 },
                    { x: 15, y: 4 },
                    { x: 18, y: 2 }
                ]
            },            // Power core
            {
                type: 'engine',
                color: 'auto',
                alpha: 0.6,
                shapes: [
                    { type: 'ellipse', x: 8, y: 0, width: 6, height: 8 }
                ]
            }
        ],
        effects: {
            glow: { color: 'auto', intensity: 0.8, size: 25 }
        }
    }),

    // STEALTH FIGHTER - Advanced hull design
    stealthFighter: (): DetailedPartConfig => ({
        baseShape: [
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
        boundingBox: { width: 50, height: 30 },
        details: [
            // Main hull fill
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.8,
                points: [
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
                ]
            },
            // Angular panel lines for stealth design
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.7,
                thickness: 1,
                points: [
                    { x: 15, y: -8 },
                    { x: 10, y: -12 },
                    { x: 0, y: -10 },
                    { x: -10, y: -8 },
                    { x: -15, y: -3 }
                ]
            },
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.7,
                thickness: 1,
                points: [
                    { x: 15, y: 8 },
                    { x: 10, y: 12 },
                    { x: 0, y: 10 },
                    { x: -10, y: 8 },
                    { x: -15, y: 3 }
                ]
            },
            // Cockpit area
            {
                type: 'window',
                color: 'auto',
                alpha: 0.9,
                shapes: [
                    { type: 'ellipse', x: 12, y: 0, width: 8, height: 5 }
                ]
            },
            // Stealth coating highlights
            {
                type: 'highlight',
                color: 'auto',
                alpha: 0.5,
                thickness: 1,
                points: [
                    { x: 20, y: -3 },
                    { x: 22, y: 0 },
                    { x: 20, y: 3 }
                ]
            }
        ],
        effects: {
            glow: { color: 'auto', intensity: 0.4, size: 30 }
        }
    }),

    // SHIELD GENERATOR - Defensive system
    shieldGenerator: (): DetailedPartConfig => ({
        baseShape: [
            { x: 8, y: -12 },
            { x: 12, y: -8 },
            { x: 12, y: 8 },
            { x: 8, y: 12 },
            { x: -8, y: 12 },
            { x: -12, y: 8 },
            { x: -12, y: -8 },
            { x: -8, y: -12 }
        ],
        boundingBox: { width: 24, height: 24 },
        details: [
            // Main generator housing
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.9,
                points: [
                    { x: 8, y: -12 },
                    { x: 12, y: -8 },
                    { x: 12, y: 8 },
                    { x: 8, y: 12 },
                    { x: -8, y: 12 },
                    { x: -12, y: 8 },
                    { x: -12, y: -8 },
                    { x: -8, y: -12 }
                ]
            },            // Energy core
            {
                type: 'engine',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'ellipse', x: 0, y: 0, width: 12, height: 12 }
                ]
            },
            // Shield projector nodes
            {
                type: 'highlight',
                color: 'auto',
                alpha: 0.9,
                shapes: [
                    { type: 'ellipse', x: 8, y: 0, width: 3, height: 3 },
                    { type: 'ellipse', x: -8, y: 0, width: 3, height: 3 },
                    { type: 'ellipse', x: 0, y: 8, width: 3, height: 3 },
                    { type: 'ellipse', x: 0, y: -8, width: 3, height: 3 }
                ]
            },
            // Connecting circuits
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.6,
                thickness: 1,
                points: [
                    { x: -6, y: -6 },
                    { x: 0, y: 0 },
                    { x: 6, y: -6 }
                ]
            },
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.6,
                thickness: 1,
                points: [
                    { x: -6, y: 6 },
                    { x: 0, y: 0 },
                    { x: 6, y: 6 }
                ]
            }
        ], effects: {
            glow: { color: 'auto', intensity: 1.0, size: 35 }
        }
    }),

    // BOOSTER PACK - Advanced propulsion
    boosterPack: (): DetailedPartConfig => ({
        baseShape: [
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
        boundingBox: { width: 26, height: 36 },
        details: [
            // Main booster housing
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.9,
                points: [
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
                ]
            },            // Fuel injectors
            {
                type: 'engine',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'ellipse', x: -8, y: -8, width: 4, height: 6 },
                    { type: 'ellipse', x: -8, y: 8, width: 4, height: 6 },
                    { type: 'ellipse', x: -12, y: 0, width: 4, height: 8 }
                ]
            },
            // Exhaust nozzles
            {
                type: 'outline',
                color: 'auto',
                alpha: 1.0,
                thickness: 2,
                points: [
                    { x: -15, y: -8 },
                    { x: -18, y: -5 },
                    { x: -18, y: 5 },
                    { x: -15, y: 8 }
                ]
            },
            // Heat vents
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.7,
                thickness: 1,
                points: [
                    { x: 0, y: -12 },
                    { x: 3, y: -8 },
                    { x: 3, y: 8 },
                    { x: 0, y: 12 }
                ]
            }
        ], effects: {
            glow: { color: 'auto', intensity: 0.9, size: 30 },
            trail: { length: 40, fade: 0.8 }
        }
    }),

    // DELTA WINGS - Advanced wing configuration
    deltaWings: (): DetailedPartConfig => ({
        baseShape: [
            { x: 15, y: -25 },
            { x: 25, y: -15 },
            { x: 20, y: 0 },
            { x: 25, y: 15 },
            { x: 15, y: 25 },
            { x: -15, y: 15 },
            { x: -20, y: 0 },
            { x: -15, y: -15 }
        ],
        boundingBox: { width: 45, height: 50 },
        details: [
            // Main wing structure
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.8,
                points: [
                    { x: 15, y: -25 },
                    { x: 25, y: -15 },
                    { x: 20, y: 0 },
                    { x: 25, y: 15 },
                    { x: 15, y: 25 },
                    { x: -15, y: 15 },
                    { x: -20, y: 0 },
                    { x: -15, y: -15 }
                ]
            },
            // Wing spars
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.7,
                thickness: 2,
                points: [
                    { x: 0, y: 0 },
                    { x: 18, y: -18 }
                ]
            },
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.7,
                thickness: 2,
                points: [
                    { x: 0, y: 0 },
                    { x: 18, y: 18 }
                ]
            },
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.7,
                thickness: 2,
                points: [
                    { x: 0, y: 0 },
                    { x: -12, y: -12 }
                ]
            },
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.7,
                thickness: 2,
                points: [
                    { x: 0, y: 0 },
                    { x: -12, y: 12 }
                ]
            },            // Wing tip lights
            {
                type: 'highlight',
                color: 'auto',
                alpha: 0.9,
                shapes: [
                    { type: 'ellipse', x: 22, y: -12, width: 3, height: 3 },
                    { type: 'ellipse', x: 22, y: 12, width: 3, height: 3 }
                ]
            }
        ],
        effects: {
            glow: { color: 'auto', intensity: 0.5, size: 25 }
        }
    }),

    // RAILGUN - High-velocity kinetic weapon
    railgun: (): DetailedPartConfig => ({
        baseShape: [
            { x: 30, y: 0 },
            { x: 25, y: -3 },
            { x: 15, y: -6 },
            { x: 0, y: -4 },
            { x: 0, y: 4 },
            { x: 15, y: 6 },
            { x: 25, y: 3 }
        ],
        boundingBox: { width: 30, height: 12 },
        details: [
            // Main barrel
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.9,
                points: [
                    { x: 30, y: 0 },
                    { x: 25, y: -3 },
                    { x: 15, y: -6 },
                    { x: 0, y: -4 },
                    { x: 0, y: 4 },
                    { x: 15, y: 6 },
                    { x: 25, y: 3 }
                ]
            },
            // Magnetic coils
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'rect', x: 5, y: -3, width: 3, height: 6 },
                    { type: 'rect', x: 10, y: -3, width: 3, height: 6 },
                    { type: 'rect', x: 15, y: -3, width: 3, height: 6 },
                    { type: 'rect', x: 20, y: -3, width: 3, height: 6 }
                ]
            },
            // Power conduits
            {
                type: 'highlight',
                color: 'auto',
                alpha: 0.7,
                thickness: 1,
                points: [
                    { x: 0, y: -2 },
                    { x: 25, y: -2 }
                ]
            },
            {
                type: 'highlight',
                color: 'auto',
                alpha: 0.7,
                thickness: 1,
                points: [
                    { x: 0, y: 2 },
                    { x: 25, y: 2 }
                ]
            }
        ],
        effects: {
            glow: { color: 'auto', intensity: 0.6, size: 20 }
        }
    }),

    // MISSILE POD - Multi-warhead launcher
    missilePod: (): DetailedPartConfig => ({
        baseShape: [
            { x: 20, y: 0 },
            { x: 15, y: -8 },
            { x: 10, y: -12 },
            { x: 0, y: -10 },
            { x: 0, y: 10 },
            { x: 10, y: 12 },
            { x: 15, y: 8 }
        ],
        boundingBox: { width: 20, height: 24 },
        details: [
            // Pod housing
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.9,
                points: [
                    { x: 20, y: 0 },
                    { x: 15, y: -8 },
                    { x: 10, y: -12 },
                    { x: 0, y: -10 },
                    { x: 0, y: 10 },
                    { x: 10, y: 12 },
                    { x: 15, y: 8 }
                ]
            },
            // Missile tubes
            {
                type: 'weapon',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'circle', x: 8, y: -6, radius: 2 },
                    { type: 'circle', x: 8, y: -2, radius: 2 },
                    { type: 'circle', x: 8, y: 2, radius: 2 },
                    { type: 'circle', x: 8, y: 6, radius: 2 },
                    { type: 'circle', x: 12, y: -4, radius: 2 },
                    { type: 'circle', x: 12, y: 0, radius: 2 },
                    { type: 'circle', x: 12, y: 4, radius: 2 }
                ]
            },
            // Launch rails
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.7,
                thickness: 1,
                points: [
                    { x: 5, y: -8 },
                    { x: 15, y: -8 }
                ]
            },
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.7,
                thickness: 1,
                points: [
                    { x: 5, y: 8 },
                    { x: 15, y: 8 }
                ]
            }
        ],
        effects: {
            glow: { color: 'auto', intensity: 0.5, size: 18 }
        }
    }),

    // REACTIVE ARMOR - Adaptive defensive plating
    reactiveArmor: (): DetailedPartConfig => ({
        baseShape: [
            { x: 10, y: -15 },
            { x: 15, y: -10 },
            { x: 15, y: 10 },
            { x: 10, y: 15 },
            { x: -10, y: 15 },
            { x: -15, y: 10 },
            { x: -15, y: -10 },
            { x: -10, y: -15 }
        ],
        boundingBox: { width: 30, height: 30 },
        details: [
            // Main armor plates
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.9,
                points: [
                    { x: 10, y: -15 },
                    { x: 15, y: -10 },
                    { x: 15, y: 10 },
                    { x: 10, y: 15 },
                    { x: -10, y: 15 },
                    { x: -15, y: 10 },
                    { x: -15, y: -10 },
                    { x: -10, y: -15 }
                ]
            },
            // Reactive cells
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'rect', x: -8, y: -8, width: 6, height: 6 },
                    { type: 'rect', x: 2, y: -8, width: 6, height: 6 },
                    { type: 'rect', x: -8, y: 2, width: 6, height: 6 },
                    { type: 'rect', x: 2, y: 2, width: 6, height: 6 }
                ]
            },
            // Sensor nodes
            {
                type: 'highlight',
                color: 'auto',
                alpha: 0.9,
                shapes: [
                    { type: 'circle', x: -5, y: -5, radius: 1 },
                    { type: 'circle', x: 5, y: -5, radius: 1 },
                    { type: 'circle', x: -5, y: 5, radius: 1 },
                    { type: 'circle', x: 5, y: 5, radius: 1 }
                ]
            },
            // Armor seams
            {
                type: 'outline',
                color: 'auto',
                alpha: 0.6,
                thickness: 1,
                points: [
                    { x: 0, y: -12 },
                    { x: 0, y: 12 }
                ]
            },
            {
                type: 'outline',
                color: 'auto',
                alpha: 0.6,
                thickness: 1,
                points: [
                    { x: -12, y: 0 },
                    { x: 12, y: 0 }
                ]
            }
        ],
        effects: {
            glow: { color: 'auto', intensity: 0.4, size: 25 }
        }
    }),

    // ION DRIVE - Advanced propulsion system
    ionDrive: (): DetailedPartConfig => ({
        baseShape: [
            { x: 5, y: -10 },
            { x: 0, y: -12 },
            { x: -15, y: -10 },
            { x: -20, y: -5 },
            { x: -20, y: 5 },
            { x: -15, y: 10 },
            { x: 0, y: 12 },
            { x: 5, y: 10 },
            { x: 8, y: 0 }
        ],
        boundingBox: { width: 28, height: 24 },
        details: [
            // Main drive housing
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.9,
                points: [
                    { x: 5, y: -10 },
                    { x: 0, y: -12 },
                    { x: -15, y: -10 },
                    { x: -20, y: -5 },
                    { x: -20, y: 5 },
                    { x: -15, y: 10 },
                    { x: 0, y: 12 },
                    { x: 5, y: 10 },
                    { x: 8, y: 0 }
                ]
            },
            // Ion chamber
            {
                type: 'engine',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'ellipse', x: -10, y: 0, width: 8, height: 12 }
                ]
            },
            // Magnetic field generators
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.7,
                shapes: [
                    { type: 'rect', x: -18, y: -7, width: 3, height: 4 },
                    { type: 'rect', x: -18, y: 3, width: 3, height: 4 }
                ]
            },
            // Particle accelerator rings
            {
                type: 'highlight',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'ellipse', x: -10, y: 0, width: 6, height: 8 },
                    { type: 'ellipse', x: -10, y: 0, width: 4, height: 6 }
                ]
            },
            // Exhaust nozzle
            {
                type: 'vent',
                color: 'auto',
                alpha: 0.9,
                thickness: 2,
                points: [
                    { x: -18, y: -3 },
                    { x: -20, y: 0 },
                    { x: -18, y: 3 }
                ]
            }
        ],
        effects: {
            glow: { color: 'auto', intensity: 0.9, size: 28 },
            trail: { length: 35, fade: 0.9 }
        }
    }),

    // HEAVY BOMBER - Large assault vessel
    heavyBomber: (): DetailedPartConfig => ({
        baseShape: [
            { x: 40, y: 0 },
            { x: 30, y: -25 },
            { x: 15, y: -35 },
            { x: 0, y: -40 },
            { x: -20, y: -35 },
            { x: -35, y: -25 },
            { x: -45, y: -10 },
            { x: -45, y: 10 },
            { x: -35, y: 25 },
            { x: -20, y: 35 },
            { x: 0, y: 40 },
            { x: 15, y: 35 },
            { x: 30, y: 25 }
        ],
        boundingBox: { width: 85, height: 80 },
        details: [
            // Main hull
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.9,
                points: [
                    { x: 40, y: 0 },
                    { x: 30, y: -25 },
                    { x: 15, y: -35 },
                    { x: 0, y: -40 },
                    { x: -20, y: -35 },
                    { x: -35, y: -25 },
                    { x: -45, y: -10 },
                    { x: -45, y: 10 },
                    { x: -35, y: 25 },
                    { x: -20, y: 35 },
                    { x: 0, y: 40 },
                    { x: 15, y: 35 },
                    { x: 30, y: 25 }
                ]
            },
            // Command bridge
            {
                type: 'window',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'rect', x: 15, y: 0, width: 20, height: 12 }
                ]
            },
            // Heavy armor sections
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.7,
                shapes: [
                    { type: 'rect', x: 0, y: -25, width: 25, height: 15 },
                    { type: 'rect', x: 0, y: 10, width: 25, height: 15 },
                    { type: 'rect', x: -20, y: -15, width: 15, height: 30 }
                ]
            },
            // Weapon hardpoints
            {
                type: 'weapon',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'rect', x: 30, y: -20, width: 8, height: 10 },
                    { type: 'rect', x: 30, y: 10, width: 8, height: 10 },
                    { type: 'rect', x: 15, y: -30, width: 10, height: 8 },
                    { type: 'rect', x: 15, y: 22, width: 10, height: 8 },
                    { type: 'rect', x: -5, y: -35, width: 12, height: 8 },
                    { type: 'rect', x: -5, y: 27, width: 12, height: 8 }
                ]
            },
            // Engine clusters
            {
                type: 'vent',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'circle', x: -35, y: -15, radius: 4 },
                    { type: 'circle', x: -35, y: -5, radius: 4 },
                    { type: 'circle', x: -35, y: 5, radius: 4 },
                    { type: 'circle', x: -35, y: 15, radius: 4 },
                    { type: 'circle', x: -40, y: -10, radius: 3 },
                    { type: 'circle', x: -40, y: 0, radius: 3 },
                    { type: 'circle', x: -40, y: 10, radius: 3 }
                ]
            }
        ],
        effects: {
            glow: { color: 'auto', intensity: 0.8, size: 45 },
            pulses: { color: 'auto', speed: 1.2 }
        }
    }),

    // SWEPT WINGS - High-speed wing configuration
    sweptWings: (): DetailedPartConfig => ({
        baseShape: [
            { x: 20, y: -30 },
            { x: 30, y: -20 },
            { x: 25, y: 0 },
            { x: 30, y: 20 },
            { x: 20, y: 30 },
            { x: -20, y: 20 },
            { x: -25, y: 0 },
            { x: -20, y: -20 }
        ],
        boundingBox: { width: 55, height: 60 },
        details: [
            // Wing structure
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.8,
                points: [
                    { x: 20, y: -30 },
                    { x: 30, y: -20 },
                    { x: 25, y: 0 },
                    { x: 30, y: 20 },
                    { x: 20, y: 30 },
                    { x: -20, y: 20 },
                    { x: -25, y: 0 },
                    { x: -20, y: -20 }
                ]
            },
            // Swept leading edges
            {
                type: 'outline',
                color: 'auto',
                alpha: 1.0,
                thickness: 2,
                points: [
                    { x: 0, y: 0 },
                    { x: 25, y: -25 }
                ]
            },
            {
                type: 'outline',
                color: 'auto',
                alpha: 1.0,
                thickness: 2,
                points: [
                    { x: 0, y: 0 },
                    { x: 25, y: 25 }
                ]
            },
            {
                type: 'outline',
                color: 'auto',
                alpha: 1.0,
                thickness: 2,
                points: [
                    { x: 0, y: 0 },
                    { x: -20, y: -15 }
                ]
            },
            {
                type: 'outline',
                color: 'auto',
                alpha: 1.0,
                thickness: 2,
                points: [
                    { x: 0, y: 0 },
                    { x: -20, y: 15 }
                ]
            },
            // Control surfaces
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.7,
                shapes: [
                    { type: 'rect', x: 22, y: -18, width: 6, height: 4 },
                    { type: 'rect', x: 22, y: 14, width: 6, height: 4 },
                    { type: 'rect', x: -18, y: -12, width: 6, height: 4 },
                    { type: 'rect', x: -18, y: 8, width: 6, height: 4 }
                ]
            },
            // Wing tip navigation lights
            {
                type: 'highlight',
                color: 'auto',
                alpha: 0.9,
                shapes: [
                    { type: 'circle', x: 27, y: -17, radius: 2 },
                    { type: 'circle', x: 27, y: 17, radius: 2 }
                ]
            }
        ],
        effects: {
            glow: { color: 'auto', intensity: 0.4, size: 30 }
        }
    }),

    // POWER CORE - Central energy management
    powerCore: (): DetailedPartConfig => ({
        baseShape: [
            { x: 12, y: 0 },
            { x: 8, y: -8 },
            { x: 0, y: -12 },
            { x: -8, y: -8 },
            { x: -12, y: 0 },
            { x: -8, y: 8 },
            { x: 0, y: 12 },
            { x: 8, y: 8 }
        ],
        boundingBox: { width: 24, height: 24 },
        details: [
            // Core housing
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.9,
                points: [
                    { x: 12, y: 0 },
                    { x: 8, y: -8 },
                    { x: 0, y: -12 },
                    { x: -8, y: -8 },
                    { x: -12, y: 0 },
                    { x: -8, y: 8 },
                    { x: 0, y: 12 },
                    { x: 8, y: 8 }
                ]
            },
            // Energy core
            {
                type: 'engine',
                color: 'auto',
                alpha: 1.0,
                shapes: [
                    { type: 'circle', x: 0, y: 0, radius: 6 }
                ]
            },
            // Power distribution nodes
            {
                type: 'highlight',
                color: 'auto',
                alpha: 0.9,
                shapes: [
                    { type: 'circle', x: 8, y: 0, radius: 2 },
                    { type: 'circle', x: -8, y: 0, radius: 2 },
                    { type: 'circle', x: 0, y: 8, radius: 2 },
                    { type: 'circle', x: 0, y: -8, radius: 2 }
                ]
            },
            // Power conduits
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.7,
                thickness: 2,
                points: [
                    { x: 0, y: 0 },
                    { x: 6, y: 0 }
                ]
            },
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.7,
                thickness: 2,
                points: [
                    { x: 0, y: 0 },
                    { x: -6, y: 0 }
                ]
            },
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.7,
                thickness: 2,
                points: [
                    { x: 0, y: 0 },
                    { x: 0, y: 6 }
                ]
            },
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.7,
                thickness: 2,
                points: [
                    { x: 0, y: 0 },
                    { x: 0, y: -6 }
                ]
            }
        ],
        effects: {
            glow: { color: 'auto', intensity: 1.2, size: 40 },
            pulses: { color: 'auto', speed: 3 }
        }
    }),

    // SENSOR ARRAY - Advanced detection system
    sensorArray: (): DetailedPartConfig => ({
        baseShape: [
            { x: 15, y: 0 },
            { x: 12, y: -6 },
            { x: 6, y: -10 },
            { x: 0, y: -12 },
            { x: -6, y: -10 },
            { x: -12, y: -6 },
            { x: -15, y: 0 },
            { x: -12, y: 6 },
            { x: -6, y: 10 },
            { x: 0, y: 12 },
            { x: 6, y: 10 },
            { x: 12, y: 6 }
        ],
        boundingBox: { width: 30, height: 24 },
        details: [
            // Main sensor housing
            {
                type: 'fill',
                color: 'auto',
                alpha: 0.9,
                points: [
                    { x: 15, y: 0 },
                    { x: 12, y: -6 },
                    { x: 6, y: -10 },
                    { x: 0, y: -12 },
                    { x: -6, y: -10 },
                    { x: -12, y: -6 },
                    { x: -15, y: 0 },
                    { x: -12, y: 6 },
                    { x: -6, y: 10 },
                    { x: 0, y: 12 },
                    { x: 6, y: 10 },
                    { x: 12, y: 6 }
                ]
            },
            // Primary sensor dish
            {
                type: 'panel',
                color: 'auto',
                alpha: 0.8,
                shapes: [
                    { type: 'ellipse', x: 0, y: 0, width: 16, height: 12 }
                ]
            },
            // Sensor elements
            {
                type: 'highlight',
                color: 'auto',
                alpha: 0.9,
                shapes: [
                    { type: 'circle', x: 0, y: 0, radius: 3 },
                    { type: 'circle', x: 6, y: 0, radius: 1 },
                    { type: 'circle', x: -6, y: 0, radius: 1 },
                    { type: 'circle', x: 0, y: 4, radius: 1 },
                    { type: 'circle', x: 0, y: -4, radius: 1 }
                ]
            },
            // Communication arrays
            {
                type: 'vent',
                color: 'auto',
                alpha: 0.7,
                shapes: [
                    { type: 'rect', x: 10, y: -2, width: 3, height: 4 },
                    { type: 'rect', x: -10, y: -2, width: 3, height: 4 }
                ]
            },
            // Data transmission lines
            {
                type: 'window',
                color: 'auto',
                alpha: 0.6,
                thickness: 1,
                points: [
                    { x: -8, y: -6 },
                    { x: 0, y: 0 },
                    { x: 8, y: -6 }
                ]
            },
            {
                type: 'window',
                color: 'auto',
                alpha: 0.6,
                thickness: 1,
                points: [
                    { x: -8, y: 6 },
                    { x: 0, y: 0 },
                    { x: 8, y: 6 }
                ]
            }
        ],
        effects: {
            glow: { color: 'auto', intensity: 0.7, size: 35 },
            pulses: { color: 'auto', speed: 2.5 }
        }
    })
};
