var Health = (function () {
    function Health(max) {
        this.max = max;
        this.current = max;
    }
    Health.prototype.isDead = function () {
        return !(this.current > 0);
    };

    Health.prototype.damage = function (amount) {
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
    };

    Health.prototype.heal = function (amount) {
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
    };

    Health.prototype.setMax = function (max) {
        this.current += (max - this.max);
        this.max = max;
    };
    return Health;
})();
//# sourceMappingURL=health.js.map
