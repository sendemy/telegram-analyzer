import { useState } from 'preact/hooks';
import FileUpload from './components/FileUpload';
import GlobalStats from './components/GlobalStats/GlobalStats';
import Layout from './components/Layout';
import MessageTimelineChart from './components/MessageTimelineChart/MessageTimelineChart';
import PersonStats from './components/PersonStats/PersonStats';
import PredictiveChart from './components/PredictiveChart';
import SentimentChart from './components/SentimentChart/SentimentChart';
import SentimentOverview from './components/SentimentOverview/SentimentOverview';
import StatsChart from './components/StatsChart';
import TopWords from './components/TopWords/TopWords';
import DsButton from './components/ui/DsButton';
import DsTag from './components/ui/DsTag';
import { useChatData } from './hooks/useChatData';
import { useSentiment } from './hooks/useSentiment';
import { TelegramData } from './types/telegram';
import { STAT_KEYS } from './utils/constants';

// Loading component for better UX
function LoadingSpinner() {
	return (
		<div className="loading-overlay">
			<div className="spinner-container">
				<div className="spinner"></div>
				<p>Analyzing your chat data...</p>
				<p className="loading-subtext">This may take a moment for large chats</p>
			</div>
		</div>
	);
}

// Empty state component
function EmptyState() {
	return (
		<div className="empty-state">
			<div className="empty-icon">
				<svg width="64" height="64" viewBox="0 0 24 24" fill="#ccc">
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
					<path d="M14 2v6h6" />
					<circle cx="12" cy="15" r="1" />
					<path d="M12 12v3" />
				</svg>
			</div>
			<h2>Ready to Analyze Your Chat</h2>
			<p>Upload a Telegram chat export in JSON format to see detailed statistics</p>
			<div className="empty-features">
				<div className="feature">
					<span className="feature-icon">📊</span>
					<span>Message Statistics</span>
				</div>
				<div className="feature">
					<span className="feature-icon">👥</span>
					<span>Participant Analysis</span>
				</div>
				<div className="feature">
					<span className="feature-icon">📈</span>
					<span>Visual Charts</span>
				</div>
				<div className="feature">
					<span className="feature-icon">🔤</span>
					<span>Word Frequency</span>
				</div>
				<div className="feature">
					<span className="feature-icon">😊</span>
					<span>Sentiment Analysis</span>
				</div>
			</div>
		</div>
	);
}

export default function App() {
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [rawData, setRawData] = useState<TelegramData | null>(null);
	const { processedData, isLoading, error, processChatData, resetData } = useChatData();
	const sentimentInsights = useSentiment(rawData?.messages ?? null);

	const handleFileUpload = async (fileData: TelegramData) => {
		setUploadError(null);
		try {
			setRawData(fileData);
			await processChatData(fileData);
		} catch (err) {
			setUploadError(err instanceof Error ? err.message : 'Failed to process file');
			console.error('Upload error:', err);
		}
	};

	const handleReset = () => {
		resetData();
		setUploadError(null);
	};

	return (
		<Layout>
			{/* Info Section */}
			<section className="info-container">
				<div className="info-card">
					<h2>📱 How to Use</h2>
					<ol>
						<li>Open Telegram (Desktop or Mobile)</li>
						<li>Select a chat → Click ⋮ (More) → Export chat</li>
						<li>Choose "Machine-readable JSON" format</li>
						<li>Select date range (optional) and export</li>
						<li>Upload the JSON file below</li>
					</ol>
					<div className="info-note">
						<strong>Note:</strong> Your data is processed locally and never uploaded to
						any server.
					</div>
				</div>
			</section>

			{/* File Upload Section */}
			<section className="input-container">
				<FileUpload onFileLoaded={handleFileUpload} maxSizeMB={50} showPreview={true} />
			</section>

			{/* Error Display */}
			{(error || uploadError) && (
				<section className="error-container">
					<div className="error-card">
						<h3>⚠️ Something went wrong</h3>
						<p>{error || uploadError}</p>
						<div className="error-actions">
							<button onClick={handleReset} className="btn btn-primary">
								Try Again
							</button>
							<button
								onClick={() => setUploadError(null)}
								className="btn btn-secondary"
							>
								Dismiss
							</button>
						</div>
					</div>
				</section>
			)}

			{/* Loading State */}
			{isLoading && <LoadingSpinner />}

			{/* Main Content - Only show when data exists */}
			{processedData ? (
				<>
					{/* Global Statistics */}
					<section className="main-container">
						<div className="section-header">
							<h2>📊 Global Chat Statistics</h2>
							<DsButton onClick={handleReset} variant="accent" size="lg">
								Reset & Upload New Chat
							</DsButton>
						</div>
						<GlobalStats
							data={processedData.totalStats}
							participantCount={processedData.nicknames.length}
						/>
					</section>

					{/* Participant Statistics */}
					{processedData.personsStats.length > 0 && (
						<section className="persons-container">
							<div className="section-header">
								<h2>👥 Participant Breakdown</h2>
								<DsTag variant="accent" size="lg">
									{processedData.personsStats.length} participants
								</DsTag>
							</div>
							<div className="persons-grid">
								{processedData.personsStats.map((person, index) => (
									<PersonStats
										key={person.nickname}
										person={person}
										total={processedData.totalStats}
										index={index}
										showVisualIndicators={true}
										sentiment={
											sentimentInsights?.personSentiments.find(
												(ps) => ps.nickname === person.nickname
											) ?? null
										}
										personality={
											processedData.personalityProfiles?.find(
												(p) => p.nickname === person.nickname
											) ?? null
										}
									/>
								))}
							</div>
						</section>
					)}

					{/* Charts */}
					{processedData.chartObjects.length > 0 && (
						<section className="chart-container">
							<div className="section-header">
								<h2>📈 Visual Distribution</h2>
								<p className="section-subtitle">
									Percentage distribution across participants
								</p>
							</div>
							<div className="charts-grid">
								{processedData.chartObjects.map((chartObject, index) => (
									<StatsChart
										key={STAT_KEYS[index]}
										chartObject={chartObject}
										chartType={STAT_KEYS[index]}
										totalStat={processedData.totalStats[STAT_KEYS[index]]}
										colors={processedData.nicknames.map(
											(_, i) => `hsl(${(i * 137.508) % 360}, 70%, 60%)` // Golden angle for distinct colors
										)}
									/>
								))}
							</div>
						</section>
					)}

					{processedData.chartObjects.length > 0 && (
						<section>
							<div className="section-header">
								<h2>Message Activity</h2>
							</div>
							<MessageTimelineChart messages={rawData!.messages} />
						</section>
					)}

					{processedData &&
						processedData.topWords &&
						Object.keys(processedData.topWords).length > 0 && (
							<section className="top-words-section">
								<div className="section-header minimal-header">
									<h2>Word Frequency</h2>
								</div>
								<TopWords
									words={processedData.topWords}
									title=""
									barColor="#2b5797" // Or use a custom color: "#dc2626" for red, "#059669" for green
								/>
							</section>
						)}

					{/* Sentiment Analysis */}
					{sentimentInsights && (
						<section className="sentiment-container">
							<div className="section-header">
								<h2>😊 Sentiment Analysis</h2>
								<DsTag variant="accent" size="lg">
									{sentimentInsights.overallLabel.replace('-', ' ')} mood
								</DsTag>
							</div>
							<SentimentOverview data={sentimentInsights} />
						</section>
					)}

					{sentimentInsights && sentimentInsights.dailySentiment.length > 0 && (
						<section className="timeline-section">
							<div className="section-header">
								<h2>📉 Mood Timeline</h2>
							</div>
							<SentimentChart data={sentimentInsights.dailySentiment} />
						</section>
					)}

					{/* Predictive Analytics */}
					{rawData && processedData && (
						<section className="predictive-section">
							<div className="section-header">
								<h2>📈 Predictive Analytics</h2>
								<DsTag variant="accent" size="lg">
									trending
								</DsTag>
							</div>
							<PredictiveChart
								messages={rawData.messages}
								nicknames={processedData.nicknames}
							/>
						</section>
					)}

					{/* Additional Insights */}
					<section className="insights-container">
						<div className="section-header">
							<h2>💡 Chat Insights</h2>
						</div>
						<div className="insights-grid">
							<div className="insight-card">
								<h3>📅 Activity Level</h3>
								<p>
									{processedData.totalStats.messages > 1000
										? 'Very Active'
										: processedData.totalStats.messages > 500
											? 'Active'
											: processedData.totalStats.messages > 100
												? 'Moderate'
												: 'Light'}
								</p>
								<small>Based on total message count</small>
							</div>
							<div className="insight-card">
								<h3>💬 Word Density</h3>
								<p>
									{(
										processedData.totalStats.words /
										processedData.totalStats.messages
									).toFixed(1)}{' '}
									words/message
								</p>
								<small>Average message length</small>
							</div>
							<div className="insight-card">
								<h3>🖼️ Media Usage</h3>
								<p>
									{(
										((processedData.totalStats.stickers +
											processedData.totalStats.gifs) /
											processedData.totalStats.messages) *
										100
									).toFixed(1)}
									%
								</p>
								<small>Percentage of media messages</small>
							</div>
						</div>
					</section>
				</>
			) : (
				// Empty State
				!isLoading && !error && <EmptyState />
			)}
		</Layout>
	);
}
