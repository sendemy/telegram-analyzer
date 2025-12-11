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
