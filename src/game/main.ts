import type Phaser from 'phaser';
import { AUTO, Game } from 'phaser';
import { Boot } from './scenes/Boot';

const config: Phaser.Types.Core.GameConfig = {
	type: AUTO,
	width: 1024,
	height: 768,
	backgroundColor: '#028af8',
	scene: [Boot]
};

const StartGame = (parent: string) => {
	return new Game({ ...config, parent });
};

export default StartGame;
