import { Scene } from "phaser";
import songsInfoJson from "../../musicInfo.json";

type SongInfo = { artist: string; title: string };

const songsInfo: Record<string, SongInfo> = songsInfoJson;

export class MainMenu extends Scene {
	private music!:
		| Phaser.Sound.WebAudioSound
		| Phaser.Sound.HTML5AudioSound
		| Phaser.Sound.NoAudioSound;
	private title!: Phaser.GameObjects.Text;
	private subtitle!: Phaser.GameObjects.Text;

	constructor() {
		super("MainMenu");
	}

	init() {
		const logo = this.add.image(100, 50, "logo");
		logo.displayWidth = 120;
		logo.displayHeight = logo.height * (120 / logo.width);

		this.music = this.sound.add("0.mp3", {
			loop: true,
			volume: 1
		});
		this.music.manager.pauseOnBlur = false;
		this.music.play();

		const currentlyPlaying = this.add.container(100, 800); // 660

		const disk = this.add.image(0, 0, "disk");
		disk.displayWidth = 48;
		disk.displayHeight = 48;

		currentlyPlaying.add(disk);

		this.tweens.add({
			targets: disk,
			angle: 360,
			duration: 2000,
			repeat: -1
		});

		this.title = this.add.text(0, disk.displayHeight / 2 + 10, songsInfo["0.mp3"].title, {
			fontFamily: "anime",
			fontSize: "18px",
			color: "#ffffff",
			align: "center"
		});
		this.title.setOrigin(0.5, 0);
		currentlyPlaying.add(this.title);

		this.subtitle = this.add.text(
			0,
			disk.displayHeight / 2 + 10 + this.title.height + 4,
			songsInfo["0.mp3"].artist,
			{
				fontFamily: "anime",
				fontSize: "10px",
				color: "#ffffff",
				align: "center"
			}
		);
		this.subtitle.setOrigin(0.5, 0);
		currentlyPlaying.add(this.subtitle);

		this.tweens.add({
			targets: currentlyPlaying,
			duration: 300,
			y: 660,
			ease: "Sine.easeInOut"
		});
	}

	create() {
		const VIEWPORT = { x: 240, y: 40, w: this.scale.width - 280, h: this.scale.height - 80 };

		const maskGfx = this.add.graphics();
		maskGfx.fillStyle(0xffffff, 1);
		maskGfx.fillRect(VIEWPORT.x, VIEWPORT.y, VIEWPORT.w, VIEWPORT.h);
		const geoMask = maskGfx.createGeometryMask();
		maskGfx.setVisible(false);

		const list = this.add.container(VIEWPORT.x + 800, VIEWPORT.y);
		list.setMask(geoMask);

		const itemHeightTotal = 94;
		const fileNames = Object.keys(songsInfo);
		fileNames.forEach((fileName, i) => {
			const y = i * itemHeightTotal;

			const item = this.add.container(0, y);

			const bg = this.add.rectangle(0, 0, VIEWPORT.w, 84, 0xffffff, 0).setOrigin(0, 0);
			bg.setStrokeStyle(2, 0xffffff, 1);

			const title = this.add.text(20, 14, songsInfo[fileName].title, {
				fontFamily: "anime",
				fontSize: "28px",
				color: "#ffffff"
			});
			const subtitle = this.add.text(20, 48, songsInfo[fileName].artist, {
				fontFamily: "anime",
				fontSize: "14px",
				color: "#ffffff"
			});

			item.add([bg, title, subtitle]);
			bg.setInteractive({ useHandCursor: true, cursor: "pointer" });

			const isVisibleInViewport = () => {
				const worldYTop = list.y + item.y + VIEWPORT.y; // container top relative to game
				const top = worldYTop;
				const bottom = top + 84;
				return bottom > VIEWPORT.y && top < VIEWPORT.y + VIEWPORT.h;
			};

			bg.on("pointerover", () => {
				if (!isVisibleInViewport()) return;
				this.tweens.add({
					targets: bg,
					fillAlpha: 1,
					duration: 120,
					ease: "Linear"
				});

				this.tweens.addCounter({
					from: 0,
					to: 100,
					duration: 120,
					onUpdate: (tween) => {
						const value = tween.getValue();
						if (!value) return;
						const r = Phaser.Math.Interpolation.Linear([255, 255], value / 100);
						const g = Phaser.Math.Interpolation.Linear([255, 23], value / 100);
						const b = Phaser.Math.Interpolation.Linear([255, 232], value / 100);
						title.setColor(Phaser.Display.Color.RGBToString(r, g, b, 0, "#"));
						subtitle.setColor(Phaser.Display.Color.RGBToString(r, g, b, 0, "#"));
					}
				});
				this.onItemHover(fileName);
			});

			bg.on("pointerout", () => {
				this.tweens.add({
					targets: bg,
					fillAlpha: 0,
					duration: 120,
					ease: "Linear"
				});

				this.tweens.addCounter({
					from: 0,
					to: 100,
					duration: 120,
					onUpdate: (tween) => {
						const value = tween.getValue();
						if (!value) return;
						const r = Phaser.Math.Interpolation.Linear([255, 255], value / 100);
						const g = Phaser.Math.Interpolation.Linear([23, 255], value / 100);
						const b = Phaser.Math.Interpolation.Linear([232, 255], value / 100);
						title.setColor(Phaser.Display.Color.RGBToString(r, g, b, 0, "#"));
						subtitle.setColor(Phaser.Display.Color.RGBToString(r, g, b, 0, "#"));
					}
				});
			});

			bg.on("pointerdown", () => {
				if (!isVisibleInViewport()) return;
				bg.scaleY = 0.98;
			});
			bg.on("pointerup", () => {
				bg.scaleY = 1;
				if (!isVisibleInViewport()) return;
				this.onItemClick(fileName);
			});

			list.add(item);
		});

		this.tweens.add({
			targets: list,
			duration: 300,
			x: VIEWPORT.x,
			ease: "Sine.easeInOut"
		});
	}

	onItemHover(fileName: string) {
		if (this.music.key === fileName) return;

		const music = this.sound.add(fileName, {
			loop: true,
			volume: 1
		});

		this.music.stop();
		music.play();
		this.music.destroy();
		this.music = music;
		this.music.manager.pauseOnBlur = false;

		this.title.setText(songsInfo[fileName].title);
		this.subtitle.setText(songsInfo[fileName].artist);
	}

	onItemClick(fileName: string) {
		this.startGame(fileName);
	}

	startGame(fileName: string) {}
}
