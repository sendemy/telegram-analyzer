import { GlobalStats as GlobalStatsType } from '../../types/telegram';
import DsCard from '../ui/DsCard';
import styles from './GlobalStats.module.scss';

interface GlobalStatsProps {
	data: GlobalStatsType;
	participantCount: number;
}

// Data structure for stats
const statsConfig = [
	{
		key: 'messages' as const,
		icon: '💬',
		label: 'Messages',
		description: 'Total messages in chat',
	},
	{
		key: 'words',
		icon: '🔤',
		label: 'Words',
		description: 'Total words written',
	},
	{
		key: 'symbols',
		icon: '✍️',
		label: 'Symbols',
		description: 'Total characters typed',
	},
	{
		key: 'stickers',
		icon: '🖼️',
		label: 'Stickers',
		description: 'Stickers sent',
	},
	{
		key: 'gifs',
		icon: '🎬',
		label: 'GIFs',
		description: 'GIFs shared',
	},
	{
		key: 'participants',
		icon: '👥',
		label: 'Participants',
		description: 'People in chat',
		customValue: true,
	},
] as const;

export default function GlobalStats({ data, participantCount }: GlobalStatsProps) {
	return (
		<DsCard padding="lg" shadow="md" border className={styles.globalStats}>
			<div className={styles.statsGrid}>
				{statsConfig.map((stat) => {
					const value =
						stat.key === 'participants'
							? participantCount
							: data[stat.key as keyof GlobalStatsType];

					return (
						<DsCard
							key={stat.key}
							padding="md"
							shadow="sm"
							hoverable
							border
							className={styles.statCard}
						>
							<div className={styles.statContent}>
								<div className={styles.statIcon}>{stat.icon}</div>
								<div className={styles.statDetails}>
									<h3 className={styles.statTitle}>{stat.label}</h3>
									<p className={styles.statValue}>{value.toLocaleString()}</p>
									<p className={styles.statLabel}>{stat.description}</p>
								</div>
							</div>
						</DsCard>
					);
				})}
			</div>
		</DsCard>
	);
}
