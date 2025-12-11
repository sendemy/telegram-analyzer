import { PersonStats as PersonStatsType, GlobalStats, StatKey } from '../types/telegram';
import { COLORS } from '../utils/constants';

interface PersonStatsProps {
	person: PersonStatsType;
	total: GlobalStats;
	index?: number; // for alternating colors
	showVisualIndicators?: boolean;
}

interface StatLabel {
	key: StatKey;
	label: string;
}

export default function PersonStats({ person, total, index = 0, showVisualIndicators = false }: PersonStatsProps) {
	const calculatePercentage = (personValue: number, totalValue: number): number => {
		if (totalValue === 0) return 0;
		return (personValue * 100) / totalValue;
	};

	const stats: StatLabel[] = [
		{ key: 'messages' as const, label: 'Messages' },
		{ key: 'words' as const, label: 'Words' },
		{ key: 'symbols' as const, label: 'Symbols' },
		{ key: 'stickers' as const, label: 'Stickers' },
		{ key: 'gifs' as const, label: 'GIFs' },
	];

	const accentColor = COLORS[index % COLORS.length];

	return (
		<div className="person-stats" style={showVisualIndicators ? { borderLeft: `4px solid ${accentColor}` } : {}}>
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

			{showVisualIndicators && (
				<div className="activity-summary">
					<div className="summary-item">
						<span>Activity Score:</span>
						<span className="score">{((person.messages + person.words) / 2).toFixed(0)}</span>
					</div>
					<div className="summary-item">
						<span>Media Ratio:</span>
						<span className="ratio">
							{total.messages > 0
								? `${(((person.stickers + person.gifs) / person.messages) * 100).toFixed(1)}%`
								: '0%'}
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
