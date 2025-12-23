import { useMemo } from 'preact/hooks';
import DsTag from './ui/DsTag';

interface TopWordsProps {
	words: Record<string, number>;
	title?: string;
	maxWords?: number;
	barColor?: string;
}

export default function TopWords({
	words,
	title = 'Most Used Words',
	maxWords = 10,
	barColor = '#2b5797', // Default Telegram blue
}: TopWordsProps) {
	const sortedWords = useMemo(() => {
		return Object.entries(words)
			.sort(([, a], [, b]) => b - a)
			.slice(0, maxWords);
	}, [words, maxWords]);

	const totalOccurrences = useMemo(() => {
		return sortedWords.reduce((sum, [, count]) => sum + count, 0);
	}, [sortedWords]);

	const maxCount = useMemo(() => {
		return sortedWords.length > 0 ? Math.max(...sortedWords.map(([, count]) => count)) : 0;
	}, [sortedWords]);

	if (sortedWords.length === 0) {
		return (
			<div className="top-words empty">
				<h3 className="empty-title">No Words Analyzed</h3>
				<p className="empty-message">Upload a chat to see word frequency analysis</p>
			</div>
		);
	}

	return (
		<div className="top-words minimal">
			<div className="top-words-header minimal-header">
				<h3 className="minimal-title">{title}</h3>
				<div className="minimal-stats">
					<DsTag variant="accent">{sortedWords.length} words</DsTag>
					<DsTag>{totalOccurrences.toLocaleString()} total uses</DsTag>
				</div>
			</div>

			<div className="words-list minimal-list">
				{sortedWords.map(([word, count], index) => {
					const rank = index + 1;
					const percentage = totalOccurrences > 0 ? (count / totalOccurrences) * 100 : 0;
					const barPercentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

					return (
						<div key={word} className="word-item minimal-word">
							<div className="word-rank minimal-rank">
								<span className="rank-number">{rank}</span>
							</div>

							<div className="word-content minimal-content">
								<div className="word-header minimal-word-header">
									<div className="word-text-group">
										<span className="word-text minimal-word-text">{word}</span>
									</div>
									<div className="word-stat">
										<DsTag size="sm">{count} uses</DsTag>
										<span className="word-percentage minimal-percentage">
											{percentage.toFixed(1)}%
										</span>
									</div>
								</div>

								<div className="word-chart minimal-chart">
									<div
										className="word-bar minimal-bar"
										style={{
											width: `${barPercentage}%`,
											backgroundColor: barColor,
										}}
									/>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
