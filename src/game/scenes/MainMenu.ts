import { Scene } from "phaser";
import { GradientBackground } from "../bg/gradient";

export class MainMenu extends Scene {
	constructor() {
		super("MainMenu");
	}

	create() {
		// new GradientBackground(this, {
		// 	colors: ["#a200b8", "#ff17e8", "#fd6eef"],
		// 	speed: 0.5
		// });

		const logo = this.add.image(100, 50, "logo");
		logo.displayWidth = 120;
		logo.displayHeight = logo.height * (120 / logo.width);
	}
}
