import Chart, { ChartConfiguration } from 'chart.js/auto';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { TelegramMessage } from '../../types/telegram';
import { computePredictiveInsights } from '../../utils/predictive';
import DsCard from '../ui/DsCard';
import styles from './PredictiveChart.module.scss';

type ProjectionHorizon = 30 | 180 | 365;

interface PredictiveChartProps {
	messages: TelegramMessage[];
	nicknames: string[];
	className?: string;
}

export default function PredictiveChart({ messages, nicknames, className }: PredictiveChartProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const chartInstance = useRef<Chart | null>(null);
	const [horizon, setHorizon] = useState<ProjectionHorizon>(180);

	const insights = useMemo(
		() => computePredictiveInsights(messages, nicknames),
		[messages, nicknames]
	);

	// Chart rendering
	useEffect(() => {
		if (!canvasRef.current || insights.historicalCumulative.length === 0) return;

		if (chartInstance.current) {
			chartInstance.current.destroy();
		}

		// Prepare data
		const histData = insights.historicalCumulative;
		const projData = insights.projectedCumulative.slice(0, horizon);

		// Combine labels: all historical dates + projected dates
		const allLabels = [
			...histData.map((d) => {
				const dt = new Date(d.date);
				return dt.toLocaleDateString('en-US', {
					day: 'numeric',
					month: 'short',
					year: 'numeric',
				});
			}),
			...projData.map((d) => {
				const dt = new Date(d.date);
				return dt.toLocaleDateString('en-US', {
					day: 'numeric',
					month: 'short',
					year: 'numeric',
				});
			}),
		];

		// Historical values (projection area is null for known, vice versa)
		const histValues = [...histData.map((d) => d.count), ...projData.map(() => null)];

		const projValues = [...histData.map(() => null), ...projData.map((d) => d.count)];

		// Continuous line (history + projection)
		const continuousValues = [...histData.map((d) => d.count), ...projData.map((d) => d.count)];

		// Find where projection starts for vertical separator
		const splitIndex = histData.length;

		const chartConfig: ChartConfiguration = {
			type: 'line',
			data: {
				labels: allLabels,
				datasets: [
					{
						label: 'Actual Messages',
						data: histValues,
						borderColor: '#2b5797',
						backgroundColor: 'rgba(43, 87, 151, 0.08)',
						borderWidth: 2.5,
						pointRadius: 0,
						pointHoverRadius: 5,
						fill: false,
						spanGaps: false,
						order: 0,
					},
					{
						label: 'Projected Trend',
						data: projValues,
						borderColor: '#27ae60',
						backgroundColor: 'rgba(39, 174, 96, 0.08)',
						borderWidth: 2.5,
						borderDash: [6, 4],
						pointRadius: 0,
						pointHoverRadius: 5,
						fill: false,
						spanGaps: true,
						order: 1,
					},
					{
						label: 'Cumulative Total',
						data: continuousValues,
						borderColor: 'transparent',
						backgroundColor: 'rgba(43, 87, 151, 0.04)',
						borderWidth: 0,
						pointRadius: 0,
						fill: true,
						order: 2,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: 'index',
					intersect: false,
				},
				plugins: {
					legend: {
						display: true,
						position: 'top',
						labels: {
							boxWidth: 16,
							padding: 15,
							usePointStyle: true,
							pointStyle: 'line',
							font: {
								size: 12,
								family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
							},
						},
					},
					tooltip: {
						enabled: true,
						backgroundColor: 'rgba(0, 0, 0, 0.7)',
						padding: 12,
						cornerRadius: 6,
						callbacks: {
							label: (context) => {
								const value = context.raw;
								if (value === null) return null;
								const isProjected =
									context.dataset.label === 'Projected Trend' ||
									(context.dataIndex >= splitIndex &&
										context.dataset.label === 'Cumulative Total');
								const label = isProjected ? '(projected)' : '';
								return `${context.dataset.label}: ${(value as number).toLocaleString()} ${label}`;
							},
						},
					},
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: {
							maxTicksLimit: 8,
							font: { size: 10 },
						},
					},
					y: {
						beginAtZero: true,
						grid: { color: 'rgba(0, 0, 0, 0.06)' },
						ticks: {
							font: { size: 11 },
							callback: (value) => (value as number).toLocaleString(),
						},
						title: {
							display: true,
							text: 'Cumulative Messages',
							font: { size: 12, weight: 500 },
						},
					},
				},
			},
			plugins: [
				{
					id: 'verticalLine',
					afterDraw(chart) {
						if (splitIndex >= chart.data.labels!.length) return;
						const meta = chart.getDatasetMeta(0);
						const x = meta.data[splitIndex - 1]?.x;
						if (!x) return;
						const ctx = chart.ctx;
						ctx.save();
						ctx.beginPath();
						ctx.setLineDash([4, 4]);
						ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
						ctx.lineWidth = 1;
						ctx.moveTo(x, chart.chartArea.top);
						ctx.lineTo(x, chart.chartArea.bottom);
						ctx.stroke();
						ctx.restore();
					},
				},
			],
		};

		chartInstance.current = new Chart(canvasRef.current, chartConfig);

		return () => {
			if (chartInstance.current) {
				chartInstance.current.destroy();
				chartInstance.current = null;
			}
		};
	}, [insights, horizon]);

	// Window resize
	useEffect(() => {
		const handleResize = () => chartInstance.current?.resize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	if (insights.historicalCumulative.length === 0) {
		return (
			<DsCard padding="lg" shadow="sm" fullWidth className={className}>
				<div className={styles.emptyState}>
					<p>Not enough data for predictive analysis</p>
				</div>
			</DsCard>
		);
	}

	// Format helpers
	const formatConfidence = (c: 'high' | 'medium' | 'low') => {
		switch (c) {
			case 'high':
				return '🟢';
			case 'medium':
				return '🟡';
			case 'low':
				return '🔴';
		}
	};

	const changeEmoji = (pct: number) => {
		if (pct > 20) return '📈';
		if (pct > 5) return '↗️';
		if (pct < -20) return '📉';
		if (pct < -5) return '↘️';
		return '➡️';
	};

	return (
		<DsCard padding="lg" shadow="md" fullWidth className={className}>
			{/* Chart */}
			<div className={styles.chartHeader}>
				<h3 className={styles.chartTitle}>Message Growth Forecast</h3>
				<div className={styles.horizonControls}>
					<button
						className={`${styles.horizonBtn} ${horizon === 30 ? styles.horizonActive : ''}`}
						onClick={() => setHorizon(30)}
					>
						1mo
					</button>
					<button
						className={`${styles.horizonBtn} ${horizon === 180 ? styles.horizonActive : ''}`}
						onClick={() => setHorizon(180)}
					>
						6mo
					</button>
					<button
						className={`${styles.horizonBtn} ${horizon === 365 ? styles.horizonActive : ''}`}
						onClick={() => setHorizon(365)}
					>
						1yr
					</button>
				</div>
			</div>
			<div className={styles.chartWrapper}>
				<canvas ref={canvasRef} aria-label="Message growth prediction chart" role="img" />
			</div>

			{/* Stats row */}
			<div className={styles.statsRow}>
				<span className={styles.statItem}>
					Total: <strong>{insights.totalMessages.toLocaleString()}</strong>
				</span>
				<span className={styles.statItem}>
					Growth: <strong>{insights.growthRate.toFixed(1)} msg/day</strong>
				</span>
				<span className={styles.statItem}>
					Fit:{' '}
					<strong>
						{formatConfidence(
							insights.rSquared > 0.8
								? 'high'
								: insights.rSquared > 0.5
									? 'medium'
									: 'low'
						)}{' '}
						{insights.rSquared.toFixed(2)}
					</strong>
				</span>
			</div>

			{/* Milestones */}
			{insights.milestones.some((m) => m.predictedDate) && (
				<div className={styles.section}>
					<h4 className={styles.sectionTitle}>🎯 Milestones</h4>
					<div className={styles.milestones}>
						{insights.milestones
							.filter((m) => m.predictedDate)
							.map((m) => (
								<div key={m.milestone} className={styles.milestoneCard}>
									<span className={styles.milestoneValue}>
										{m.milestone.toLocaleString()}
									</span>
									<span className={styles.milestoneDate}>
										by{' '}
										{new Date(m.predictedDate!).toLocaleDateString('en-US', {
											month: 'short',
											year: 'numeric',
										})}
									</span>
									<span className={styles.milestoneConfidence}>
										{formatConfidence(m.confidence)}
									</span>
								</div>
							))}
					</div>
				</div>
			)}

			{/* Monthly Comparisons */}
			<div className={styles.section}>
				<h4 className={styles.sectionTitle}>📊 Monthly Activity</h4>
				<div className={styles.monthlyGrid}>
					{insights.monthlyComparisons.map((mc) => (
						<div key={mc.nickname} className={styles.monthlyCard}>
							<div className={styles.monthlyHeader}>
								<span className={styles.monthlyName}>{mc.nickname}</span>
								<span
									className={`${styles.monthlyChange} ${mc.changePercent >= 0 ? styles.changePositive : styles.changeNegative}`}
								>
									{changeEmoji(mc.changePercent)}{' '}
									{mc.changePercent > 0 ? '+' : ''}
									{mc.changePercent}%
								</span>
							</div>
							<div className={styles.monthlyDetail}>
								{mc.currentMonthCount.toLocaleString()} this month vs{' '}
								{mc.previousMonthCount.toLocaleString()} last month
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Dead Hours */}
			<div className={styles.section}>
				<h4 className={styles.sectionTitle}>🕐 Chat Activity Pattern</h4>
				<div className={styles.deadHoursGrid}>
					<div className={styles.deadHourCard}>
						<span className={styles.deadHourLabel}>Deadest hours</span>
						<span className={styles.deadHourValue}>
							{insights.deadestHour.label} – {insights.deadHours[1]?.label}
						</span>
						<span className={styles.deadHourNote}>
							~
							{(insights.deadestHour.count + (insights.deadHours[1]?.count || 0)) / 2}{' '}
							avg hourly messages
						</span>
					</div>
					<div className={styles.deadHourCard}>
						<span className={styles.deadHourLabel}>Liveliest hour</span>
						<span className={styles.deadHourValue}>{insights.liveliestHour.label}</span>
						<span className={styles.deadHourNote}>
							{insights.liveliestHour.count.toLocaleString()} messages
						</span>
					</div>
				</div>
			</div>
		</DsCard>
	);
}
