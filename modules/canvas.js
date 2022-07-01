/*
 * @name Multiple Objects
 * @description Create a Jitter class, instantiate multiple objects,
 * and move it around the screen.
 */

let particles = [];

export const sketch = (p) => {
	p.setup = function () {
		p.createCanvas(800, 400);
	};

	p.draw = function () {
		p.background(54, 165, 183);

		for (let i = particles.length - 1; i >= 0; i--) {
			if (particles[i].isDead()) {
				// If we shold remove it
				particles.splice(i, 1);
			} else {
				// Otherwise, display it
				particles[i].grow();
				particles[i].display();
			}
		}
	};

	p.mousePressed = () => {
		const dp = new DecayParticle(p.mouseX, p.mouseY);
		particles.push(dp);
	};

	p.addDecayParticle = () => {
		const dp = new DecayParticle(p.random(p.width), p.random(p.height));
		particles.push(dp);
	};


	class DecayParticle {
		constructor(x, y) {
			this.x = x;
			this.y = y;
			this.diameter = 1;
			this.lifespan = 255;
		}
	
		grow() {
			this.diameter = this.diameter + 4;
			this.lifespan = this.lifespan - 5;
		}
	
		isDead() {
			return this.lifespan <= 0;
		}
	
		display() {
			p.fill(255, this.lifespan / 1.5);
			p.stroke(255, this.lifespan / 0.1);
			p.ellipse(this.x, this.y, this.diameter, this.diameter);
		}
	}
};


