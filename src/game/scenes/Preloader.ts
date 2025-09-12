import { Scene } from "phaser";
import songsInfo from "../../musicInfo.json";

export class Preloader extends Scene {
	logo!: Phaser.GameObjects.Image;
	bar!: Phaser.GameObjects.Rectangle;
	barWrapper!: Phaser.GameObjects.Rectangle;

	constructor() {
		super("Preloader");
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
		this.load.font("anime", "fonts/ComicShark.ttf");
		this.load.image("RectangleButton_X2", "UIAnimeNovellaCasual/BigButtons/RectangleButton_X2.png");
		this.load.image("disk", "qlementine-icons--disk-16.svg");

		const songs = Object.keys(songsInfo);
		songs.forEach((song) => {
			this.load.audio(song, `music/${song}`);
		});
	}

	goToMenu() {
		const button = this.add
			.image(512, 469, "RectangleButton_X2")
			.setInteractive({ useHandCursor: true, cursor: "pointer" });

		const text = this.add
			.text(button.x, button.y - 2, "Play", {
				fontFamily: "anime",
				fontSize: "28px",
				color: "#fd6eef"
			})
			.setOrigin(0.5);

		button.on("pointerover", () => {
			button.setTint(0xfbe6ff);
		});

		button.on("pointerout", () => {
			button.clearTint();
		});

		button.on("pointerdown", () => {
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
				targets: [this.bar, this.barWrapper, button, text],
				alpha: 0,
				duration: 600,
				ease: "Linear"
			});
		});
	}
}
