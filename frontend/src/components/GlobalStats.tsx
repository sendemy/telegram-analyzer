import { GlobalStats as GlobalStatsType } from '../types/telegram';

interface GlobalStatsProps {
	data: GlobalStatsType;
	participantCount: number;
}

export default function GlobalStats({ data, participantCount }: GlobalStatsProps) {
	return (
		<div className="global-stats">
			<div className="stats-grid">
				<div className="stat-card">
					<div className="stat-icon">💬</div>
					<div className="stat-content">
						<h3>Messages</h3>
						<p className="stat-value">{data.messages.toLocaleString()}</p>
						<p className="stat-label">Total messages in chat</p>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon">🔤</div>
					<div className="stat-content">
						<h3>Words</h3>
						<p className="stat-value">{data.words.toLocaleString()}</p>
						<p className="stat-label">Total words written</p>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon">✍️</div>
					<div className="stat-content">
						<h3>Symbols</h3>
						<p className="stat-value">{data.symbols.toLocaleString()}</p>
						<p className="stat-label">Total characters typed</p>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon">🖼️</div>
					<div className="stat-content">
						<h3>Stickers</h3>
						<p className="stat-value">{data.stickers.toLocaleString()}</p>
						<p className="stat-label">Stickers sent</p>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon">🎬</div>
					<div className="stat-content">
						<h3>GIFs</h3>
						<p className="stat-value">{data.gifs.toLocaleString()}</p>
						<p className="stat-label">GIFs shared</p>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon">👥</div>
					<div className="stat-content">
						<h3>Participants</h3>
						<p className="stat-value">{participantCount}</p>
						<p className="stat-label">People in chat</p>
					</div>
				</div>
			</div>
		</div>
	);
}
