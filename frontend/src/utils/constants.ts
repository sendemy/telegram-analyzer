import { StatKey } from '../types/telegram';

export const COLORS = [
	'#b91d47',
	'#00aba9',
	'#2b5797',
	'#e8c3b9',
	'#1e7145',
	'#00FFFF',
	'#696969',
	'#FFC0CB',
	'#808080',
	'#E6E6FA',
	'#B0E0E6',
	'#7CFC00',
	'#000000',
] as const;

export const STAT_KEYS: StatKey[] = ['messages', 'words', 'symbols', 'stickers', 'gifs'];
