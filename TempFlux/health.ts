class Health {
    max: number;
    current: number;
    onDamage: Function;
    onHeal: Function;
    onDeath: Function;

    constructor(max: number) {
        this.max = max;
        this.current = max;
    }

    isDead() {
        return !(this.current > 0);
    }

    damage(amount: number) {
        if (amount <= 0) {
            return;
        }

        if (!this.isDead()) {
            this.current -= amount;
            this.current = Math.max(this.current, 0);
            if (this.onDamage != null) {
                this.onDamage();
            }

            if (this.current <= 0) {
                if (this.onDeath != null) {
                    this.onDeath();
                }
            }
        }        
    }

    heal(amount: number) {
        if (amount <= 0) {
            return;
        }

        if (!this.isDead()) {
            this.current += amount;
            this.current = Math.min(this.current, this.max);
            if (this.onHeal != null) {
                this.onHeal();
            }
        }
    }

    setMax(max: number) {
        this.current += (max - this.max);
        this.max = max;
    }
} 