class Sprite { //whenever new sprite instance is created
	constructor({
		position, 
		velocity, 
		image, 
		frames = {max: 1, hold: 10}, 
		sprites, 
		animate = false, 
		rotation = 0,
	}) { //automatically call constructor() code
		this.position = position
		this.image = new Image()
		this.frames = {...frames, val: 0, elapsed: 0}

		this.image.onload = () => {
			this.width = this.image.width / this.frames.max;
			this.height = this.image.height;
		}

		this.image.src = image.src

		this.animate = animate
		this.sprites = sprites
		this.opacity = 1
		this.rotation = rotation
	}

	draw() {
		c.save()
		c.translate(
			this.position.x + this.width / 2, 
			this.position.y + this.height / 2
		)
		c.rotate(this.rotation) //units are in radian
		c.translate(
			-this.position.x - this.width / 2, 
			-this.position.y - this.height / 2
		)
		c.globalAlpha = this.opacity
		c.drawImage(
			this.image, 
			//cropping position of this.image
			this.frames.val * this.width, 
			0, 
			this.image.width / this.frames.max, //width of this.image
			this.image.height, //height of this.image
			//placement of this.image
			this.position.x,
			this.position.y,
			this.image.width / this.frames.max, //width of this.image
			this.image.height, //height of this.image
		)
		c.restore()

		if (!this.animate) return

		if (this.frames.max > 1) {
			this.frames.elapsed++
		}

		if (this.frames.elapsed % this.frames.hold === 0) {
			if (this.frames.val < this.frames.max-1) this.frames.val++
			else this.frames.val = 0
		}
	}
}

class Monster extends Sprite {
	constructor({
		position, 
		velocity, 
		image, 
		frames = {max: 1, hold: 10}, 
		sprites, 
		animate = false, 
		rotation = 0,
		isEnemy = false, 
		name,
		attacks
	}) {
		super({
			position, 
			velocity, 
			image, 
			frames, 
			sprites, 
			animate, 
			rotation
		})
		this.health = 100
		this.isEnemy = isEnemy
		this.name = name
		this.attacks = attacks
	}

	faint() {
		document.querySelector('#dialogueBox').innerHTML = this.name + ' fainted!'
		gsap.to(this.position, {
			y: this.position.y + 20
		})
		gsap.to(this, {
			opacity: 0
		})
		audio.battle.stop()
		audio.victory.play()
	}

	attack({attack, recipient, renderedSprites}) {
		document.querySelector('#dialogueBox').style.display = 'block' //dialogueBox on index.html shows up again
		document.querySelector('#dialogueBox').innerHTML = this.name + ' used ' + attack.name

		let healthBar = '#enemyHealthBar'
		if (this.isEnemy) healthBar = '#playerHealthBar'

		let rotation = 1
		if (this.isEnemy) rotation = -2.2

		recipient.health -= attack.damage

		switch (attack.name) {
			case 'Fireball': 
				audio.initFireball.play()
				const fireballImage = new Image()
				fireballImage.src = './img/fireball.png'
				const fireball = new Sprite({
					position: {
						x: this.position.x,
						y: this.position.y
					},
					image: fireballImage,
					frames: {
						max: 4,
						hold: 10
					},
					animate: true,
					rotation
				})
				renderedSprites.splice(1, 0, fireball)

				gsap.to(fireball.position, {
					x: recipient.position.x,
					y: recipient.position.y,
					onComplete: () => {
						audio.fireballHit.play()
						gsap.to(healthBar, {
							width: recipient.health + '%'
						})

						gsap.to(recipient.position, {
							x: recipient.position.x + 10,
							yoyo: true,
							repeat: 5, 
							duration: 0.08
						})

						gsap.to(recipient, {
							opacity: 0,
							repeat: 5,
							yoyo: true,
							duration: 0.08
						})
						renderedSprites.splice(1,1)
					}
				})
			break

			case 'Tackle':
				const tl = gsap.timeline()

				let movementDistance = 20
				if (this.isEnemy) movementDistance = -20
			
				tl.to(this.position, {
					x: this.position.x - movementDistance
				}).to(this.position, {
					x: this.position.x + movementDistance * 2,
					duration: 0.1,
					onComplete: () => {
						audio.tackleHit.play()
						gsap.to(healthBar, {
							width: recipient.health + '%'
						})

						gsap.to(recipient.position, {
							x: recipient.position.x + 10,
							yoyo: true,
							repeat: 5, 
							duration: 0.08
						})

						gsap.to(recipient, {
							opacity: 0,
							repeat: 5,
							yoyo: true,
							duration: 0.08
						})
					}
				})
				.to(this.position, {
					x: this.position.x
				})
			break
		}
	}
}

class Boundary {
	static width = 72
	static height = 72
	constructor({position}) {
		this.position = position
		this.width = 72
		this.height = 72
	}

	draw() {
		c.fillStyle='rgba(255, 0, 0, 0.0)'
		c.fillRect(this.position.x, this.position.y, this.width, this.height)
	}
}