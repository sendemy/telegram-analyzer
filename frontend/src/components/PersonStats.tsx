import { PersonStats as PersonStatsType, GlobalStats } from '../types/telegram';
import { COLORS } from '../utils/constants';
import { usePersonActivity, WordWeightCategoryEnum } from '../hooks/useActivity';
import { capitalize } from '../utils/strings';

interface PersonStatsProps {
	person: PersonStatsType;
	total: GlobalStats;
	index?: number;
	showVisualIndicators?: boolean;
	showActivityScore?: boolean;
}

export default function PersonStats({
	person,
	total,
	index = 0,
	showVisualIndicators = false,
	showActivityScore = true,
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

	return (
		<div
			className="person-stats"
			style={showVisualIndicators ? { borderLeft: `4px solid ${accentColor}` } : {}}
		>
			<h2 style={showVisualIndicators ? { color: accentColor } : {}}>{person.nickname}</h2>

			<div className="person-stats__wrapper">
				<div className="person-stats__digits">
					<h3>In numbers</h3>
					{stats.map((stat) => (
						<div key={stat.key} className="stat-row">
							<span className="stat-label">{stat.label}:</span>
							<span className="stat-value">{person[stat.key].toLocaleString()}</span>
						</div>
					))}
				</div>

				<div className="person-stats__percent">
					<h3>In percent</h3>
					{stats.map((stat) => {
						const percentage = calculatePercentage(person[stat.key], total[stat.key]);
						return (
							<div key={stat.key} className="stat-row">
								<span className="stat-label">{stat.label}:</span>
								<div className="percentage-container">
									<span className="stat-value">{percentage.toFixed(2)}%</span>
									{showVisualIndicators && (
										<div className="percentage-bar">
											<div
												className="percentage-fill"
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

			{/* Enhanced Activity Score Section */}
			{showActivityScore && (
				<div className="activity-summary">
					<div className="summary-item">
						<div className="summary-header">
							<span>Activity Score</span>
						</div>
						<div className="score-details">
							<strong className="score-main">
								{activity.score.toLocaleString()}
							</strong>
							<span>{capitalize(activity.activityLevel.replace('-', ' '))}</span>
						</div>
					</div>

					<div className="summary-item">
						<span>Word Density</span>
						<div className="density-display">
							<strong className="density-value">
								{activity.wordDensity} words/message
							</strong>
							<span className="density-category">
								{capitalize(activity.breakdown.wordWeightCategory)} density
							</span>
						</div>
					</div>

					<div className="summary-item">
						<span>Media Ratio</span>
						<strong className="media-ratio">
							{person.messages > 0
								? `${(((person.stickers + person.gifs) / person.messages) * 100).toFixed(1)}%`
								: '0%'}
						</strong>
						<div className="media-breakdown">
							<span>
								{person.stickers} stickers • {person.gifs} GIFs
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
