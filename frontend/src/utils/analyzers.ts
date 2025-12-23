import { GlobalStats, PersonStats, TelegramMessage } from '../types/telegram';
import { STOP_WORDS } from './constants';
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

/**
 * Optimized regex to match word characters (Unicode Letters).
 * \p{L} matches any kind of letter from any language.
 * The 'u' flag is required for Unicode property escapes.
 * This automatically filters out:
 * 1. Numbers
 * 2. Emojis (Extended_Pictographic)
 * 3. Punctuation/Symbols
 */
const WORD_REGEX = /\p{L}+/gu;

export function sortData(messages: TelegramMessage[]) {
	const words: Record<string, number> = {};

	// Optimization: Hoist helper function outside the loop to avoid
	// re-creating it for every single message.
	const processText = (text: string) => {
		// match() returns array of strings or null.
		// It automatically handles multiple spaces, newlines, and empty strings.
		const matches = text.match(WORD_REGEX);
		if (!matches) return;

		for (let i = 0; i < matches.length; i++) {
			let word = matches[i];

			// 1. Fast Fail: Length check (avoid .toLowerCase() for very short words)
			if (word.length < 2) continue;

			word = word.toLowerCase();

			// 2. Stop Word Check (Expensive Set lookup)
			if (STOP_WORDS.has(word)) continue;

			// 3. Count
			words[word] = (words[word] || 0) + 1;
		}
	};

	for (const msg of messages) {
		// Fast fail for non-message types
		if (msg.type !== 'message') continue;

		// Fast fail for empty text
		if (!msg.text) continue;

		if (typeof msg.text === 'string') {
			processText(msg.text);
		} else if (Array.isArray(msg.text)) {
			// Optimization: Use standard for-loop for array iteration (faster than .forEach)
			for (let i = 0; i < msg.text.length; i++) {
				const innerMsg = msg.text[i];
				if (typeof innerMsg === 'string') {
					processText(innerMsg);
				}
			}
		}
	}

	// Convert object to entries and sort by frequency (Descending)
	const sortedEntries = Object.entries(words).sort(([, a], [, b]) => b - a);

	// Optimization: Manually construct the top 10 object.
	// This avoids the overhead of creating a potentially huge intermediate object
	// and then discarding it.
	const topWords: Record<string, number> = {};
	const limit = Math.min(sortedEntries.length, 10);

	for (let i = 0; i < limit; i++) {
		const [key, value] = sortedEntries[i];
		topWords[key] = value;
	}

	return topWords;
}
