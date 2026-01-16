import { useMemo } from 'preact/hooks';
import type { PersonStats, GlobalStats } from '../types/telegram';

export type WordWeightCategory = 'high' | 'medium' | 'low';
export type ActivityLevel = 'very-high' | 'high' | 'medium' | 'low' | 'very-low';

export enum WordWeightCategoryEnum {
	HIGH = 'high',
	MEDIUM = 'medium',
	LOW = 'low',
}

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

export interface PersonActivityMetrics {
	messages: number;
	words: number;
	stickers: number;
	gifs: number;
}

export interface ActivityScoreResult {
	score: number;
	breakdown: {
		messageContribution: number;
		wordContribution: number;
		stickerContribution: number;
		gifContribution: number;
		avgWordsPerMessage: number;
		wordWeightCategory: WordWeightCategory;
	};
	normalizedScore: number;
	activityLevel: ActivityLevel;
	wordDensity: number;
}

export interface UseActivityOptions {
	weights?: Partial<ActivityScoreWeights>;
	enableNormalization?: boolean;
	timeDecayFactor?: number; // Optional: for future time-based decay
}

const DEFAULT_WEIGHTS: ActivityScoreWeights = {
	messageWeight: 5,
	wordsWeights: {
		high: 4, // >5 words per message
		medium: 3, // 3-5 words per message
		low: 2, // <3 words per message
	},
	stickerWeight: 1,
	gifWeight: 1,
};

// Helper function to calculate enhanced activity score
const calculateEnhancedActivityScore = (
	metrics: PersonActivityMetrics,
	weights: ActivityScoreWeights = DEFAULT_WEIGHTS
): ActivityScoreResult => {
	const { messages, words, stickers, gifs } = metrics;

	// Early return for no messages
	if (messages === 0) {
		return {
			score: 0,
			breakdown: {
				messageContribution: 0,
				wordContribution: 0,
				stickerContribution: 0,
				gifContribution: 0,
				avgWordsPerMessage: 0,
				wordWeightCategory: 'low',
			},
			normalizedScore: 0,
			activityLevel: 'very-low',
			wordDensity: 0,
		};
	}

	// Calculate average words per message
	const avgWordsPerMessage = words / messages;

	// Determine word weight category
	let wordWeightCategory: 'high' | 'medium' | 'low';
	let wordWeight: number;

	if (avgWordsPerMessage > 5) {
		wordWeightCategory = 'high';
		wordWeight = weights.wordsWeights.high;
	} else if (avgWordsPerMessage >= 3) {
		wordWeightCategory = 'medium';
		wordWeight = weights.wordsWeights.medium;
	} else {
		wordWeightCategory = 'low';
		wordWeight = weights.wordsWeights.low;
	}

	// Calculate contributions
	const messageContribution = messages * weights.messageWeight;
	const wordContribution = words * wordWeight;
	const stickerContribution = stickers * weights.stickerWeight;
	const gifContribution = gifs * weights.gifWeight;

	// Calculate raw score
	const rawScore = messageContribution + wordContribution + stickerContribution + gifContribution;

	// Calculate word density (words per message)
	const wordDensity = avgWordsPerMessage;

	// Normalize score for better interpretation (per message)
	const normalizedScore = messages > 0 ? rawScore / messages : 0;

	// Determine activity level based on normalized score
	let activityLevel: ActivityScoreResult['activityLevel'];
	if (normalizedScore > 40) activityLevel = 'very-high';
	else if (normalizedScore > 25) activityLevel = 'high';
	else if (normalizedScore > 15) activityLevel = 'medium';
	else if (normalizedScore > 5) activityLevel = 'low';
	else activityLevel = 'very-low';

	return {
		score: Math.round(rawScore),
		breakdown: {
			messageContribution: Math.round(messageContribution),
			wordContribution: Math.round(wordContribution),
			stickerContribution: Math.round(stickerContribution),
			gifContribution: Math.round(gifContribution),
			avgWordsPerMessage: Number(avgWordsPerMessage.toFixed(2)),
			wordWeightCategory,
		},
		normalizedScore: Number(normalizedScore.toFixed(2)),
		activityLevel,
		wordDensity: Number(wordDensity.toFixed(2)),
	};
};

// Main hook
export function useActivity(options: UseActivityOptions = {}) {
	const { weights: customWeights = {}, enableNormalization = true } = options;

	// Merge custom weights with defaults
	const weights: ActivityScoreWeights = {
		...DEFAULT_WEIGHTS,
		...customWeights,
		wordsWeights: {
			...DEFAULT_WEIGHTS.wordsWeights,
			...(customWeights.wordsWeights || {}),
		},
	};

	// Calculate individual activity score
	const calculateScore = (metrics: PersonActivityMetrics): ActivityScoreResult => {
		const result = calculateEnhancedActivityScore(metrics, weights);

		// Apply normalization if enabled
		if (!enableNormalization) {
			return {
				...result,
				normalizedScore: result.score,
			};
		}

		return result;
	};

	// Calculate comparative scores for multiple persons
	const calculateComparativeScores = (persons: PersonStats[], totalStats?: GlobalStats) => {
		if (persons.length === 0) return [];

		// Calculate scores for everyone
		const scores = persons.map((person) => ({
			...person,
			activityScore: calculateScore({
				messages: person.messages,
				words: person.words,
				stickers: person.stickers,
				gifs: person.gifs,
			}),
		}));

		// Sort by score (descending)
		const sorted = [...scores].sort((a, b) => b.activityScore.score - a.activityScore.score);

		// Calculate rankings and percentiles
		return sorted.map((person, index) => {
			const rank = index + 1;
			const percentile = ((persons.length - rank) / persons.length) * 100;

			// Calculate share of total activity if total stats provided
			let activityShare = 0;
			if (totalStats && totalStats.messages > 0) {
				activityShare = (person.messages / totalStats.messages) * 100;
			}

			return {
				...person,
				rank,
				percentile: Math.round(percentile),
				activityShare: Number(activityShare.toFixed(1)),
			};
		});
	};

	// Calculate activity summary for the whole chat
	const calculateChatActivitySummary = (persons: PersonStats[], totalStats: GlobalStats) => {
		const comparativeScores = calculateComparativeScores(persons, totalStats);

		// Find top contributors
		const topContributors = comparativeScores.slice(0, 3);

		// Calculate average activity score
		const avgScore =
			comparativeScores.length > 0
				? comparativeScores.reduce((sum, p) => sum + p.activityScore.score, 0) /
					comparativeScores.length
				: 0;

		// Calculate activity distribution
		const activityDistribution = {
			veryHigh: comparativeScores.filter((p) => p.activityScore.activityLevel === 'very-high')
				.length,
			high: comparativeScores.filter((p) => p.activityScore.activityLevel === 'high').length,
			medium: comparativeScores.filter((p) => p.activityScore.activityLevel === 'medium')
				.length,
			low: comparativeScores.filter((p) => p.activityScore.activityLevel === 'low').length,
			veryLow: comparativeScores.filter((p) => p.activityScore.activityLevel === 'very-low')
				.length,
		};

		return {
			topContributors,
			averageScore: Math.round(avgScore),
			activityDistribution,
			totalParticipants: persons.length,
			mostActive: comparativeScores[0] || null,
			leastActive: comparativeScores[comparativeScores.length - 1] || null,
		};
	};

	// Generate activity insights
	const generateActivityInsights = (
		persons: PersonStats[],
		totalStats: GlobalStats
	): string[] => {
		const insights: string[] = [];

		if (persons.length === 0) return insights;

		const comparativeScores = calculateComparativeScores(persons, totalStats);
		const summary = calculateChatActivitySummary(persons, totalStats);

		// Insight 1: Top contributor
		if (summary.mostActive) {
			insights.push(
				`${summary.mostActive.nickname} is the most active participant with a score of ${summary.mostActive.activityScore.score.toLocaleString()}`
			);
		}

		// Insight 2: Activity distribution
		const activeCount =
			summary.activityDistribution.veryHigh + summary.activityDistribution.high;
		if (activeCount > persons.length / 2) {
			insights.push('This chat has high overall activity with multiple active participants');
		} else if (activeCount > 0) {
			insights.push(
				`The chat activity is concentrated among ${activeCount} main participant(s)`
			);
		}

		// Insight 3: Word density insight
		const avgWordDensity =
			persons.reduce((sum, p) => {
				const score = calculateScore({
					messages: p.messages,
					words: p.words,
					stickers: p.stickers,
					gifs: p.gifs,
				});
				return sum + score.wordDensity;
			}, 0) / persons.length;

		if (avgWordDensity > 6) {
			insights.push('Participants tend to write longer, more detailed messages');
		} else if (avgWordDensity < 3) {
			insights.push('Participants typically write brief, concise messages');
		}

		// Insight 4: Media usage
		const totalMedia = persons.reduce((sum, p) => sum + p.stickers + p.gifs, 0);
		const totalMessages = totalStats.messages;

		if (totalMessages > 0) {
			const mediaPercentage = (totalMedia / totalMessages) * 100;
			if (mediaPercentage > 20) {
				insights.push('High usage of stickers and GIFs in this chat');
			} else if (mediaPercentage < 5) {
				insights.push('Participants primarily communicate with text messages');
			}
		}

		return insights;
	};

	return {
		calculateScore,
		calculateComparativeScores,
		calculateChatActivitySummary,
		generateActivityInsights,
		weights, // Expose weights for reference
	};
}

// Quick use helper
export function usePersonActivity(metrics: PersonActivityMetrics, options?: UseActivityOptions) {
	const { calculateScore } = useActivity(options);
	return useMemo(() => calculateScore(metrics), [metrics, options]);
}
