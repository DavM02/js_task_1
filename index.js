class Battle {
    constructor() {
        this.gladiators = [];
        this.container = document.querySelector('.container');
        this.startButton = document.querySelector('button');
    }

    // Methods for initialization
    generateRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateRandomFloat(min, max, step) {
        const range = (max - min) / step;
        return Math.round(Math.random() * range) * step + min;
    }

    generateRandomName() {
        return faker.name.findName();
    }

    createGladiator() {
        const health = this.generateRandomNumber(80, 100);
        const speed = this.generateRandomFloat(1, 5, 0.001);

        return {
            health: health,
            power: this.generateRandomFloat(2, 5, 0.1),
            speed: speed,
            name: this.generateRandomName(),
            initialHealth: health,   
            initialSpeed: speed     
        };
    }
    createGladiators() {
        const gladiatorsCount = this.generateRandomNumber(2, 8);
        this.gladiators = Array.from({ length: gladiatorsCount }, () => this.createGladiator());
    }

    // Methods for battle
    reduceHealthWithPower(id, power) {
        if (!this.gladiators[id]) return;

        const opponent = this.gladiators[id];
        
        opponent.health = Math.round(opponent.health - power);

        if (opponent.health <= 0) {
            this.displayActionOnUi(`[${opponent.name}] is dying`);
            this.makeDecision(id);
            return;
        }
        if (opponent.health <= 30) {
            this.tripleSpeed(id);
        }
        this.adjustSpeed(id);
    }


    adjustSpeed(id) {
        const opponent = this.gladiators[id];
        const { initialSpeed, health, initialHealth } = opponent
        opponent.speed = initialSpeed * (health / initialHealth);
    }

    tripleSpeed(id) {
        const opponent = this.gladiators[id];
        opponent.speed *= 3;
    }

    async startFight() {
        const attackPromises = this.gladiators.map((_, id) => this.makeAttack(id));
        await Promise.all(attackPromises);
    }

    makeAttack(id) {
        if (!this.gladiators[id]) return;

        const attacker = this.gladiators[id];
        if (!attacker) return;

        let opponentIndex;
        do {
            opponentIndex = this.generateRandomNumber(0, this.gladiators.length - 1);
        } while (opponentIndex === id || !this.gladiators[opponentIndex]);

        const opponent = this.gladiators[opponentIndex];
        if (!opponent) return;

        const attackInterval = 6 - attacker.speed;

        return new Promise(resolve => {
            setTimeout(() => {

                if (!this.gladiators[id] || !this.gladiators[opponentIndex]) return resolve();

                this.displayActionOnUi(`[${attacker.name} x ${attacker.health}] hits [${opponent.name} x ${opponent.health}] with power ${attacker.power}`);
                this.reduceHealthWithPower(opponentIndex, attacker.power);
                resolve();
            }, attackInterval * 600);
        });
    }



    async continueFight() {
        while (this.gladiators.length > 1) {
            await this.startFight();
        }
        if (this.gladiators.length === 1) {
            this.declareWinner();
        }
    }

    makeDecision(id) {
        const continueBattle = this.generateRandomNumber(0, 1);
        const opponent = this.gladiators[id];
        const name = opponent.name;

        if (continueBattle) {
            opponent.health = 50;
            this.displayActionOnUi(`Caesar made decision to continue with [${name}], +50 health points`);

        } else {
            this.removeGladiator(id);
            this.displayActionOnUi(`Caesar made decision to continue without [${name}]`);

        }

        this.updateCountDisplay()
    }

    removeGladiator(id) {
        this.gladiators.splice(id, 1);
    }

    declareWinner() {
        this.displayActionOnUi(`[${this.gladiators[0].name}] won the battle with health x ${this.gladiators[0].health}!`);
        this.resetGame()
    }

    resetGame() {
        this.updateCountDisplay()
        this.startButton.removeAttribute('disabled')
        this.gladiators = [];
        this.startBattle();
    }

    // Methods for UI
    displayActionOnUi(text) {
        const p = document.createElement("p");
        p.innerText = text;

        if (text.includes("dying")) {
            p.style.color = "red";
        }
        if (text.includes("won")) {
            p.style.color = "blue";
            p.style.fontSize = "40px";
        }
        if (text.includes("decision")) {
            p.style.color = "#ff7600";
            p.style.fontSize = "30px";
        }

        this.container.appendChild(p);
        this.removeActionFromUi(p);
    }

    removeActionFromUi(p) {
        setTimeout(() => {
            p.style.opacity = 0;
            p.addEventListener("transitionend", () => p.remove());
        }, 6000);
    }

    startBattle() {

        this.startButton.addEventListener('click', () => {
            this.createGladiators();
            this.updateCountDisplay()
            this.startButton.setAttribute('disabled', true);
            this.continueFight();
        }, { once: true });

    }


    updateCountDisplay() {
        const count = document.querySelector('h3')
        count.innerText = `gladiators count: ${this.gladiators.length}`
    }



    updateOnWindowVisibilityChange() {
        document.addEventListener("visibilitychange", () => {
            document.querySelectorAll('p').forEach((el) => {
                if (el.style.opacity === '0') {
                    el.remove()
                }
            })
        })
    }


}

const createBattle = new Battle();

createBattle.startBattle()
createBattle.updateOnWindowVisibilityChange()


 
