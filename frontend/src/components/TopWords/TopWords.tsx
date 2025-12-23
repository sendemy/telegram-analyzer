import { useMemo } from 'preact/hooks';
import styles from './TopWords.module.scss';
import DsTag from '../ui/DsTag';
// We no longer need STOP_WORDS here as sortData handles it
import DsCard from '../ui/DsCard';

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
	barColor = '#2b5797',
}: TopWordsProps) {
	// 1. Prepare data for rendering
	const sortedWords = useMemo(() => {
		// Basic safety check
		if (!words || typeof words !== 'object') return [];

		// The words prop is now already filtered by sortData.
		// We just need to sort (to be safe) and slice for the UI limit.
		return Object.entries(words)
			.sort(([, a], [, b]) => b - a)
			.slice(0, maxWords);
	}, [words, maxWords]);

	// 2. Calculate totals
	const totalOccurrences = useMemo(() => {
		return sortedWords.reduce((sum, [, count]) => sum + count, 0);
	}, [sortedWords]);

	const maxCount = useMemo(() => {
		return sortedWords.length > 0 ? Math.max(...sortedWords.map(([, count]) => count)) : 0;
	}, [sortedWords]);

	// Empty State
	if (sortedWords.length === 0) {
		return (
			<div className={styles.emptyState}>
				<h3 className={styles.emptyTitle}>No Words Analyzed</h3>
				<p className={styles.emptyMessage}>No interesting words found or data is empty.</p>
			</div>
		);
	}

	return (
		<DsCard padding="lg" shadow="sm">
			<div className={styles.topWords}>
				{/* Header */}
				<div className={styles.header}>
					<h3 className={styles.title}>{title}</h3>
					<div className={styles.statsRow}>
						<DsTag variant="accent">{sortedWords.length} words</DsTag>
						<DsTag>{totalOccurrences.toLocaleString()} uses</DsTag>
					</div>
				</div>

				{/* List */}
				<div className={styles.list}>
					{sortedWords.map(([word, count], index) => {
						const rank = index + 1;
						const percentage =
							totalOccurrences > 0 ? (count / totalOccurrences) * 100 : 0;
						const barPercentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

						return (
							<div key={word} className={styles.item}>
								<div className={styles.rank}>
									<span className={styles.rankNumber}>{rank}</span>
								</div>

								<div className={styles.content}>
									<div className={styles.itemHeader}>
										<span className={styles.wordText}>{word}</span>
										<div className={styles.itemStats}>
											<DsTag size="sm">{count}</DsTag>
											<span className={styles.percentageText}>
												{percentage.toFixed(1)}%
											</span>
										</div>
									</div>

									<div className={styles.chartContainer}>
										<div
											className={styles.bar}
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
		</DsCard>
	);
}
