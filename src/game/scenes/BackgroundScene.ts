import { Scene } from "phaser";
import { GradientBackground } from "../bg/gradient";

export class BackgroundScene extends Scene {
	constructor() {
		super("BackgroundScene");
	}

	create() {
		new GradientBackground(this, {
			colors: ["#e100ff", "#ff17e8", "#fd6eef"],
			speed: 0.5,
			key: "GLOBAL_GRADIENT"
		});

		this.scene.sendToBack();
	}
}
