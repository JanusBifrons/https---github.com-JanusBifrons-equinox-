// Simple Geometric Ship Parts System
// Basic rectangles that touch each other for realistic appearance

import { ShipPartConfig, PartType, ShipColor } from './ShipParts';

// Basic geometric shape building blocks - using standard 20x10 rectangle
const STANDARD_WIDTH = 20;
const STANDARD_HEIGHT = 10;

const createStandardRectangle = (offsetX: number = 0, offsetY: number = 0): Array<{ x: number, y: number }> => {
    const w = STANDARD_WIDTH / 2;
    const h = STANDARD_HEIGHT / 2;
    return [
        { x: -w + offsetX, y: -h + offsetY },
        { x: w + offsetX, y: -h + offsetY },
        { x: w + offsetX, y: h + offsetY },
        { x: -w + offsetX, y: h + offsetY }
    ];
};

const createCircle = (radius: number, segments: number = 12, offsetX: number = 0, offsetY: number = 0): Array<{ x: number, y: number }> => {
    const vertices = [];
    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        vertices.push({
            x: Math.cos(angle) * radius + offsetX,
            y: Math.sin(angle) * radius + offsetY
        });
    }
    return vertices;
};

// Simple ship components - rectangles that connect/touch each other
export const SimpleShipComponents = {    // BASIC FIGHTER - Main body with two engine rectangles
    basicFighter: (color: ShipColor): ShipPartConfig => ({
        type: PartType.COCKPIT,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            // Main body rectangle (standard 20x10)
            ...createStandardRectangle(0, 0),
            // Left engine rectangle touching back left
            ...createStandardRectangle(-20, -7.5),
            // Right engine rectangle touching back right  
            ...createStandardRectangle(-20, 7.5)
        ],
        effects: { trail: true, glow: true }
    }),

    // COMPACT SHIP - Single standard rectangle
    compactShip: (color: ShipColor): ShipPartConfig => ({
        type: PartType.COCKPIT,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: createStandardRectangle(0, 0),
        effects: { trail: true, glow: true }
    }),    // ASSAULT SHIP - Main rectangle with attached sections
    assaultShip: (color: ShipColor): ShipPartConfig => ({
        type: PartType.COCKPIT,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            // Main hull rectangle (standard 20x10)
            ...createStandardRectangle(0, 0),
            // Forward section touching the front
            ...createStandardRectangle(20, 0),
            // Left side pod touching the left
            ...createStandardRectangle(0, -15),
            // Right side pod touching the right
            ...createStandardRectangle(0, 15)
        ],
        effects: { trail: true, glow: true }
    }),

    // CAPITAL SHIP - Large main rectangle with multiple sections
    capitalShip: (color: ShipColor): ShipPartConfig => ({
        type: PartType.COCKPIT,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            // Main hull rectangle (standard 20x10)
            ...createStandardRectangle(0, 0),
            // Forward command section touching the front
            ...createStandardRectangle(20, 0),
            // Left wing section touching the left
            ...createStandardRectangle(0, -15),
            // Right wing section touching the right
            ...createStandardRectangle(0, 15),
            // Rear engine section touching the back
            ...createStandardRectangle(-20, 0)
        ],
        effects: { trail: true, glow: true }
    }),

    // WINGS - Simple rectangular wings extending from sides
    basicWings: (color: ShipColor): ShipPartConfig => ({
        type: PartType.WING,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: [
            // Left wing rectangle
            ...createStandardRectangle(0, -15),
            // Right wing rectangle
            ...createStandardRectangle(0, 15)
        ],
        effects: {}
    }),

    // ENGINE - Standard rectangular engine block at the back
    basicEngine: (color: ShipColor): ShipPartConfig => ({
        type: PartType.ENGINE,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: createStandardRectangle(-20, 0),
        effects: { trail: true, glow: true }
    }),

    // WEAPON - Standard rectangular weapon at front
    basicWeapon: (color: ShipColor): ShipPartConfig => ({
        type: PartType.WEAPON,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: createStandardRectangle(20, 0),
        effects: { glow: true }
    }),

    // SHIELD - Circular shield (only circular component as per requirements)
    basicShield: (color: ShipColor): ShipPartConfig => ({
        type: PartType.ARMOR,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: createCircle(25, 16, 0, 0),
        effects: { shield: true, glow: true }
    }),    // THRUSTER - Standard rectangular thruster at rear position
    basicThruster: (color: ShipColor): ShipPartConfig => ({
        type: PartType.THRUSTER,
        color,
        position: { x: 0, y: 0 },
        rotation: 0,
        vertices: createStandardRectangle(-20, 0),
        effects: { trail: true, glow: true }
    })
};

// Ship configurations using simple components
export const SimpleShipConfigurations = {
    // Single component ships
    compact: [SimpleShipComponents.compactShip],
    basicFighter: [SimpleShipComponents.basicFighter],

    // Multi-component ships with parts that complement each other
    assault: [SimpleShipComponents.assaultShip, SimpleShipComponents.basicWings],
    capital: [SimpleShipComponents.capitalShip, SimpleShipComponents.basicShield],

    // Interceptor variants
    razorInterceptor: [SimpleShipComponents.basicFighter, SimpleShipComponents.basicWings],
    strikeInterceptor: [SimpleShipComponents.compactShip, SimpleShipComponents.basicWeapon],
    phantomInterceptor: [SimpleShipComponents.basicFighter, SimpleShipComponents.basicShield]
};