/*
 * @name Multiple Objects
 * @description Create a Jitter class, instantiate multiple objects,
 * and move it around the screen.
 */

let particles = [];

export const sketch = (p) => {
	p.state = "wait_for_play";

	p.setup = function () {
		p.createCanvas(800, 400);
	};
	
	p.draw = function () {
		p.background(54, 165, 183);
		
		if (p.state === "wait_for_play") {
			p.bb = new BigButton(90);
			p.bb.display();
		}

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
		if (p.state === "playing") {
			const dp = new DecayParticle(p.mouseX, p.mouseY);
			particles.push(dp);

			const event = new Event("clickCanvas");
			p._userNode.dispatchEvent(event);
		}

		if (p.state === "wait_for_play" && p.bb.isHovered()) {
			const event = new Event("clickPlay");
			p._userNode.dispatchEvent(event);
			p.state = "playing";
		}
	};

	p.addDecayParticle = () => {
		const dp = new DecayParticle(p.random(p.width), p.random(p.height));
		particles.push(dp);
	};

	p.pause = () => {
		p.state = "wait_for_play";
	};


	class BigButton {
		constructor(size) {
			this.size = size;
			this.xpos = p.width / 2;
			this.ypos = p.height / 2;
		}

		isHovered() {
			const halfsize = this.size / 2;
			return (p.mouseX > this.xpos - halfsize && 
				p.mouseX < this.xpos + halfsize && 
				p.mouseY > this.ypos - halfsize && 
				p.mouseY < this.ypos + halfsize);
		}

		display() {
			const hovered = this.isHovered();

			const opacity = (hovered) ? 200 : 80;
			let colFill = p.color(255, 255, 255, opacity);
			p.fill(colFill);
			let colStroke = p.color(255, 255, 255);
			p.stroke(colStroke);
			p.rectMode(p.CENTER);
			p.rect(this.xpos, this.ypos, this.size, this.size, 20);

			const opacityTriangle = (hovered) ? 150 : 50;
			colFill = p.color(0, 0, 0, opacityTriangle);
			p.fill(colFill);
			p.triangle(this.xpos - (this.size*0.3), this.ypos - (this.size*0.3), this.xpos - (this.size*0.3), this.ypos + (this.size*0.3), this.xpos + (this.size*0.3), this.ypos);
		}
	}


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


