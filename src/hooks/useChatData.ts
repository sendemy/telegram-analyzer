import { useState } from 'preact/hooks';
import type { PersonStats, ProcessedData, TelegramData, TelegramMessage } from '../types/telegram';
import { getGlobalStats, getPersonStats, sortData } from '../utils/analyzers';
import { computePersonalityProfiles } from '../utils/personality';

export function useChatData() {
	const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const processChatData = (rawData: TelegramData) => {
		try {
			setIsLoading(true);
			setError(null);

			// Step 1: Extract unique nicknames
			const nicknames = extractNicknames(rawData.messages);

			// Step 2: Calculate global statistics
			const totalStats = getGlobalStats(rawData.messages);

			// Step 3: Calculate per-person statistics
			const personsStats: PersonStats[] = nicknames.map((nickname) =>
				getPersonStats(rawData.messages, nickname)
			);

			// Step 4: Prepare chart data objects
			const chartObjects = prepareChartObjects(personsStats, nicknames);

			// Step 5: Get top words
			const topWords = sortData(rawData.messages);

			// Step 6: Compute personality profiles
			const personalityProfiles = computePersonalityProfiles(
				rawData.messages,
				nicknames,
				personsStats
			);

			// Step 7: Update state with all processed data
			setProcessedData({
				totalStats,
				personsStats,
				chartObjects,
				topWords,
				nicknames,
				personalityProfiles,
			});
		} catch (err) {
			console.error('Error processing chat data:', err);
			setError(err instanceof Error ? err.message : 'Failed to process chat data');
			setProcessedData(null);
		} finally {
			setIsLoading(false);
		}
	};

	const extractNicknames = (messages: TelegramMessage[]): string[] => {
		const nicknameSet = new Set<string>();

		messages.forEach((msg) => {
			if (msg.type === 'message' && 'from' in msg && msg.from) {
				nicknameSet.add(msg.from);
			}
		});

		return Array.from(nicknameSet);
	};

	const prepareChartObjects = (personsStats: PersonStats[], nicknames: string[]) => {
		const messagesObj: Record<string, number> = {};
		const wordsObj: Record<string, number> = {};
		const symbolsObj: Record<string, number> = {};
		const stickersObj: Record<string, number> = {};
		const gifsObj: Record<string, number> = {};

		nicknames.forEach((nickname) => {
			const personStat = personsStats.find((p) => p.nickname === nickname);
			if (personStat) {
				messagesObj[nickname] = personStat.messages;
				wordsObj[nickname] = personStat.words;
				symbolsObj[nickname] = personStat.symbols;
				stickersObj[nickname] = personStat.stickers;
				gifsObj[nickname] = personStat.gifs;
			}
		});

		return [messagesObj, wordsObj, symbolsObj, stickersObj, gifsObj];
	};

	const resetData = () => {
		setProcessedData(null);
		setError(null);
	};

	return {
		processedData,
		isLoading,
		error,
		processChatData,
		resetData,
	};
}
