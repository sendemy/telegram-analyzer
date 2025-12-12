import { GlobalStats, PersonStats, TelegramMessage } from '../types/telegram';
import { isNumeric } from './strings';

export function getGlobalStats(msgs: TelegramMessage[]): GlobalStats {
	let messages = 0;
	let words = 0;
	let symbols = 0;
	let stickers = 0;
	let gifs = 0;

	for (const msg of msgs) {
		if (msg.type == 'message') {
			messages += 1;
		}

		if (msg.type == 'message' && msg.text != '' && typeof msg.text == 'string') {
			words += msg.text.split(' ').length;
		} else if (msg.type == 'message' && msg.text != '' && Array.isArray(msg.text)) {
			for (const innerMsg of msg.text) {
				if (typeof innerMsg == 'string') {
					words += innerMsg.split(' ').length;
				}
			}
		}

		if (msg.type == 'message' && typeof msg.text == 'string') {
			symbols += msg.text.length;
		} else if (msg.type == 'message' && msg.text != '' && Array.isArray(msg.text)) {
			for (const innerMsg of msg.text) {
				if (typeof innerMsg == 'string') {
					symbols += innerMsg.length;
				}
			}
		}

		if (msg.hasOwnProperty('media_type') && msg.media_type == 'sticker') {
			stickers += 1;
		} else if (msg.hasOwnProperty('media_type') && msg.media_type == 'animation') {
			gifs += 1;
		}
	}

	return {
		messages,
		words,
		symbols,
		stickers,
		gifs,
	};
}

export function getPersonStats(msgs: TelegramMessage[], nickname: string): PersonStats {
	let messages = 0;
	let words = 0;
	let symbols = 0;
	let stickers = 0;
	let gifs = 0;

	for (const msg of msgs) {
		if (msg.type == 'message' && msg.from == nickname) {
			messages += 1;
		}

		if (
			msg.type == 'message' &&
			msg.text != '' &&
			typeof msg.text == 'string' &&
			msg.from == nickname
		) {
			words += msg.text.split(' ').length;
		} else if (
			msg.type == 'message' &&
			msg.text != '' &&
			Array.isArray(msg.text) &&
			msg.from == nickname
		) {
			for (const innerMsg of msg.text) {
				if (typeof innerMsg == 'string') {
					words += innerMsg.split(' ').length;
				}
			}
		}

		if (msg.type == 'message' && typeof msg.text == 'string' && msg.from == nickname) {
			symbols += msg.text.length;
		} else if (
			msg.type == 'message' &&
			msg.text != '' &&
			Array.isArray(msg.text) &&
			msg.from == nickname
		) {
			for (const innerMsg of msg.text) {
				if (typeof innerMsg == 'string') {
					symbols += innerMsg.length;
				}
			}
		}

		if ('media_type' in msg && msg.media_type == 'sticker' && msg.from == nickname) {
			stickers += 1;
		}

		if ('media_type' in msg && msg.media_type == 'animation' && msg.from == nickname) {
			gifs += 1;
		}
	}

	return {
		nickname,
		messages,
		words,
		symbols,
		stickers,
		gifs,
	};
}

export function sortData(messages: TelegramMessage[]) {
	// key: word, value: number of its occurrences
	const words: Record<string, number> = {};

	// regex to filter out emojis
	const regexEmoji = /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/u;

	for (const msg of messages) {
		// if the message is a non-empty text string
		if (msg.type == 'message' && msg.text != '' && typeof msg.text == 'string') {
			for (const word of msg.text.split(' ')) {
				const lowerCaseWord = word.toLowerCase();

				if (
					!words.hasOwnProperty(lowerCaseWord) &&
					!regexEmoji.test(word) &&
					!isNumeric(word)
				) {
					words[lowerCaseWord] = 1;
				} else if (
					words.hasOwnProperty(lowerCaseWord) &&
					!regexEmoji.test(word) &&
					!isNumeric(word)
				) {
					words[lowerCaseWord] += 1;
				}
			}
			// if the message consists of a file/link/img etc. and has text in it
		} else if (msg.type == 'message' && msg.text != '' && Array.isArray(msg.text)) {
			for (const innerMsg of msg.text) {
				if (typeof innerMsg == 'string') {
					for (const word of innerMsg.split(' ')) {
						const lowerCaseWord = word.toLowerCase();

						if (
							!words.hasOwnProperty(lowerCaseWord) &&
							!regexEmoji.test(word) &&
							!isNumeric(word)
						) {
							words[lowerCaseWord] = 1;
						} else if (
							words.hasOwnProperty(lowerCaseWord) &&
							!regexEmoji.test(word) &&
							!isNumeric(word)
						) {
							words[lowerCaseWord] += 1;
						}
					}
				}
			}
		}
	}

	// sorting array by the number of word occurrences
	const sorted = Object.entries(words)
		.sort(([, v1], [, v2]) => v2 - v1)
		.reduce(
			(obj, [k, v]) => ({
				...obj,
				[k]: v,
			}),
			{}
		);

	const topWords = {};

	Object.entries(sorted).forEach(([key, value], ind) => {
		if (ind < 10) {
			topWords[key] = value;
		}
	});

	return topWords;
}
