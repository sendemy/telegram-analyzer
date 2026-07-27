import Sentiment from 'sentiment';
import type {
	DailySentiment,
	PersonSentiment,
	SentimentInsights,
	SentimentLabel,
	SentimentScore,
	TelegramMessage,
} from '../types/telegram';

// ============================================
// Russian Sentiment Dictionary
// ============================================
const RU_SENTIMENT_LABELS: Record<string, number> = {
	// Strong positive
	отлично: 4,
	прекрасно: 4,
	замечательно: 4,
	великолепно: 4,
	восхитительно: 4,
	потрясающе: 4,
	шикарно: 3,
	класс: 3,
	круто: 3,
	супер: 3,
	обалдеть: 3,
	офигенно: 3,
	бомба: 3,
	огонь: 3,
	топ: 2,

	// Moderate positive
	хорошо: 2,
	здорово: 2,
	красиво: 2,
	интересно: 2,
	приятно: 2,
	рад: 2,
	рада: 2,
	рады: 2,
	нравится: 2,
	люблю: 3,
	любим: 3,
	любит: 2,
	лучший: 3,
	лучшая: 3,
	лучшее: 3,
	спасибо: 2,
	благодарю: 2,
	молодец: 3,
	умница: 3,
	поздравляю: 2,
	ура: 2,
	идеально: 3,
	отпад: 3,

	// Mild positive
	нормально: 1,
	неплохо: 1,
	ok: 1,
	okay: 1,
	ладно: 1,
	давай: 1,
	согласен: 1,
	согласна: 1,
	конечно: 1,
	верно: 1,
	точно: 1,

	// Mild negative
	плохо: -2,
	скучно: -2,
	грустно: -2,
	жаль: -2,
	жалко: -2,
	обидно: -2,
	надоело: -2,
	устал: -2,
	устала: -2,
	лениво: -1,
	сломалось: -2,
	неудобно: -1,
	странно: -1,
	глупо: -2,
	дурак: -3,
	дура: -3,

	// Strong negative
	ужасно: -3,
	отвратительно: -4,
	кошмар: -3,
	ужас: -3,
	бесит: -3,
	достало: -3,
	заебал: -4,
	заебала: -4,
	заебало: -4,
	ненавижу: -4,
	ненавидит: -3,
	отвратительный: -3,
	отвратительная: -3,
	отвратительное: -3,
	мерзко: -3,
	противно: -3,
	гадко: -3,
	душно: -2,
	кринж: -2,
	сорян: -1,
	извини: -1,
	прости: -1,

	// Intensifiers (emotionally charged but context-dependent)
	боже: 1,
	пипец: -2,
	жесть: -2,
	капец: -2,
	ахуенно: 4,
	хуево: -3,
	заебись: 3,
	пиздато: 4,
	херня: -2,
	фигня: -2,
	ерунда: -2,
	чушь: -2,
	отстой: -3,
	лажа: -2,
};

// ============================================
// Sentiment Analyzer Singleton
// ============================================
let analyzer: Sentiment | null = null;

function getAnalyzer(): Sentiment {
	if (!analyzer) {
		analyzer = new Sentiment();
		analyzer.registerLanguage('ru', { labels: RU_SENTIMENT_LABELS });
	}
	return analyzer;
}

// ============================================
// Text Extraction Helpers
// ============================================

/**
 * Extracts clean text from a Telegram message.
 * Handles: plain string, array of strings and {type, text} objects.
 */
export function extractText(msg: TelegramMessage): string {
	if (!msg.text || msg.type !== 'message') return '';

	if (typeof msg.text === 'string') {
		return msg.text;
	}

	if (Array.isArray(msg.text)) {
		return msg.text
			.map((part) => {
				if (typeof part === 'string') return part;
				if (part && typeof part === 'object' && 'text' in part) return part.text;
				return '';
			})
			.join(' ')
			.trim();
	}

	return '';
}

// ============================================
// Analysis Functions
// ============================================

/**
 * Analyze sentiment of a single message text.
 * Returns both EN and RU analysis, picks the one with more matched words.
 */
export function analyzeText(text: string): SentimentScore {
	if (!text.trim()) {
		return { score: 0, comparative: 0, positive: [], negative: [], words: [] };
	}

	const s = getAnalyzer();

	// Try English first
	const enResult = s.analyze(text, { language: 'en' });
	// Try Russian
	const ruResult = s.analyze(text, { language: 'ru' });

	// Pick the result with more matched words (best language detection heuristic)
	const result = enResult.words.length >= ruResult.words.length ? enResult : ruResult;

	return {
		score: result.score,
		comparative: result.comparative,
		positive: result.positive,
		negative: result.negative,
		words: result.words,
	};
}

/**
 * Analyze sentiment of a single Telegram message.
 */
export function analyzeMessage(msg: TelegramMessage): SentimentScore {
	const text = extractText(msg);
	return analyzeText(text);
}

// ============================================
// Labels & Thresholds
// ============================================

export function getSentimentLabel(comparative: number): SentimentLabel {
	if (comparative > 0.3) return 'very-positive';
	if (comparative > 0.05) return 'positive';
	if (comparative < -0.3) return 'very-negative';
	if (comparative < -0.05) return 'negative';
	return 'neutral';
}

// ============================================
// Aggregation
// ============================================

/**
 * Analyze all messages and produce full SentimentInsights.
 */
export function analyzeMessages(messages: TelegramMessage[]): SentimentInsights {
	const textMessages = messages.filter(
		(msg) => msg.type === 'message' && extractText(msg).trim().length > 0
	);

	if (textMessages.length === 0) {
		return {
			overallScore: 0,
			overallComparative: 0,
			overallLabel: 'neutral',
			positivityRate: 0,
			negativityRate: 0,
			neutralityRate: 0,
			personSentiments: [],
			dailySentiment: [],
			mostPositiveMessages: [],
			mostNegativeMessages: [],
		};
	}

	// Analyze every message
	const analyzed = textMessages.map((msg) => ({
		msg,
		sentiment: analyzeMessage(msg),
		text: extractText(msg),
	}));

	// Overall stats
	let totalScore = 0;
	let totalComparative = 0;
	let positiveCount = 0;
	let negativeCount = 0;
	let neutralCount = 0;

	// Per-person aggregation
	const personScores: Record<string, { scores: number[]; comparatives: number[] }> = {};

	// Daily aggregation
	const dailyMap: Record<string, { scores: number[]; comparatives: number[] }> = {};

	// Collect candidates for top highlights (only messages with text > 10 chars)
	const highlightCandidates: { text: string; from: string; score: number }[] = [];

	for (const { msg, sentiment, text } of analyzed) {
		totalScore += sentiment.score;
		totalComparative += sentiment.comparative;

		// Count positive/negative/neutral
		if (sentiment.comparative > 0.05) {
			positiveCount++;
		} else if (sentiment.comparative < -0.05) {
			negativeCount++;
		} else {
			neutralCount++;
		}

		// Per-person
		if (msg.from) {
			if (!personScores[msg.from]) {
				personScores[msg.from] = { scores: [], comparatives: [] };
			}
			personScores[msg.from].scores.push(sentiment.score);
			personScores[msg.from].comparatives.push(sentiment.comparative);
		}

		// Daily
		const date = msg.date ? msg.date.split('T')[0] : 'unknown';
		if (!dailyMap[date]) {
			dailyMap[date] = { scores: [], comparatives: [] };
		}
		dailyMap[date].scores.push(sentiment.score);
		dailyMap[date].comparatives.push(sentiment.comparative);

		// Collect candidates for highlights
		if (text.length > 10 && msg.from) {
			highlightCandidates.push({
				text: truncateText(text, 150),
				from: msg.from,
				score: sentiment.comparative,
			});
		}
	}

	const totalAnalyzed = analyzed.length;
	const overallComparative = totalScore / totalAnalyzed;

	// Sort highlight candidates and take top/bottom 3
	const sortedCandidates = [...highlightCandidates].sort((a, b) => b.score - a.score);
	const mostPositiveMessages = sortedCandidates.slice(0, 3);
	const mostNegativeMessages = sortedCandidates.reverse().slice(0, 3);

	// Person sentiments — collect top 3 per person
	const personSentiments: PersonSentiment[] = Object.entries(personScores).map(
		([nickname, data]) => {
			const avgComparative =
				data.comparatives.reduce((a, b) => a + b, 0) / data.comparatives.length;
			const personPositive = data.comparatives.filter((c) => c > 0.05).length;
			const personNegative = data.comparatives.filter((c) => c < -0.05).length;
			const personNeutral = data.comparatives.length - personPositive - personNegative;

			// Find top 3 most positive/negative for this person
			const personAnalyzed = analyzed
				.filter((a) => a.msg.from === nickname && a.text.length > 10)
				.map((a) => ({ text: truncateText(a.text, 150), score: a.sentiment.comparative }))
				.sort((a, b) => b.score - a.score);

			const pMostPos = personAnalyzed.slice(0, 3);
			const pMostNeg = [...personAnalyzed].reverse().slice(0, 3);

			return {
				nickname,
				avgScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
				avgComparative,
				totalPositive: personPositive,
				totalNegative: personNegative,
				totalNeutral: personNeutral,
				messageCount: data.comparatives.length,
				mostPositiveMessages: pMostPos,
				mostNegativeMessages: pMostNeg,
				sentimentLabel: getSentimentLabel(avgComparative),
			};
		}
	);

	// Daily sentiment
	const dailySentiment: DailySentiment[] = Object.entries(dailyMap)
		.map(([date, data]) => ({
			date,
			score: data.scores.reduce((a, b) => a + b, 0),
			comparative: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
			count: data.scores.length,
		}))
		.sort((a, b) => a.date.localeCompare(b.date));

	return {
		overallScore: totalScore,
		overallComparative,
		overallLabel: getSentimentLabel(overallComparative),
		positivityRate: (positiveCount / totalAnalyzed) * 100,
		negativityRate: (negativeCount / totalAnalyzed) * 100,
		neutralityRate: (neutralCount / totalAnalyzed) * 100,
		personSentiments,
		dailySentiment,
		mostPositiveMessages,
		mostNegativeMessages,
	};
}

/**
 * Truncate text to max length, adding ellipsis if needed.
 */
function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength).trimEnd() + '…';
}
