import { useMemo } from 'preact/hooks';
import type { SentimentInsights, TelegramMessage } from '../types/telegram';
import { analyzeMessages } from '../utils/sentiment';

/**
 * Hook that performs sentiment analysis on chat messages.
 * Computation is lazy (useMemo) and only runs when messages change.
 */
export function useSentiment(messages: TelegramMessage[] | null): SentimentInsights | null {
	return useMemo(() => {
		if (!messages || messages.length === 0) return null;
		return analyzeMessages(messages);
	}, [messages]);
}
