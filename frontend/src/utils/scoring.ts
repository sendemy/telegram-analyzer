export interface ActivityScoreWeights {
	messageWeight: number;
	wordsWeights: {
		high: number; // >5 words per message
		medium: number; // 3-5 words per message
		low: number; // <3 words per message
	};
	stickerWeight: number;
	gifWeight: number;
}

// Default weights based on your specification
export const DEFAULT_WEIGHTS: ActivityScoreWeights = {
	messageWeight: 5,
	wordsWeights: {
		high: 4, // >5 words per message
		medium: 3, // 3-5 words per message
		low: 2, // <3 words per message
	},
	stickerWeight: 1,
	gifWeight: 1,
};

export interface PersonActivityMetrics {
	messages: number;
	words: number;
	stickers: number;
	gifs: number;
}

export function calculateActivityScore(
	metrics: PersonActivityMetrics,
	weights: ActivityScoreWeights = DEFAULT_WEIGHTS
): number {
	const { messages, words, stickers, gifs } = metrics;

	if (messages === 0) return 0;

	// Calculate average words per message to determine word category
	const avgWordsPerMessage = words / messages;

	// Determine word weight based on average words per message
	let wordWeight: number;
	if (avgWordsPerMessage > 5) {
		wordWeight = weights.wordsWeights.high;
	} else if (avgWordsPerMessage >= 3) {
		wordWeight = weights.wordsWeights.medium;
	} else {
		wordWeight = weights.wordsWeights.low;
	}

	// Calculate total word contribution (words × wordWeight)
	const wordContribution = words * wordWeight;

	// Calculate total message contribution (messages × messageWeight)
	const messageContribution = messages * weights.messageWeight;

	// Calculate sticker and gif contributions
	const stickerContribution = stickers * weights.stickerWeight;
	const gifContribution = gifs * weights.gifWeight;

	// Calculate raw score
	const rawScore = messageContribution + wordContribution + stickerContribution + gifContribution;

	// Normalize to make it more interpretable (optional)
	return normalizeScore(rawScore, metrics);
}

// Optional: Normalize score for better readability
function normalizeScore(score: number, metrics: PersonActivityMetrics): number {
	const { messages } = metrics;

	// Simple normalization: divide by number of messages to get "activity per message"
	if (messages > 0) {
		return Math.round(score / messages);
	}

	return Math.round(score);
}
