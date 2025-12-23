import { useRef, useEffect, useState } from 'preact/hooks';
import Chart, { ChartConfiguration } from 'chart.js/auto';
import { TelegramMessage } from '../../types/telegram';
import { COLORS } from '../../utils/constants';
import DsCard from '../ui/DsCard';
import DsTag from '../ui/DsTag';
import styles from './MessageTimelineChart.module.scss';

type TimeRange = 'week' | 'month' | 'year';

interface MessageTimelineChartProps {
	messages: TelegramMessage[];
	className?: string;
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
	const formatLabelDate = (dateString: string): string => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
	};

	// Process data: Filter by time range and group by date
	const processChartData = () => {
		const cutoff = getCutoffDate(timeRange);

		// 1. Filter messages
		const filteredMsgs = messages.filter((msg) => {
			const msgDate = new Date(msg.date);
			return msgDate >= cutoff && msg.type === 'message';
		});

		// 2. Group by day (ignoring time, keeping only date string)
		const groupedData: Record<string, number> = {};

		filteredMsgs.forEach((msg) => {
			// msg.date is usually "YYYY-MM-DDTHH:mm:ss"
			const dayKey = msg.date.split('T')[0];
			groupedData[dayKey] = (groupedData[dayKey] || 0) + 1;
		});

		// 3. Initialize days to ensure continuity (New Logic)
		const labels: string[] = [];
		const data: number[] = [];

		// Normalize start and end dates to midnight to avoid timezone issues
		const start = new Date(cutoff);
		start.setHours(0, 0, 0, 0);

		const end = new Date();
		end.setHours(0, 0, 0, 0);

		// Loop through every day from start to end
		for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
			// Format date key to match "YYYY-MM-DD"
			const year = d.getFullYear();
			const month = String(d.getMonth() + 1).padStart(2, '0');
			const day = String(d.getDate()).padStart(2, '0');
			const dateKey = `${year}-${month}-${day}`;

			// Add the label for the X-axis
			labels.push(formatLabelDate(dateKey));

			// Add the data point: use the count from groupedData, or 0 if no messages that day
			data.push(groupedData[dateKey] || 0);
		}

		return {
			labels,
			data,
		};
	};

	// Chart configuration
	useEffect(() => {
		if (!canvasRef.current) return;

		if (chartInstance.current) {
			chartInstance.current.destroy();
		}

		const { labels, data } = processChartData();
		const hasData = data.length > 0;

		if (!hasData) return;

		const config: ChartConfiguration = {
			type: 'bar',
			data: {
				labels,
				datasets: [
					{
						label: 'Messages',
						data,
						backgroundColor: COLORS[0], // Use primary color
						borderRadius: 4,
						hoverBackgroundColor: '#8f0f31',
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
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
						},
					},
				},
				plugins: {
					legend: {
						display: false,
					},
					tooltip: {
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						padding: 12,
						cornerRadius: 6,
						titleFont: { size: 14, family: "'Segoe UI', sans-serif" },
						bodyFont: { size: 14, family: "'Segoe UI', sans-serif" },
						displayColors: false,
						callbacks: {
							title: (tooltipItems) => {
								return `Date: ${tooltipItems[0].label}`;
							},
							label: (context) => {
								return `Messages: ${context.raw}`;
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

	const { labels, data } = processChartData();
	const totalMessagesInRange = data.reduce((acc, curr) => acc + curr, 0);

	return (
		<DsCard padding="lg" shadow="sm" className={className}>
			{/* Header */}
			<div className={styles.header}>
				<h3 className={styles.title}>Message Activity</h3>

				<div className={styles.controls}>
					{(['week', 'month', 'year'] as TimeRange[]).map((range) => (
						<button
							key={range}
							onClick={() => handleRangeChange(range)}
							className={`${styles.rangeButton} ${
								timeRange === range ? styles.rangeButtonActive : ''
							}`}
						>
							{range.charAt(0).toUpperCase() + range.slice(1)}
						</button>
					))}
				</div>
			</div>

			{/* Summary Stats */}
			<div className={styles.summary}>
				<DsTag variant="default">Timeframe: {timeRange}</DsTag>
				<DsTag variant="accent">Total: {totalMessagesInRange.toLocaleString()}</DsTag>
			</div>

			{/* Chart Area */}
			<div className={styles.chartWrapper}>
				{data.length === 0 ? (
					<div className={styles.emptyState}>
						<p>No messages found in the selected time range.</p>
					</div>
				) : (
					<div className={styles.canvasContainer}>
						<canvas
							ref={canvasRef}
							width={1000}
							aria-label={`Bar chart showing messages per day for the past ${timeRange}`}
						/>
					</div>
				)}
			</div>
		</DsCard>
	);
}
