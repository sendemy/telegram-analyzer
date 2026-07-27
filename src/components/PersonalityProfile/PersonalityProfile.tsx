import type {
	ActivityPeriod,
	PersonalityProfile as PersonalityProfileType,
} from '../../types/telegram';
import DsTag from '../ui/DsTag';
import styles from './PersonalityProfile.module.scss';

export interface PersonalityProfileProps {
	profile: PersonalityProfileType;
}

const PERIOD_COLORS: Record<ActivityPeriod, string> = {
	night: '#1e293b',
	morning: '#f59e0b',
	afternoon: '#3b82f6',
	evening: '#8b5cf6',
};

const PERIOD_LABELS: Record<ActivityPeriod, string> = {
	night: '🌙 Night',
	morning: '🌅 Morning',
	afternoon: '☀️ Afternoon',
	evening: '🌆 Evening',
};

const STYLE_EMOJI: Record<string, string> = {
	'very-short': '⚡',
	short: '📏',
	moderate: '⚖️',
	long: '📜',
	'very-long': '📚',
};

export default function PersonalityProfile({ profile }: PersonalityProfileProps) {
	const totalPeriod = Object.values(profile.periodBreakdown).reduce((a, b) => a + b, 0);

	return (
		<div className={styles.profile}>
			<h4 className={styles.title}>Personality Profile</h4>
			<div className={styles.grid}>
				{/* Communication Style */}
				<div className={styles.traitCard}>
					<div className={styles.traitHeader}>
						<span className={styles.traitIcon}>
							{STYLE_EMOJI[profile.communicationStyle] || '✍️'}
						</span>
						<span className={styles.traitLabel}>Communication</span>
					</div>
					<span className={styles.traitValue}>
						{profile.communicationStyle.replace('-', ' ')}
					</span>
					<div className={styles.traitStats}>
						<span>{profile.avgMessageLength} chars avg</span>
						<span>{profile.avgWordsPerMessage} words/msg</span>
					</div>
				</div>

				{/* Media Personality */}
				<div className={styles.traitCard}>
					<div className={styles.traitHeader}>
						<span className={styles.traitIcon}>🎨</span>
						<span className={styles.traitLabel}>Media</span>
					</div>
					<span className={styles.traitValue}>{profile.mediaPersonalityLabel}</span>
					<div className={styles.traitStats}>
						<span>{profile.stickerRatio}% stickers</span>
						<span>{profile.gifRatio}% GIFs</span>
					</div>
				</div>

				{/* Activity Pattern */}
				<div className={styles.traitCard}>
					<div className={styles.traitHeader}>
						<span className={styles.traitIcon}>
							{profile.mostActivePeriod === 'night' ? '🌙' : '☀️'}
						</span>
						<span className={styles.traitLabel}>Activity</span>
					</div>
					<span className={styles.traitValue}>
						{PERIOD_LABELS[profile.mostActivePeriod]}
					</span>
					{/* Period breakdown bar */}
					{totalPeriod > 0 && (
						<div className={styles.periodBar}>
							{(
								Object.entries(profile.periodBreakdown) as [
									ActivityPeriod,
									number,
								][]
							).map(([period, count]) => (
								<div
									key={period}
									className={styles.periodSegment}
									style={{
										width: `${(count / totalPeriod) * 100}%`,
										backgroundColor: PERIOD_COLORS[period],
									}}
									title={`${PERIOD_LABELS[period]}: ${count} messages`}
								/>
							))}
						</div>
					)}
					<div className={styles.traitStats}>
						<span>{profile.nightOwlScore}% at night</span>
					</div>
				</div>

				{/* Filler Words */}
				<div className={styles.traitCard}>
					<div className={styles.traitHeader}>
						<span className={styles.traitIcon}>💬</span>
						<span className={styles.traitLabel}>Mannerisms</span>
					</div>
					{profile.topFillerWords.length > 0 ? (
						<div className={styles.fillerList}>
							{profile.topFillerWords.slice(0, 3).map((fw) => (
								<div key={fw.word} className={styles.fillerRow}>
									<span className={styles.fillerWord}>"{fw.word}"</span>
									<div className={styles.fillerBarTrack}>
										<div
											className={styles.fillerBarFill}
											style={{
												width: `${Math.min(fw.perMessage * 50, 100)}%`,
											}}
										/>
									</div>
									<span className={styles.fillerCount}>
										{fw.perMessage.toFixed(1)}×
									</span>
								</div>
							))}
						</div>
					) : (
						<span className={styles.traitValue}>No filler words detected</span>
					)}
				</div>
			</div>

			{/* Insights tags */}
			{profile.shortInsights.length > 0 && (
				<div className={styles.insights}>
					{profile.shortInsights.map((insight) => (
						<DsTag key={insight} size="sm" variant="accent">
							{insight}
						</DsTag>
					))}
				</div>
			)}
		</div>
	);
}
