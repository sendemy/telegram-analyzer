import Chart, { ChartConfiguration } from 'chart.js/auto';
import { useEffect, useRef } from 'preact/hooks';
import type { DailySentiment } from '../../types/telegram';
import DsCard from '../ui/DsCard';
import styles from './SentimentChart.module.scss';

interface SentimentChartProps {
	data: DailySentiment[];
	className?: string;
}

export default function SentimentChart({ data, className }: SentimentChartProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const chartInstance = useRef<Chart | null>(null);

	useEffect(() => {
		if (!canvasRef.current || data.length === 0) return;

		// Destroy previous chart
		if (chartInstance.current) {
			chartInstance.current.destroy();
		}

		const labels = data.map((d) => {
			const date = new Date(d.date);
			return date.toLocaleDateString('en-US', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
			});
		});

		const scores = data.map((d) => Number(d.comparative.toFixed(3)));
		const volumes = data.map((d) => d.count);

		// Create gradient fills
		const ctx = canvasRef.current.getContext('2d');
		const positiveGradient = ctx?.createLinearGradient(0, 0, 0, 400);
		if (positiveGradient) {
			positiveGradient.addColorStop(0, 'rgba(39, 174, 96, 0.3)');
			positiveGradient.addColorStop(1, 'rgba(39, 174, 96, 0.0)');
		}

		const negativeGradient = ctx?.createLinearGradient(0, 0, 0, 400);
		if (negativeGradient) {
			negativeGradient.addColorStop(0, 'rgba(231, 76, 60, 0.3)');
			negativeGradient.addColorStop(1, 'rgba(231, 76, 60, 0.0)');
		}

		const chartConfig: ChartConfiguration = {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: 'Sentiment Score',
						data: scores,
						borderColor: '#2b5797',
						backgroundColor: positiveGradient || 'rgba(43, 87, 151, 0.1)',
						borderWidth: 3,
						pointRadius: 4,
						pointHoverRadius: 8,
						pointBackgroundColor: scores.map((s) => (s >= 0 ? '#27ae60' : '#e74c3c')),
						pointBorderColor: '#fff',
						pointBorderWidth: 2,
						tension: 0.3,
						fill: true,
						order: 0,
					},
					{
						label: 'Message Volume',
						data: volumes,
						borderColor: 'rgba(107, 114, 128, 0.3)',
						backgroundColor: 'rgba(107, 114, 128, 0.05)',
						borderWidth: 1,
						borderDash: [4, 4],
						pointRadius: 0,
						pointHoverRadius: 0,
						yAxisID: 'y1',
						order: 1,
						fill: false,
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
							pointStyle: 'circle',
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
								const label = context.dataset.label || '';
								const value = context.raw as number;
								if (context.dataset.yAxisID === 'y1') {
									return `${label}: ${value} messages`;
								}
								return `${label}: ${value.toFixed(3)}`;
							},
						},
					},
				},
				scales: {
					x: {
						grid: {
							display: false,
						},
						ticks: {
							maxTicksLimit: 10,
							font: {
								size: 11,
							},
						},
					},
					y: {
						position: 'left',
						grid: {
							color: 'rgba(0, 0, 0, 0.06)',
						},
						ticks: {
							font: {
								size: 11,
							},
						},
						title: {
							display: true,
							text: 'Sentiment Score',
							font: {
								size: 12,
								weight: 500,
							},
						},
					},
					y1: {
						position: 'right',
						grid: {
							display: false,
						},
						ticks: {
							font: {
								size: 11,
							},
						},
						title: {
							display: true,
							text: 'Messages',
							font: {
								size: 12,
								weight: 500,
							},
						},
					},
				},
			},
		};

		chartInstance.current = new Chart(canvasRef.current, chartConfig);

		return () => {
			if (chartInstance.current) {
				chartInstance.current.destroy();
				chartInstance.current = null;
			}
		};
	}, [data]);

	// Window resize handler
	useEffect(() => {
		const handleResize = () => {
			if (chartInstance.current) {
				chartInstance.current.resize();
			}
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	if (data.length === 0) {
		return (
			<DsCard padding="lg" shadow="sm" fullWidth className={className}>
				<div className={styles.emptyState}>
					<p>No sentiment data available for timeline</p>
				</div>
			</DsCard>
		);
	}

	// Calculate summary stats
	const avgSentiment = data.reduce((sum, d) => sum + d.comparative, 0) / data.length;
	const mostPositive = Math.max(...data.map((d) => d.comparative));
	const mostNegative = Math.min(...data.map((d) => d.comparative));

	return (
		<DsCard padding="lg" shadow="sm" fullWidth className={className}>
			<div className={styles.header}>
				<h3 className={styles.title}>Mood Timeline</h3>
				<div className={styles.summary}>
					<span className={styles.summaryItem}>
						Avg: <strong className={styles.boldText}>{avgSentiment.toFixed(3)}</strong>
					</span>
					<span className={styles.summaryItem}>
						Peak:{' '}
						<strong className={`${styles.boldText} ${styles.positive}`}>
							+{mostPositive.toFixed(3)}
						</strong>
					</span>
					<span className={styles.summaryItem}>
						Low:{' '}
						<strong className={`${styles.boldText} ${styles.negative}`}>
							{mostNegative.toFixed(3)}
						</strong>
					</span>
					<span className={styles.summaryItem}>
						Days: <strong className={styles.boldText}>{data.length}</strong>
					</span>
				</div>
			</div>
			<div className={styles.chartWrapper}>
				<canvas ref={canvasRef} aria-label="Sentiment over time line chart" role="img" />
			</div>
			<p className={styles.note}>
				Above zero = positive mood, below zero = negative mood. Dotted line shows message
				volume.
			</p>
		</DsCard>
	);
}
