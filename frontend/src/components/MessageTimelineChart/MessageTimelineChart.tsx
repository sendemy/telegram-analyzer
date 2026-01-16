import { useRef, useEffect, useState } from 'preact/hooks';
import Chart, { ChartConfiguration } from 'chart.js/auto';
import { TelegramMessage } from '../../types/telegram';
import { COLORS } from '../../utils/constants';
import DsCard from '../ui/DsCard';
import DsTag from '../ui/DsTag';
import styles from './MessageTimelineChart.module.scss';

type TimeRange = 'week' | 'month' | 'year' | 'all';

interface MessageTimelineChartProps {
	messages: TelegramMessage[];
	className?: string;
}

// Structure to hold aggregated data for a specific date bucket
interface DateBucket {
	total: number;
	userCounts: Record<string, number>;
}

export default function MessageTimelineChart({ messages, className }: MessageTimelineChartProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const chartInstance = useRef<Chart | null>(null);
	const [timeRange, setTimeRange] = useState<TimeRange>('week');

	// Helper to get date cutoff based on range
	const getCutoffDate = (range: TimeRange): Date => {
		const now = new Date();
		const cutoff = new Date();

		if (range === 'week') {
			cutoff.setDate(now.getDate() - 6);
		} else if (range === 'month') {
			cutoff.setMonth(now.getMonth() - 1);
		} else if (range === 'year') {
			cutoff.setFullYear(now.getFullYear() - 1);
		}

		return cutoff;
	};

	// Format date for display (e.g., "24 Oct")
	const formatLabelDate = (date: Date): string => {
		return date.toLocaleDateString('en-US', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
	};

	const getWeekStart = (date: Date): Date => {
		const d = new Date(date);
		const day = d.getDay();
		const diff = d.getDate() - day;
		const newDate = new Date(d.setDate(diff));
		newDate.setHours(0, 0, 0, 0);
		return newDate;
	};

	const formatKeyDate = (date: Date): string => {
		return date.toLocaleDateString('en-CA');
	};

	// Helper to get the date key for a message (Day or Week start)
	const getDateKey = (msg: TelegramMessage, isWeekly: boolean): string => {
		if (isWeekly) {
			return formatKeyDate(getWeekStart(new Date(msg.date)));
		}
		return msg.date.split('T')[0]; // Daily: YYYY-MM-DD
	};

	// Process data: Filter, Aggregate Total + Top Users
	const processChartData = () => {
		// Determine Time Range Limits
		let minDate: Date;
		let maxDate: Date;
		let isWeekly = false;
		let filteredMsgs: TelegramMessage[] = [];

		if (timeRange === 'all') {
			if (messages.length === 0) return { labels: [], datasets: [] };

			minDate = new Date(messages[0].date);
			maxDate = new Date(messages[0].date);
			filteredMsgs = messages;

			messages.forEach((msg) => {
				const d = new Date(msg.date);
				if (d < minDate) minDate = d;
				if (d > maxDate) maxDate = d;
			});
			isWeekly = true;
		} else {
			const cutoff = getCutoffDate(timeRange);
			minDate = new Date(cutoff);
			maxDate = new Date();

			// Filter messages
			filteredMsgs = messages.filter((msg) => {
				const msgDate = new Date(msg.date);
				return msgDate >= cutoff && msg.type === 'message';
			});
		}

		// 1. Identify Top 3 Users in this range
		const userTotals: Record<string, number> = {};
		filteredMsgs.forEach((msg) => {
			if (msg.type === 'message' && msg.from) {
				userTotals[msg.from] = (userTotals[msg.from] || 0) + 1;
			}
		});

		// Sort users by count and take top 5
		const topUsers = Object.entries(userTotals)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
			.map(([name]) => name);

		// 2. Aggregate Data by Date (or Week)
		// Structure: Map<DateString, DateBucket>
		const dataMap = new Map<string, DateBucket>();

		filteredMsgs.forEach((msg) => {
			if (msg.type !== 'message') return;

			const key = getDateKey(msg, isWeekly);

			if (!dataMap.has(key)) {
				dataMap.set(key, { total: 0, userCounts: {} });
			}

			const bucket = dataMap.get(key)!;
			bucket.total += 1;

			if (msg.from) {
				bucket.userCounts[msg.from] = (bucket.userCounts[msg.from] || 0) + 1;
			}
		});

		// 3. Generate Labels and Fill Arrays (Handle continuity)
		const labels: string[] = [];
		// Dataset arrays
		const totalData: number[] = [];
		// Arrays for top users
		const userData: Record<string, number[]> = {};
		topUsers.forEach((user) => (userData[user] = []));

		// Loop variables
		let current = new Date(minDate);
		current.setHours(0, 0, 0, 0);

		const end = new Date(maxDate);
		end.setHours(0, 0, 0, 0);

		// Helper to advance time
		const advanceTime = (d: Date) => {
			if (isWeekly) {
				d.setDate(d.getDate() + 7);
			} else {
				d.setDate(d.getDate() + 1);
			}
		};

		while (current <= end) {
			const key = isWeekly ? formatKeyDate(getWeekStart(current)) : formatKeyDate(current);
			const bucket = dataMap.get(key);

			labels.push(formatLabelDate(current));
			totalData.push(bucket ? bucket.total : 0);

			// Push data for each top user (0 if not present in bucket)
			topUsers.forEach((user) => {
				userData[user].push(bucket?.userCounts[user] || 0);
			});

			advanceTime(current);
		}

		// 4. Construct Datasets for Chart.js
		const datasets = [
			// Total Dataset (Thicker, filled, primary color)
			{
				label: 'Total Messages',
				data: totalData,
				borderColor: COLORS[0],
				borderWidth: 2.5,
				pointRadius: 0,
				pointHoverRadius: 6,
				order: 0, // Draw on top
			},
			// Top Users Datasets (Thinner, dashed, distinct colors)
			...topUsers.map((userName, index) => ({
				label: userName,
				data: userData[userName],
				borderColor: COLORS[index + 1] || COLORS[0],
				borderWidth: 2,
				pointRadius: 0,
				pointHoverRadius: 5,
				order: index + 1,
			})),
		];

		return { labels, datasets, topUsers };
	};

	// Chart configuration
	useEffect(() => {
		if (!canvasRef.current) return;

		if (chartInstance.current) {
			chartInstance.current.destroy();
		}

		const { labels, datasets } = processChartData();
		const hasData = labels.length > 0;

		if (!hasData) return;

		const isAllTime = timeRange === 'all';

		const config: ChartConfiguration = {
			type: 'line',
			data: {
				labels,
				datasets,
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: 'index',
					intersect: false,
				},
				scales: {
					y: {
						beginAtZero: true,
						grid: {
							color: '#f0f0f0',
						},
						ticks: {
							font: { family: "'Segoe UI', sans-serif" },
							precision: 0,
						},
					},
					x: {
						grid: {
							display: false,
						},
						ticks: {
							font: { family: "'Segoe UI', sans-serif" },
							autoSkip: true,
							maxTicksLimit: isAllTime ? 12 : undefined,
						},
					},
				},
				plugins: {
					legend: {
						display: true, // Enable legend for multiple lines
						position: 'bottom',
						labels: {
							usePointStyle: true,
							boxWidth: 8,
							font: { family: "'Segoe UI', sans-serif", size: 16 },
							filter: (item) => item.text !== 'Total Messages' || !isAllTime,
							// Optional: Keep Total in legend always? Let's keep it.
						},
					},
					tooltip: {
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						padding: 12,
						cornerRadius: 4,
						titleFont: { size: 14, family: "'Segoe UI', sans-serif" },
						bodyFont: { size: 13, family: "'Segoe UI', sans-serif" },
						displayColors: true,
						callbacks: {
							title: (tooltipItems) => {
								return isAllTime
									? `Week of: ${tooltipItems[0].label}`
									: `Date: ${tooltipItems[0].label}`;
							},
						},
					},
				},
			},
		};

		chartInstance.current = new Chart(canvasRef.current, config);

		return () => {
			if (chartInstance.current) {
				chartInstance.current.destroy();
				chartInstance.current = null;
			}
		};
	}, [messages, timeRange]);

	// Handle window resize
	useEffect(() => {
		const handleResize = () => {
			if (chartInstance.current) {
				chartInstance.current.resize();
			}
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const handleRangeChange = (newRange: TimeRange) => {
		setTimeRange(newRange);
	};

	// Calculate Total from the processed data (Dataset 0 is always Total)
	const { datasets, labels } = processChartData();
	const totalMessagesInRange =
		datasets.length > 0 && datasets[0].data
			? (datasets[0].data as number[]).reduce((acc, curr) => acc + curr, 0)
			: 0;

	const getTitle = (timeRange: string) => {
		if (timeRange === 'all') return 'All Time';
		return timeRange.charAt(0).toUpperCase() + timeRange.slice(1);
	};

	const isWide = timeRange === 'month' || timeRange === 'all';
	const cardWidthClass = isWide ? styles.wideCard : '';

	return (
		<DsCard padding="lg" shadow="sm" className={`${className} ${cardWidthClass}`}>
			{/* Header */}
			<div className={styles.header}>
				<h3 className={styles.title}>Message Activity</h3>

				<div className={styles.controls}>
					{(['week', 'month', 'year', 'all'] as TimeRange[]).map((range) => (
						<button
							key={range}
							onClick={() => handleRangeChange(range)}
							className={`${styles.rangeButton} ${
								timeRange === range ? styles.rangeButtonActive : ''
							}`}
						>
							{range === 'all' ? 'All Time' : getTitle(range)}
						</button>
					))}
				</div>
			</div>

			{/* Summary Stats */}
			<div className={styles.summary}>
				<DsTag variant="default">
					{timeRange === 'all' ? 'Full History' : `Timeframe: ${timeRange}`}
				</DsTag>
				<DsTag variant="accent">Total: {totalMessagesInRange.toLocaleString()}</DsTag>
			</div>

			{/* Chart Area */}
			<div className={styles.chartWrapper}>
				{labels.length === 0 ? (
					<div className={styles.emptyState}>
						<p>No messages found in the selected time range.</p>
					</div>
				) : (
					<div className={styles.canvasContainer}>
						<canvas
							ref={canvasRef}
							width={1000}
							aria-label={`Line chart showing message trends ${timeRange === 'all' ? 'per week' : 'per day'} for ${timeRange}`}
						/>
					</div>
				)}
			</div>
		</DsCard>
	);
}
