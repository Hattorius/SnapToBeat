import { Scene } from "phaser";
import { GradientBackground } from "../bg/gradient";

export class Preloader extends Scene {
	logo!: Phaser.GameObjects.Image;
	bar!: Phaser.GameObjects.Rectangle;
	barWrapper!: Phaser.GameObjects.Rectangle;

	constructor() {
		super("Preloader");
	}

	create() {
		// new GradientBackground(this, {
		// 	colors: ["#a200b8", "#ff17e8", "#fd6eef"],
		// 	speed: 0.5
		// });
	}

	init() {
		this.logo = this.add.image(512, 260, "logo");
		this.logo.displayWidth = 300;
		this.logo.displayHeight = this.logo.height * (300 / this.logo.width);

		this.barWrapper = this.add.rectangle(512, 384, 468, 32);
		this.barWrapper.setStrokeStyle(1, 0xffffff);

		this.bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);
		this.load.on("progress", (progress: number) => {
			this.bar.width = 4 + 460 * progress;
		});

		this.load.on("complete", () => {
			this.bar.width = 4 + 460;
			this.goToMenu();
		});
	}

	preload() {
		this.load.setPath("assets");
	}

	goToMenu() {
		this.tweens.add({
			targets: this.logo,
			x: 100,
			y: 50,
			displayWidth: 120,
			displayHeight: this.logo.height * (120 / this.logo.width),
			duration: 1200,
			ease: "Sine.easeInOut",
			onComplete: () => {
				this.scene.start("MainMenu");
			}
		});

		this.tweens.add({
			targets: [this.bar, this.barWrapper],
			alpha: 0,
			duration: 600,
			ease: "Linear"
		});
	}
}
