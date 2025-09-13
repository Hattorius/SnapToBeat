import { Scene } from "phaser";

import song1 from "../../songs/1.json";

type NoteRow = { timeSec: number; lane: 0 | 1 };
type SongData = {
	bpm: number;
	gridSubdiv: number;
	notes: NoteRow[];
};

export class Play extends Scene {
	private music!:
		| Phaser.Sound.WebAudioSound
		| Phaser.Sound.HTML5AudioSound
		| Phaser.Sound.NoAudioSound;

	private leftX = 483 + 50;
	private rightX = 384 + 100 + 40 + 50;
	private targetY = 560;
	private startY = -40;
	private approachTime = 1.2;

	private songData!: SongData;
	private liveSprites: { sprite: Phaser.GameObjects.Rectangle; note: NoteRow }[] = [];
	private spawnedIdx = 0;
	private notesSorted: NoteRow[] = [];

	private startedAt = 0;
	private started = false;
	private offsetSec = 0;

	private hitWindow = 0.12;
	private goodWindow = 0.2;
	private missWindow = 0.25;

	private score = 0;
	private combo = 0;
	private maxCombo = 0;
	private judgetext!: Phaser.GameObjects.Text;
	private scoretext!: Phaser.GameObjects.Text;
	private combotext!: Phaser.GameObjects.Text;

	private keyLeft!: Phaser.Input.Keyboard.Key;
	private keyA!: Phaser.Input.Keyboard.Key;
	private keyRight!: Phaser.Input.Keyboard.Key;
	private keyD!: Phaser.Input.Keyboard.Key;
	private anyKey!: Phaser.Input.Keyboard.Key;

	constructor() {
		super("Play");
	}

	init(data: { fileName: string }) {
		const songID = data.fileName.split(".")[0];

		const left = this.add.container(this.leftX, 0);
		const leftEnd = this.add.rectangle(0, 560, 100, 10, 0xffffff).setOrigin(0.5, 0);
		left.add(leftEnd);
		const leftLine = this.add.rectangle(0, 0, 4, 560, 0xffffff).setOrigin(0.5, 0);
		left.add(leftLine);

		const right = this.add.container(this.rightX, 0);
		const rightEnd = this.add.rectangle(0, 560, 100, 10, 0xffffff).setOrigin(0.5, 0);
		right.add(rightEnd);
		const rightLine = this.add.rectangle(0, 0, 4, 560, 0xffffff).setOrigin(0.5, 0);
		right.add(rightLine);

		const SONGS: Record<string, SongData> = {
			"1": song1 as SongData
		};

		this.songData = SONGS[songID];
		if (!this.songData) {
			this.scene.start("MainMenu");
		}

		this.music = this.sound.add(`${songID}.mp3`, { volume: 1 });
		this.notesSorted = [...this.songData.notes].sort((a, b) => a.timeSec - b.timeSec) as NoteRow[];

		this.scoretext = this.add.text(24, 24, "Score: 0", { fontSize: "20px", color: "#ffffff" });
		this.combotext = this.add.text(24, 50, "Combo: 0", { fontSize: "20px", color: "#ffffff" });
		this.judgetext = this.add.text(24, 80, "", { fontSize: "28px", color: "#ffffff" });

		this.input.mouse?.disableContextMenu();

		this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
			if (!this.started) {
				this.startSong();
				return;
			}

			if (p.button === 0) this.tryHit(0);
			else if (p.button === 2) this.tryHit(1);
			else {
				const lane = Math.abs(p.x - this.leftX) < Math.abs(p.x - this.rightX) ? 0 : 1;
				this.tryHit(lane);
			}
		});

		const keyLeft = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
		if (keyLeft) this.keyLeft = keyLeft;

		const keyA = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
		if (keyA) this.keyA = keyA;

		const keyRight = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		if (keyRight) this.keyRight = keyRight;

		const keyD = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
		if (keyD) this.keyD = keyD;

		const anyKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
		if (anyKey) this.anyKey = anyKey;

		this.anyKey.on("down", () => {
			if (!this.started) this.startSong();
		});

		this.keyLeft.on("down", () => this.tryHit(0));
		this.keyA.on("down", () => this.tryHit(0));
		this.keyRight.on("down", () => this.tryHit(1));
		this.keyD.on("down", () => this.tryHit(1));

		this.add
			.text(this.scale.width / 2, 16, "Press SPACE or Click to Start", {
				fontSize: "18px",
				color: "#bbb"
			})
			.setOrigin(0.5, 0);
	}

	private startSong() {
		this.started = true;
		this.startedAt = this.time.now;

		this.music.play();
	}

	private getSongTime(): number {
		return this.music.seek + this.offsetSec;
	}

	update(_: number, dt: number) {
		if (!this.started) return;

		const t = this.getSongTime();

		const spawnUntil = t + this.approachTime + 0.2;
		while (
			this.spawnedIdx < this.notesSorted.length &&
			this.notesSorted[this.spawnedIdx].timeSec <= spawnUntil
		) {
			const note = this.notesSorted[this.spawnedIdx++];
			const x = note.lane === 0 ? this.leftX : this.rightX;
			const sprite = this.add.rectangle(x, this.startY, 24, 24, 0x00ffff).setOrigin(0.5);
			this.liveSprites.push({ sprite, note });
		}

		this.liveSprites.forEach((obj) => {
			const { sprite, note } = obj;
			const timeToGo = note.timeSec - t;

			const progress = Math.max(0, 1 - timeToGo / this.approachTime);
			sprite.y = this.startY + (this.targetY - this.startY) * progress;

			if (sprite.y > this.scale.height + 80) {
				sprite.destroy();
			}

			sprite.alpha =
				progress < 1 ? Phaser.Math.Clamp(progress * 1.1, 0.2, 1) : 1 - Math.min(progress - 1, 0.6);
		});

		this.liveSprites = this.liveSprites.filter((obj) => {
			const lateBy = t - obj.note.timeSec;
			if (lateBy > this.missWindow) {
				this.registerJudgement("Miss", 0, true);
				obj.sprite.destroy();
				return false;
			}
			return true;
		});

		if (this.spawnedIdx >= this.notesSorted.length && this.liveSprites.length === 0) {
			if (!this.music.isPlaying) {
				this.showResults();
			}
		}
	}

	private tryHit(lane: 0 | 1) {
		if (!this.started || !this.music.isPlaying) return;

		const t = this.getSongTime();

		let bestIdx = -1;
		let bestAbs = Number.POSITIVE_INFINITY;

		for (let i = 0; i < this.liveSprites.length; i++) {
			const { note } = this.liveSprites[i];
			if (note.lane !== lane) continue;

			const delta = note.timeSec - t;
			const abs = Math.abs(delta);
			if (abs <= this.missWindow && abs < bestAbs) {
				bestAbs = abs;
				bestIdx = i;
			}
		}

		if (bestIdx === -1) {
			this.registerJudgement("Miss", 0, true);
			return;
		}

		const hit = this.liveSprites.splice(bestIdx, 1)[0];
		hit.sprite.destroy();

		if (bestAbs <= this.hitWindow) {
			this.registerJudgement("Great", 300, false);
		} else if (bestAbs <= this.goodWindow) {
			this.registerJudgement("Good", 150, false);
		} else {
			this.registerJudgement("Miss", 0, true);
		}
	}

	private registerJudgement(label: "Great" | "Good" | "Miss", points: number, missed: boolean) {
		if (missed) {
			this.combo = 0;
		} else {
			this.combo += 1;
			this.maxCombo = Math.max(this.maxCombo, this.combo);
			this.score += points + Math.floor(this.combo * 1.5);
		}

		this.scoretext.setText(`Score: ${this.score}`);
		this.combotext.setText(`Combo: ${this.combo}`);

		this.judgetext.setText(label);
		this.tweens.killTweensOf(this.judgetext);
		this.judgetext.alpha = 1;
		this.tweens.add({
			targets: this.judgetext,
			alpha: 0,
			yoyo: false,
			duration: 300,
			delay: 150
		});
	}

	private showResults() {}
}
