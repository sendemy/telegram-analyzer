import type { SentimentInsights, SentimentLabel } from '../../types/telegram';
import DsCard from '../ui/DsCard';
import DsTag from '../ui/DsTag';
import styles from './SentimentOverview.module.scss';

interface SentimentOverviewProps {
	data: SentimentInsights;
}

// Mood emoji mapping
const MOOD_MAP: Record<SentimentLabel, { emoji: string; label: string }> = {
	'very-positive': { emoji: '😄', label: 'Very Positive' },
	positive: { emoji: '🙂', label: 'Positive' },
	neutral: { emoji: '😐', label: 'Neutral' },
	negative: { emoji: '😕', label: 'Negative' },
	'very-negative': { emoji: '😡', label: 'Very Negative' },
};

// Color mapping for tags
const TAG_VARIANT_MAP: Record<
	SentimentLabel,
	'success' | 'warning' | 'error' | 'default' | 'accent'
> = {
	'very-positive': 'success',
	positive: 'success',
	neutral: 'default',
	negative: 'error',
	'very-negative': 'error',
};

export default function SentimentOverview({ data }: SentimentOverviewProps) {
	const mood = MOOD_MAP[data.overallLabel];
	const tagVariant = TAG_VARIANT_MAP[data.overallLabel];

	// Recompute positive vs negative as proportions of non-neutral messages only
	const emotionalTotal = data.positivityRate + data.negativityRate;
	const adjustedPositive = emotionalTotal > 0 ? (data.positivityRate / emotionalTotal) * 100 : 50;
	const adjustedNegative = emotionalTotal > 0 ? (data.negativityRate / emotionalTotal) * 100 : 50;

	return (
		<DsCard padding="lg" shadow="md" border className={styles.overview}>
			{/* Header: Mood emoji + overall score */}
			<div className={styles.header}>
				<div className={styles.moodSection}>
					<span className={styles.moodEmoji} role="img" aria-label={mood.label}>
						{mood.emoji}
					</span>
					<div className={styles.moodInfo}>
						<h3 className={styles.moodTitle}>Chat Mood</h3>
						<DsTag variant={tagVariant} size="lg">
							{mood.label}
						</DsTag>
					</div>
				</div>
				<div className={styles.scoreSection}>
					<span className={styles.scoreValue}>{data.overallComparative.toFixed(2)}</span>
					<span className={styles.scoreLabel}>Average Score</span>
				</div>
			</div>

			{/* Sentiment distribution bars (pos vs neg only, neutral excluded) */}
			<div className={styles.distribution}>
				<div className={styles.distributionHeader}>
					<h4 className={styles.sectionTitle}>Positive vs Negative</h4>
					<span className={styles.neutralNote}>
						{data.neutralityRate.toFixed(1)}% neutral messages excluded
					</span>
				</div>
				<div className={styles.bars}>
					<div className={styles.barRow}>
						<span className={styles.barLabel}>Positive</span>
						<div className={styles.barTrack}>
							<div
								className={`${styles.barFill} ${styles.barPositive}`}
								style={{ width: `${adjustedPositive}%` }}
							/>
						</div>
						<span className={styles.barValue}>{adjustedPositive.toFixed(1)}%</span>
					</div>
					<div className={styles.barRow}>
						<span className={styles.barLabel}>Negative</span>
						<div className={styles.barTrack}>
							<div
								className={`${styles.barFill} ${styles.barNegative}`}
								style={{ width: `${adjustedNegative}%` }}
							/>
						</div>
						<span className={styles.barValue}>{adjustedNegative.toFixed(1)}%</span>
					</div>
				</div>
			</div>

			{/* Highlights: Top 3 most positive & negative messages */}
			{(data.mostPositiveMessages.length > 0 || data.mostNegativeMessages.length > 0) && (
				<div className={styles.highlights}>
					<h4 className={styles.sectionTitle}>Chat Highlights</h4>
					<div className={styles.highlightsGrid}>
						{/* Positive column */}
						{data.mostPositiveMessages.length > 0 && (
							<div className={styles.highlightColumn}>
								<h4 className={styles.highlightColumnTitle}>🌟 Most Positive</h4>
								{data.mostPositiveMessages.map((msg, i) => (
									<div
										key={`pos-${i}`}
										className={`${styles.highlightCard} ${styles.highlightPositive}`}
									>
										<div className={styles.highlightHeader}>
											<span className={styles.highlightRank}>#{i + 1}</span>
											<span className={styles.highlightAuthor}>
												{msg.from}
											</span>
											<DsTag size="sm" variant="success">
												+{msg.score.toFixed(2)}
											</DsTag>
										</div>
										<p className={styles.highlightText}>{msg.text}</p>
									</div>
								))}
							</div>
						)}
						{/* Negative column */}
						{data.mostNegativeMessages.length > 0 && (
							<div className={styles.highlightColumn}>
								<h4 className={styles.highlightColumnTitle}>💔 Most Negative</h4>
								{data.mostNegativeMessages.map((msg, i) => (
									<div
										key={`neg-${i}`}
										className={`${styles.highlightCard} ${styles.highlightNegative}`}
									>
										<div className={styles.highlightHeader}>
											<span className={styles.highlightRank}>#{i + 1}</span>
											<span className={styles.highlightAuthor}>
												{msg.from}
											</span>
											<DsTag size="sm" variant="error">
												{msg.score.toFixed(2)}
											</DsTag>
										</div>
										<p className={styles.highlightText}>{msg.text}</p>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</DsCard>
	);
}
