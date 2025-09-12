import { Display, type GameObjects, type Scene, type Textures } from "phaser";

export interface GradientOptions {
	colors: string[];
	speed?: number;
	angleDeg?: number;
	key?: string;
}

export class GradientBackground {
	private scene: Scene;
	private canvas!: Textures.CanvasTexture;
	private image!: GameObjects.Image;
	private elapsed = 0;
	private colors: Display.Color[];
	private speed: number;
	private angleRad: number;
	private key: string;

	constructor(scene: Scene, opts: GradientOptions) {
		this.scene = scene;
		this.colors = opts.colors.map((c) => Display.Color.HexStringToColor(c));
		this.speed = opts.speed ?? 0.25;
		this.angleRad = ((opts.angleDeg ?? 45) * Math.PI) / 180;
		this.key = opts.key ?? `GradientBG_${scene.sys.settings.key}`;

		const canvas = scene.textures.createCanvas(this.key, scene.scale.width, scene.scale.height);
		if (canvas) this.canvas = canvas;
		this.image = scene.add.image(0, 0, this.key).setOrigin(0).setDepth(-9999);

		this.redraw(0);

		scene.events.on("update", this.update, this);
		scene.scale.on("resize", this.onResize, this);
		scene.events.once("shutdown", this.destroy, this);
		scene.events.once("destroy", this.destroy, this);
	}

	private update(_time: number, delta: number) {
		this.elapsed += delta * 0.001;
		this.redraw(this.elapsed);
	}

	private redraw(t: number) {
		const ctx = this.canvas.getContext();
		const w = this.canvas.width;
		const h = this.canvas.height;

		const cycle = (t * this.speed) % this.colors.length;
		const i1 = Math.floor(cycle) % this.colors.length;
		const i2 = (i1 + 1) % this.colors.length;
		const f = cycle - Math.floor(cycle);

		const cA = this.colors[i1];
		const cB = this.colors[i2];
		const mix1 = Display.Color.Interpolate.ColorWithColor(cA, cB, 1, f);

		const cC = this.colors[(i2 + 1) % this.colors.length];
		const mix2 = Display.Color.Interpolate.ColorWithColor(cB, cC, 1, f);

		const col1 = Display.Color.RGBToString(mix1.r, mix1.g, mix1.b);
		const col2 = Display.Color.RGBToString(mix2.r, mix2.g, mix2.b);

		const halfDiag = Math.sqrt(w * w + h * h) / 2;
		const cx = w / 2,
			cy = h / 2;
		const dx = Math.cos(this.angleRad) * halfDiag;
		const dy = Math.sin(this.angleRad) * halfDiag;

		const grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
		grad.addColorStop(0, col1);
		grad.addColorStop(0, col2);

		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, w, h);
		this.canvas.refresh();
	}

	private onResize(gameSize: Phaser.Structs.Size) {
		const { width, height } = gameSize;
		this.canvas.setSize(width, height);
		this.image.setPosition(0, 0);
		this.image.setDisplaySize(width, height);
		this.redraw(this.elapsed);
	}

	destroy = () => {
		this.scene.events.off("update", this.update, this);
		this.scene.scale.off("resize", this.onResize, this);
		if (this.image) this.image.destroy();
		if (this.canvas) this.canvas.destroy();
	};
}
