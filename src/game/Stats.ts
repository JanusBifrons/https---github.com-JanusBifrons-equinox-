// Ship Statistics Management System
// Based on modular stats system with proper encapsulation and regeneration mechanics

export class Stats {

    ///
    /// PRIVATE PROPERTIES - CAPS AND REGENERATION
    ///

    /// SHIELD SYSTEM
    private _shieldRegenerationDelay: number; // Delay before shield regen starts (ms)
    private _shieldRegenTimer: number; // Current countdown timer
    private _shieldRegen: number; // Shield regen per second
    private _shieldCap: number; // Maximum shield capacity

    /// ARMOR SYSTEM  
    private _armorRegen: number; // Armor regen per second
    private _armorCap: number; // Maximum armor capacity

    /// HULL SYSTEM
    private _hullRegen: number; // Hull regen per second
    private _hullCap: number; // Maximum hull capacity

    /// POWER SYSTEM
    private _powerRegen: number; // Power regen per second
    private _powerCap: number; // Maximum power capacity

    /// MOVEMENT STATS
    public torque: number; // Ship rotation capability
    public acceleration: number; // Ship acceleration capability

    ///
    /// CURRENT VALUES
    ///
    public shields: number;
    public armor: number;
    public hull: number;
    public power: number;

    constructor(
        shieldCap: number = 100,
        armorCap: number = 50,
        hullCap: number = 75,
        powerCap: number = 200,
        torque: number = 0.10,
        acceleration: number = 10
    ) {
        // Initialize shield system
        this._shieldRegenerationDelay = 3000; // 3 seconds before shield regen starts
        this._shieldRegenTimer = 0; // No delay initially
        this._shieldRegen = 25; // 25 points per second when regenerating
        this._shieldCap = shieldCap;
        this.shields = this._shieldCap; // Start with full shields

        // Initialize armor system
        this._armorCap = armorCap;
        this.armor = this._armorCap; // Start with full armor
        this._armorRegen = 2; // Slow armor regeneration

        // Initialize hull system
        this._hullCap = hullCap;
        this.hull = this._hullCap; // Start with full hull
        this._hullRegen = 1.5; // Very slow hull regeneration

        // Initialize power system
        this._powerCap = powerCap;
        this.power = this._powerCap; // Start with full power
        this._powerRegen = 15; // 15 points per second

        // Movement characteristics
        this.torque = torque;
        this.acceleration = acceleration;
    }

    ///
    /// PUBLIC METHODS
    ///

    /**
     * Update stats regeneration based on elapsed time
     * @param elapsed Time elapsed in milliseconds
     */
    public update(elapsed: number): void {
        this.regenerateStats(elapsed);
    }

    /**
     * Apply damage to the ship using the damage cascade system
     * @param totalDamage Amount of damage to apply
     * @returns true if the ship is destroyed, false otherwise
     */
    public applyDamage(totalDamage: number): boolean {
        let remainingDamage = totalDamage;

        // Reset shield regeneration timer when taking damage
        this._shieldRegenTimer = this._shieldRegenerationDelay;

        // Phase 1: Damage shields first
        if (this.shields > 0 && remainingDamage > 0) {
            const shieldDamage = Math.min(remainingDamage, this.shields);
            this.shields -= shieldDamage;
            remainingDamage -= shieldDamage;
        }

        // Phase 2: Damage armor second
        if (this.armor > 0 && remainingDamage > 0) {
            const armorDamage = Math.min(remainingDamage, this.armor);
            this.armor -= armorDamage;
            remainingDamage -= armorDamage;
        }

        // Phase 3: Damage hull last
        if (this.hull > 0 && remainingDamage > 0) {
            const hullDamage = Math.min(remainingDamage, this.hull);
            this.hull -= hullDamage;
        }

        // Ship is destroyed if hull reaches 0
        return this.hull <= 0;
    }

    /**
     * Consume power for actions like shooting or afterburner
     * @param amount Amount of power to consume
     * @returns true if power was available and consumed, false otherwise
     */
    public consumePower(amount: number): boolean {
        if (this.power >= amount) {
            this.power -= amount;
            this.clampPower();
            return true;
        }
        return false;
    }

    /**
     * Restore all stats to maximum values
     */
    public restoreToFull(): void {
        this.shields = this._shieldCap;
        this.armor = this._armorCap;
        this.hull = this._hullCap;
        this.power = this._powerCap;
        this._shieldRegenTimer = 0; // Reset shield delay
    }

    ///
    /// PRIVATE METHODS
    ///

    private regenerateStats(elapsed: number): void {
        // Convert elapsed time to seconds for regeneration calculations
        const deltaTime = elapsed / 1000;

        // Update shield regeneration timer
        if (this._shieldRegenTimer > 0) {
            this._shieldRegenTimer -= elapsed;
        }

        // Calculate regeneration amounts for this frame
        const armorRegenAmount = this._armorRegen * deltaTime;
        const hullRegenAmount = this._hullRegen * deltaTime;
        const powerRegenAmount = this._powerRegen * deltaTime;

        // Regenerate armor (slow)
        if (this.armor < this._armorCap) {
            this.armor += armorRegenAmount;
        }

        // Regenerate hull (very slow)
        if (this.hull < this._hullCap) {
            this.hull += hullRegenAmount;
        }

        // Regenerate power (fast)
        if (this.power < this._powerCap) {
            this.power += powerRegenAmount;
        }

        // Regenerate shields (only after delay period)
        if (this._shieldRegenTimer <= 0 && this.shields < this._shieldCap) {
            const shieldRegenAmount = this._shieldRegen * deltaTime;
            this.shields += shieldRegenAmount;
        }

        // Clamp all values to their valid ranges
        this.clampAllStats();
    }

    private clampAllStats(): void {
        this.clampShields();
        this.clampArmor();
        this.clampHull();
        this.clampPower();
    }

    private clampShields(): void {
        this.shields = Math.max(0, Math.min(this._shieldCap, this.shields));
    }

    private clampArmor(): void {
        this.armor = Math.max(0, Math.min(this._armorCap, this.armor));
    }

    private clampHull(): void {
        this.hull = Math.max(0, Math.min(this._hullCap, this.hull));
    }

    private clampPower(): void {
        this.power = Math.max(0, Math.min(this._powerCap, this.power));
    }

    ///
    /// GETTERS AND SETTERS
    ///

    // Percentage getters for UI display
    public get shieldPercent(): number {
        if (this._shieldCap === 0) return 0;
        return (this.shields / this._shieldCap) * 100;
    }

    public get armorPercent(): number {
        if (this._armorCap === 0) return 0;
        return (this.armor / this._armorCap) * 100;
    }

    public get hullPercent(): number {
        if (this._hullCap === 0) return 0;
        return (this.hull / this._hullCap) * 100;
    }

    public get powerPercent(): number {
        if (this._powerCap === 0) return 0;
        return (this.power / this._powerCap) * 100;
    }

    // Capacity getters
    public get shieldCap(): number { return this._shieldCap; }
    public get armorCap(): number { return this._armorCap; }
    public get hullCap(): number { return this._hullCap; }
    public get powerCap(): number { return this._powerCap; }

    // Regeneration rate getters
    public get shieldRegen(): number { return this._shieldRegen; }
    public get armorRegen(): number { return this._armorRegen; }
    public get hullRegen(): number { return this._hullRegen; }
    public get powerRegen(): number { return this._powerRegen; }

    // Check if shields are regenerating
    public get isShieldRegenerating(): boolean {
        return this._shieldRegenTimer <= 0 && this.shields < this._shieldCap;
    }

    // Check if ship is destroyed
    public get isDestroyed(): boolean {
        return this.hull <= 0;
    }

    ///
    /// UTILITY METHODS
    ///

    public toString(): string {
        return `Shields: ${Math.round(this.shields)}, Armor: ${Math.round(this.armor)}, Hull: ${Math.round(this.hull)}, Power: ${Math.round(this.power)}`;
    }

    /**
     * Create stats configuration for different ship types
     */
    public static createForShipType(shipType: string): Stats {
        switch (shipType) {
            case 'razorInterceptor':
            case 'strikeInterceptor':
            case 'phantomInterceptor':
                return new Stats(50, 25, 25, 100, 0.15, 12);

            case 'assault':
                return new Stats(75, 50, 50, 150, 0.12, 8);

            case 'capital':
                return new Stats(150, 100, 100, 300, 0.08, 5);

            case 'compact':
            default:
                return new Stats(100, 50, 75, 200, 0.10, 10);
        }
    }
}
