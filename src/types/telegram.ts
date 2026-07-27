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
