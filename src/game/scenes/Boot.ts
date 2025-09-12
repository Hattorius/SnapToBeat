import { Scene } from 'phaser';

export class Boot extends Scene {
	constructor() {
		super('Boot');
	}

	preload() {
		// Do simple assets loading that are required for the loading screen
	}

	create() {
		//this.scene.start("Preloader")
	}
}
