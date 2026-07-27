import type {
	ActivityPeriod,
	CommunicationStyle,
	FillerWordStat,
	PersonStats,
	PersonalityProfile,
	TelegramMessage,
} from '../types/telegram';
import { FILLER_WORDS } from './constants';
import { extractText } from './sentiment';

// ============================================
// Communication Style Analysis
// ============================================

function analyzeCommunicationStyle(
	messages: TelegramMessage[]
): Pick<
	PersonalityProfile,
	| 'communicationStyle'
	| 'avgMessageLength'
	| 'medianMessageLength'
	| 'avgWordsPerMessage'
	| 'maxMessageLength'
	| 'messageLengthVariance'
> {
	const lengths: number[] = [];
	const wordCounts: number[] = [];

	for (const msg of messages) {
		const text = extractText(msg);
		if (!text) continue;
		lengths.push(text.length);
		wordCounts.push(text.split(/\s+/).filter(Boolean).length);
	}

	if (lengths.length === 0) {
		return {
			communicationStyle: 'moderate',
			avgMessageLength: 0,
			medianMessageLength: 0,
			avgWordsPerMessage: 0,
			maxMessageLength: 0,
			messageLengthVariance: 0,
		};
	}

	const sorted = [...lengths].sort((a, b) => a - b);
	const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
	const median = sorted[Math.floor(sorted.length / 2)];
	const max = sorted[sorted.length - 1];
	const variance = lengths.reduce((sum, len) => sum + (len - avg) ** 2, 0) / lengths.length;
	const avgWords = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;

	let style: CommunicationStyle;
	if (avg < 20) style = 'very-short';
	else if (avg < 50) style = 'short';
	else if (avg < 100) style = 'moderate';
	else if (avg < 200) style = 'long';
	else style = 'very-long';

	return {
		communicationStyle: style,
		avgMessageLength: Number(avg.toFixed(1)),
		medianMessageLength: median,
		avgWordsPerMessage: Number(avgWords.toFixed(1)),
		maxMessageLength: max,
		messageLengthVariance: Number(variance.toFixed(0)),
	};
}

// ============================================
// Media Personality Analysis
// ============================================

function analyzeMediaPersonality(
	person: PersonStats
): Pick<PersonalityProfile, 'mediaPersonalityLabel' | 'stickerRatio' | 'gifRatio' | 'mediaRatio'> {
	const { messages, stickers, gifs } = person;
	const totalMedia = stickers + gifs;
	const stickerRatio = messages > 0 ? (stickers / messages) * 100 : 0;
	const gifRatio = messages > 0 ? (gifs / messages) * 100 : 0;
	const mediaRatio = messages > 0 ? (totalMedia / messages) * 100 : 0;

	let label: string;
	if (stickerRatio > 20 && messages >= 1000) {
		label = '👑 Sticker King';
	} else if (stickerRatio > 20) {
		label = '🎨 Sticker Lover';
	} else if (gifRatio > 10) {
		label = '🎬 GIF Enthusiast';
	} else if (mediaRatio < 2 && messages > 50) {
		label = '📝 Pure Text';
	} else if (mediaRatio < 5) {
		label = '📝 Mostly Text';
	} else {
		label = '💬 Mixed Media';
	}

	return {
		mediaPersonalityLabel: label,
		stickerRatio: Number(stickerRatio.toFixed(1)),
		gifRatio: Number(gifRatio.toFixed(1)),
		mediaRatio: Number(mediaRatio.toFixed(1)),
	};
}

// ============================================
// Activity Timing Analysis
// ============================================

function analyzeActivityTiming(
	messages: TelegramMessage[]
): Pick<PersonalityProfile, 'mostActivePeriod' | 'periodBreakdown' | 'nightOwlScore'> {
	const breakdown: Record<ActivityPeriod, number> = {
		night: 0,
		morning: 0,
		afternoon: 0,
		evening: 0,
	};

	for (const msg of messages) {
		if (msg.type !== 'message' || !msg.date) continue;
		const hour = new Date(msg.date).getHours();
		if (isNaN(hour)) continue;

		if (hour >= 0 && hour < 6) breakdown.night++;
		else if (hour >= 6 && hour < 12) breakdown.morning++;
		else if (hour >= 12 && hour < 18) breakdown.afternoon++;
		else breakdown.evening++;
	}

	const total = breakdown.night + breakdown.morning + breakdown.afternoon + breakdown.evening;
	const nightOwlScore = total > 0 ? (breakdown.night / total) * 100 : 0;

	let mostActivePeriod: ActivityPeriod = 'afternoon';
	let maxCount = 0;
	for (const [period, count] of Object.entries(breakdown)) {
		if (count > maxCount) {
			maxCount = count;
			mostActivePeriod = period as ActivityPeriod;
		}
	}

	return {
		mostActivePeriod,
		periodBreakdown: breakdown,
		nightOwlScore: Number(nightOwlScore.toFixed(1)),
	};
}

// ============================================
// Filler Words Analysis
// ============================================

function analyzeFillerWords(
	messages: TelegramMessage[]
): Pick<PersonalityProfile, 'topFillerWords' | 'totalFillers' | 'fillerWordsPerMessage'> {
	const counts: Record<string, number> = {};
	let textMessageCount = 0;

	for (const msg of messages) {
		const text = extractText(msg);
		if (!text) continue;
		textMessageCount++;

		// Split by whitespace for filler word detection (multi-word fillers handled later)
		const words = text.toLowerCase().split(/\s+/).filter(Boolean);

		for (const word of words) {
			if (FILLER_WORDS.has(word)) {
				counts[word] = (counts[word] || 0) + 1;
			}
		}

		// Check for multi-word fillers like "как бы"
		const lower = text.toLowerCase();
		const multiWordFillers = ['как бы', 'типа того', 'в целом', 'в общем'];
		for (const filler of multiWordFillers) {
			const regex = new RegExp(filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
			const matches = lower.match(regex);
			if (matches) {
				counts[filler] = (counts[filler] || 0) + matches.length;
			}
		}
	}

	const sorted = Object.entries(counts)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 5);

	const totalFillers = sorted.reduce((sum, [, count]) => sum + count, 0);

	const topFillerWords: FillerWordStat[] = sorted.map(([word, count]) => ({
		word,
		count,
		perMessage: textMessageCount > 0 ? Number((count / textMessageCount).toFixed(2)) : 0,
	}));

	return {
		topFillerWords,
		totalFillers,
		fillerWordsPerMessage:
			textMessageCount > 0 ? Number((totalFillers / textMessageCount).toFixed(2)) : 0,
	};
}

// ============================================
// Insights Generation
// ============================================

const STYLE_LABELS: Record<CommunicationStyle, string> = {
	'very-short': 'Prefers very short messages',
	short: 'Concise and to the point',
	moderate: 'Balanced message length',
	long: 'Loves to write detailed messages',
	'very-long': 'Writes长篇大论',
};

const PERIOD_LABELS: Record<ActivityPeriod, string> = {
	night: '🌙 Night owl',
	morning: '🌅 Early bird',
	afternoon: '☀️ Afternoon person',
	evening: '🌆 Evening active',
};

function generateShortInsights(profile: Omit<PersonalityProfile, 'shortInsights'>): string[] {
	const insights: string[] = [];

	// Communication style
	insights.push(
		`✍️ ${STYLE_LABELS[profile.communicationStyle]} (${profile.avgMessageLength} chars avg)`
	);

	// Media personality
	insights.push(`${profile.mediaPersonalityLabel}`);

	// Activity period
	insights.push(
		`${PERIOD_LABELS[profile.mostActivePeriod]} — ${profile.nightOwlScore}% at night`
	);

	// Filler words
	if (profile.topFillerWords.length > 0) {
		const topFiller = profile.topFillerWords[0];
		insights.push(
			`💬 Fave filler: "${topFiller.word}" (${topFiller.perMessage.toFixed(1)}× per msg)`
		);
	}

	return insights;
}

// ============================================
// Main Entry Point
// ============================================

export function computePersonalityProfiles(
	messages: TelegramMessage[],
	nicknames: string[],
	personsStats: PersonStats[]
): PersonalityProfile[] {
	return nicknames.map((nickname) => {
		const person = personsStats.find((p) => p.nickname === nickname);
		if (!person) {
			return createEmptyProfile(nickname);
		}

		const personMessages = messages.filter(
			(msg) => msg.type === 'message' && msg.from === nickname
		);

		if (personMessages.length === 0) {
			return createEmptyProfile(nickname);
		}

		const commStyle = analyzeCommunicationStyle(personMessages);
		const media = analyzeMediaPersonality(person);
		const timing = analyzeActivityTiming(personMessages);
		const fillers = analyzeFillerWords(personMessages);

		const profile = {
			nickname,
			...commStyle,
			...media,
			...timing,
			...fillers,
			shortInsights: [] as string[],
		};

		profile.shortInsights = generateShortInsights(profile);

		return profile;
	});
}

function createEmptyProfile(nickname: string): PersonalityProfile {
	return {
		nickname,
		communicationStyle: 'moderate',
		avgMessageLength: 0,
		medianMessageLength: 0,
		avgWordsPerMessage: 0,
		maxMessageLength: 0,
		messageLengthVariance: 0,
		mediaPersonalityLabel: '📝 No Data',
		stickerRatio: 0,
		gifRatio: 0,
		mediaRatio: 0,
		mostActivePeriod: 'afternoon',
		periodBreakdown: { night: 0, morning: 0, afternoon: 0, evening: 0 },
		nightOwlScore: 0,
		topFillerWords: [],
		totalFillers: 0,
		fillerWordsPerMessage: 0,
		shortInsights: ['📝 No message data available'],
	};
}
