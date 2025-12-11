import { useRef, useEffect } from 'preact/hooks';
import Chart, { ChartConfiguration } from 'chart.js/auto';
import { COLORS } from '../utils/constants';

interface StatsChartProps {
	chartObject: Record<string, number>;
	chartType: string;
	totalStat: number;
	colors?: string[];
}

export default function StatsChart({ chartObject, chartType, totalStat }: StatsChartProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const chartInstance = useRef<Chart | null>(null);

	// Format the chart title (capitalize first letter)
	const formatChartTitle = (str: string): string => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};

	// Prepare chart data from the chartObject
	const prepareChartData = () => {
		const labels: string[] = [];
		const dataValues: number[] = [];
		const backgroundColors: string[] = [];

		// Convert chartObject to arrays for Chart.js
		Object.entries(chartObject).forEach(([label, value], index) => {
			labels.push(label);

			// Calculate percentage if totalStat > 0
			const percentageValue =
				totalStat > 0 ? parseFloat(((value * 100) / totalStat).toFixed(2)) : 0;
			dataValues.push(percentageValue);

			// Assign color (cycle through colors array)
			backgroundColors.push(COLORS[index % COLORS.length]);
		});

		return { labels, dataValues, backgroundColors };
	};

	// Create and configure the chart
	useEffect(() => {
		if (!canvasRef.current) return;

		// Destroy previous chart instance if exists
		if (chartInstance.current) {
			chartInstance.current.destroy();
		}

		const { labels, dataValues, backgroundColors } = prepareChartData();

		// Chart.js configuration
		const chartConfig: ChartConfiguration = {
			type: 'pie',
			data: {
				labels,
				datasets: [
					{
						data: dataValues,
						backgroundColor: backgroundColors,
						borderWidth: 0.5,
						borderColor: '#ddd',
						hoverOffset: 15,
						hoverBorderColor: '#fff',
						hoverBorderWidth: 2,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: true,
				plugins: {
					title: {
						display: true,
						text: formatChartTitle(chartType),
						position: 'top',
						font: {
							size: 24,
							family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
							weight: 'bold',
						},
						color: '#111',
						padding: {
							top: 10,
							bottom: 30,
						},
					},
					legend: {
						display: labels.length <= 10, // Hide legend if too many items
						position: 'bottom',
						align: 'center',
						labels: {
							boxWidth: 20,
							color: '#111',
							padding: 15,
							font: {
								size: 14,
								family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
							},
							usePointStyle: true,
							pointStyle: 'circle',
						},
					},
					tooltip: {
						enabled: true,
						backgroundColor: 'rgba(0, 0, 0, 0.7)',
						titleFont: {
							size: 14,
							family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
						},
						bodyFont: {
							size: 14,
							family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
						},
						padding: 12,
						cornerRadius: 6,
						displayColors: true,
						callbacks: {
							label: (context) => {
								const label = context.label || '';
								const value = context.raw as number;
								const absoluteValue = chartObject[label];

								return [
									`${label}:`,
									`${value.toFixed(2)}% of total`,
									`(${absoluteValue.toLocaleString()} ${chartType})`,
								];
							},
							footer: (tooltipItems) => {
								if (tooltipItems.length > 0) {
									const total = tooltipItems.reduce(
										(sum, item) => sum + (item.raw as number),
										0
									);
									return `Total: ${total.toFixed(2)}%`;
								}
								return '';
							},
						},
					},
				},
			},
		};

		// Create new chart instance
		chartInstance.current = new Chart(canvasRef.current, chartConfig);

		// Cleanup function
		return () => {
			if (chartInstance.current) {
				chartInstance.current.destroy();
				chartInstance.current = null;
			}
		};
	}, [chartObject, chartType, totalStat]);

	// Handle window resize for better responsiveness
	useEffect(() => {
		const handleResize = () => {
			if (chartInstance.current) {
				chartInstance.current.resize();
			}
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Helper to check if chart has data
	const hasData = Object.keys(chartObject).length > 0 && totalStat > 0;

	return (
		<div className="chart-wrapper">
			{!hasData ? (
				<div className="chart-placeholder">
					<p>No {chartType} data available for visualization</p>
				</div>
			) : (
				<>
					<div className="chart-header">
						<h3>{formatChartTitle(chartType)} Distribution</h3>
						<div className="chart-summary">
							<span className="participants-count">
								{Object.keys(chartObject).length} participants
							</span>
							<span className="total-count">
								{totalStat.toLocaleString()} {chartType}
							</span>
						</div>
					</div>
					<div className="chart-container">
						<canvas
							ref={canvasRef}
							className={`${chartType.toLowerCase().replace(/\s+/g, '-')}-chart`}
							aria-label={`Pie chart showing distribution of ${chartType} among participants`}
							role="img"
						/>
					</div>
					{Object.keys(chartObject).length > 10 && (
						<div className="chart-note">
							<small>
								<i>
									Legend hidden due to large number of participants. Hover over
									chart segments to see details.
								</i>
							</small>
						</div>
					)}
				</>
			)}
		</div>
	);
}
