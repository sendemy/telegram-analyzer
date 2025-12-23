import { usePersonActivity } from '../../hooks/useActivity';
import { GlobalStats, PersonStats as PersonStatsType } from '../../types/telegram';
import { COLORS } from '../../utils/constants';
import { capitalize } from '../../utils/strings';
import DsCard from '../ui/DsCard';
import styles from './PersonStats.module.scss';

interface PersonStatsProps {
	person: PersonStatsType;
	total: GlobalStats;
	index?: number;
	showVisualIndicators?: boolean;
	showActivityScore?: boolean;
	className?: string;
}

export default function PersonStats({
	person,
	total,
	index = 0,
	showVisualIndicators = false,
	showActivityScore = true,
	className,
}: PersonStatsProps) {
	const activity = usePersonActivity({
		messages: person.messages,
		words: person.words,
		stickers: person.stickers,
		gifs: person.gifs,
	});

	const calculatePercentage = (personValue: number, totalValue: number): number => {
		if (totalValue === 0) return 0;
		return (personValue * 100) / totalValue;
	};

	const stats = [
		{ key: 'messages' as const, label: 'Messages' },
		{ key: 'words' as const, label: 'Words' },
		{ key: 'symbols' as const, label: 'Symbols' },
		{ key: 'stickers' as const, label: 'Stickers' },
		{ key: 'gifs' as const, label: 'GIFs' },
	];

	const accentColor = COLORS[index % COLORS.length];
	const activityLevel = capitalize(activity.activityLevel.replace('-', ' '));

	return (
		<DsCard
			key={person.nickname}
			padding="lg"
			shadow="sm"
			hoverable
			accent="left"
			accentColor={showVisualIndicators ? accentColor : undefined}
			className={className}
		>
			{/* Header with person name and rank */}
			<div className="person-header">
				<h2 style={showVisualIndicators ? { color: accentColor } : {}}>
					{person.nickname}
				</h2>
			</div>

			{/* Stats grid */}
			<div className={styles.wrapper}>
				{/* In numbers column */}
				<div className={styles.statsColumn}>
					<h3 className={styles.columnTitle}>In numbers</h3>
					{stats.map((stat) => (
						<div key={stat.key} className={styles.statRow}>
							<span className={styles.statLabel}>{stat.label}:</span>
							<span className={styles.statValue}>
								{person[stat.key].toLocaleString()}
							</span>
						</div>
					))}
				</div>

				{/* In percent column */}
				<div className={styles.statsColumn}>
					<h3 className={styles.columnTitle}>In percent</h3>
					{stats.map((stat) => {
						const percentage = calculatePercentage(person[stat.key], total[stat.key]);
						return (
							<div key={stat.key} className={styles.statRow}>
								<span className={styles.statLabel}>{stat.label}:</span>
								<div className={styles.percentageContainer}>
									<span className={styles.statValue}>
										{percentage.toFixed(2)}%
									</span>
									{showVisualIndicators && (
										<div className={styles.percentageBar}>
											<div
												className={styles.percentageFill}
												style={{
													width: `${Math.min(percentage, 100)}%`,
													backgroundColor: accentColor,
												}}
											/>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Activity summary section */}
			{showActivityScore && (
				<div className={styles.activitySummary}>
					{/* Activity score */}
					<div className={styles.summaryItem}>
						<div className={styles.summaryHeader}>
							<h4>Activity Score</h4>
						</div>
						<div className={styles.scoreDetails}>
							<strong className={styles.scoreMain}>
								{activity.score.toLocaleString()}
							</strong>
						</div>
					</div>

					{/* Word density */}
					<div className={styles.summaryItem}>
						<h4 className={styles.summaryHeader}>Word Density</h4>
						<div className={styles.densityDisplay}>
							<strong className={styles.densityValue}>
								<span>{activity.wordDensity}</span>
							</strong>
						</div>
					</div>

					{/* Media ratio */}
					<div className={styles.summaryItem}>
						<h4 className={styles.summaryHeader}>Media Ratio</h4>
						<strong className={styles.mediaRatio}>
							{person.messages > 0
								? `${(((person.stickers + person.gifs) / person.messages) * 100).toFixed(1)}%`
								: '0%'}
						</strong>
					</div>
				</div>
			)}
		</DsCard>
	);
}
