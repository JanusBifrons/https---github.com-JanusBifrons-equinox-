import * as PIXI from 'pixi.js';

export interface ShieldConfig {
    radius: number;
    strength: number; // Shield health
    rechargeRate: number; // Shield recharge per second
    rechargeDelay: number; // Delay before recharge starts (ms)
    color: number;
    opacity: number;
}

export class ShieldBubble {
    public graphic: PIXI.Graphics;
    private config: ShieldConfig;
    private currentStrength: number;
    private lastDamageTime: number = 0;
    private isRecharging: boolean = false;
    private animationTime: number = 0;
    private hitEffects: PIXI.Graphics[] = [];

    constructor(config: ShieldConfig) {
        this.config = config;
        this.currentStrength = config.strength;

        this.graphic = new PIXI.Graphics();
        this.updateGraphics();
    }

    public update(deltaTime: number): void {
        this.animationTime += deltaTime;

        // Handle shield recharge
        const timeSinceLastDamage = Date.now() - this.lastDamageTime;
        if (timeSinceLastDamage > this.config.rechargeDelay && this.currentStrength < this.config.strength) {
            this.isRecharging = true;
            this.currentStrength = Math.min(
                this.config.strength,
                this.currentStrength + this.config.rechargeRate * (deltaTime / 1000)
            );
        }

        // Update hit effects
        this.hitEffects = this.hitEffects.filter(effect => {
            effect.alpha -= deltaTime * 0.003;
            if (effect.alpha <= 0) {
                if (effect.parent) {
                    effect.parent.removeChild(effect);
                }
                return false;
            }
            return true;
        });

        this.updateGraphics();
    }

    private updateGraphics(): void {
        this.graphic.clear();

        if (this.currentStrength <= 0) {
            return; // No shield to display
        }

        const strengthRatio = this.currentStrength / this.config.strength;
        const radius = this.config.radius;

        // Animate shield with gentle pulsing
        const pulseIntensity = 0.1;
        const pulse = Math.sin(this.animationTime * 0.003) * pulseIntensity + 1;
        const animatedRadius = radius * pulse;

        // Shield opacity based on strength
        const baseOpacity = this.config.opacity * strengthRatio;
        const animatedOpacity = baseOpacity * (0.8 + pulse * 0.2);

        // Draw main shield bubble
        this.graphic.beginFill(this.config.color, animatedOpacity * 0.3);
        this.graphic.lineStyle(2, this.config.color, animatedOpacity);
        this.graphic.drawCircle(0, 0, animatedRadius);
        this.graphic.endFill();

        // Add energy patterns for visual interest
        this.drawEnergyPatterns(animatedRadius, animatedOpacity);

        // Recharge effect
        if (this.isRecharging && strengthRatio < 1.0) {
            this.drawRechargeEffect(animatedRadius, strengthRatio);
        }
    }

    private drawEnergyPatterns(radius: number, opacity: number): void {
        const patternCount = 6;
        const angleStep = (Math.PI * 2) / patternCount;

        for (let i = 0; i < patternCount; i++) {
            const angle = i * angleStep + this.animationTime * 0.001;
            const x1 = Math.cos(angle) * radius * 0.7;
            const y1 = Math.sin(angle) * radius * 0.7;
            const x2 = Math.cos(angle) * radius * 0.9;
            const y2 = Math.sin(angle) * radius * 0.9;

            this.graphic.lineStyle(1, this.config.color, opacity * 0.6);
            this.graphic.moveTo(x1, y1);
            this.graphic.lineTo(x2, y2);
        }
    }

    private drawRechargeEffect(radius: number, strengthRatio: number): void {
        // Rotating recharge indicators
        const rechargeSpeed = 0.01;
        const rechargeAngle = this.animationTime * rechargeSpeed;

        // Draw progress arc
        const startAngle = -Math.PI / 2; // Start from top
        const endAngle = startAngle + (Math.PI * 2 * strengthRatio);

        this.graphic.lineStyle(3, 0x00ffff, 0.8);
        this.graphic.arc(0, 0, radius + 5, startAngle, endAngle);

        // Add sparks around the shield
        for (let i = 0; i < 4; i++) {
            const sparkAngle = rechargeAngle + i * Math.PI * 0.5;
            const sparkX = Math.cos(sparkAngle) * (radius + 8);
            const sparkY = Math.sin(sparkAngle) * (radius + 8);

            this.graphic.beginFill(0x00ffff, 0.7);
            this.graphic.drawCircle(sparkX, sparkY, 2);
            this.graphic.endFill();
        }
    }

    public takeDamage(damage: number, impactPoint?: { x: number; y: number }): number {
        if (this.currentStrength <= 0) {
            return damage; // Shield is down, return full damage
        }

        const actualDamage = Math.min(damage, this.currentStrength);
        this.currentStrength -= actualDamage;
        this.lastDamageTime = Date.now();
        this.isRecharging = false;

        // Create hit effect at impact point
        if (impactPoint) {
            this.createHitEffect(impactPoint.x, impactPoint.y);
        }

        // Return overflow damage
        return damage - actualDamage;
    }

    private createHitEffect(x: number, y: number): void {
        const hitEffect = new PIXI.Graphics();
        hitEffect.beginFill(this.config.color, 0.8);

        // Draw impact ripples
        for (let i = 0; i < 3; i++) {
            const radius = 5 + i * 8;
            hitEffect.lineStyle(2 - i, this.config.color, 0.8 - i * 0.2);
            hitEffect.drawCircle(x, y, radius);
        }

        hitEffect.endFill();
        hitEffect.alpha = 1.0;

        this.graphic.addChild(hitEffect);
        this.hitEffects.push(hitEffect);
    }

    public getStrength(): number {
        return this.currentStrength;
    }

    public getMaxStrength(): number {
        return this.config.strength;
    }

    public getStrengthRatio(): number {
        return this.currentStrength / this.config.strength;
    }

    public isActive(): boolean {
        return this.currentStrength > 0;
    }

    public setPosition(x: number, y: number): void {
        this.graphic.position.set(x, y);
    }

    public boost(amount: number): void {
        this.currentStrength = Math.min(this.config.strength, this.currentStrength + amount);
    }

    public reset(): void {
        this.currentStrength = this.config.strength;
        this.lastDamageTime = 0;
        this.isRecharging = false;
        this.hitEffects = [];
    }
}
