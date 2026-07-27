export interface TelegramMessage {
	type: string;
	from?: string;
	text?: string | (string | { type: string; text: string })[];
	media_type?: string;
	[key: string]: any; // other props
}

export interface TelegramData {
	messages: TelegramMessage[];
	[key: string]: any; // other props
}

export interface GlobalStats {
	messages: number;
	words: number;
	symbols: number;
	stickers: number;
	gifs: number;
}

export interface PersonStats extends GlobalStats {
	nickname: string;
}

export interface ChartObjects {
	[key: string]: number;
}

export type StatKey = keyof Omit<GlobalStats, 'nickname'>;

export interface ProcessedData {
	totalStats: GlobalStats;
	personsStats: PersonStats[];
	chartObjects: Array<Record<string, number>>;
	topWords: Record<string, number>;
	nicknames: string[];
	personalityProfiles?: PersonalityProfile[];
}

// ============================================
// Personality Insights Types
// ============================================

export type CommunicationStyle = 'very-short' | 'short' | 'moderate' | 'long' | 'very-long';

export type ActivityPeriod = 'night' | 'morning' | 'afternoon' | 'evening';

export interface FillerWordStat {
	word: string;
	count: number;
	perMessage: number;
}

export interface PersonalityProfile {
	nickname: string;
	communicationStyle: CommunicationStyle;
	avgMessageLength: number;
	medianMessageLength: number;
	avgWordsPerMessage: number;
	maxMessageLength: number;
	messageLengthVariance: number;
	mediaPersonalityLabel: string;
	stickerRatio: number;
	gifRatio: number;
	mediaRatio: number;
	mostActivePeriod: ActivityPeriod;
	periodBreakdown: Record<ActivityPeriod, number>;
	nightOwlScore: number;
	topFillerWords: FillerWordStat[];
	totalFillers: number;
	fillerWordsPerMessage: number;
	shortInsights: string[];
}

// ============================================
// Sentiment Analysis Types
// ============================================

export interface SentimentScore {
	score: number;
	comparative: number;
	positive: string[];
	negative: string[];
	words: string[];
}

export interface HighlightMessage {
	text: string;
	from: string;
	score: number;
}

export interface PersonSentiment {
	nickname: string;
	avgScore: number;
	avgComparative: number;
	totalPositive: number;
	totalNegative: number;
	totalNeutral: number;
	messageCount: number;
	mostPositiveMessages: { text: string; score: number }[];
	mostNegativeMessages: { text: string; score: number }[];
	sentimentLabel: SentimentLabel;
}

export type SentimentLabel =
	| 'very-positive'
	| 'positive'
	| 'neutral'
	| 'negative'
	| 'very-negative';

export interface DailySentiment {
	date: string;
	score: number;
	comparative: number;
	count: number;
}

export interface SentimentInsights {
	overallScore: number;
	overallComparative: number;
	overallLabel: SentimentLabel;
	positivityRate: number;
	negativityRate: number;
	neutralityRate: number;
	personSentiments: PersonSentiment[];
	dailySentiment: DailySentiment[];
	mostPositiveMessages: HighlightMessage[];
	mostNegativeMessages: HighlightMessage[];
}

// ============================================
// Predictive Analytics Types
// ============================================

export interface MilestonePrediction {
	milestone: number;
	predictedDate: string | null;
	confidence: 'high' | 'medium' | 'low';
}

export interface MonthlyComparison {
	nickname: string;
	currentMonthCount: number;
	previousMonthCount: number;
	changePercent: number;
}

export interface DeadHour {
	hour: number;
	count: number;
	label: string;
}

export interface PredictiveInsights {
	totalMessages: number;
	historicalCumulative: Array<{ date: string; count: number }>;
	projectedCumulative: Array<{ date: string; count: number }>;
	milestones: MilestonePrediction[];
	growthRate: number;
	rSquared: number;
	monthlyComparisons: MonthlyComparison[];
	deadHours: DeadHour[];
	deadestHour: DeadHour;
	liveliestHour: DeadHour;
}
