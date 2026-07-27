import type {
	DeadHour,
	MilestonePrediction,
	MonthlyComparison,
	PredictiveInsights,
	TelegramMessage,
} from '../types/telegram';

// ============================================
// Linear Regression
// ============================================

interface RegressionResult {
	slope: number;
	intercept: number;
	rSquared: number;
}

function linearRegression(xs: number[], ys: number[]): RegressionResult {
	const n = xs.length;
	if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 };

	const sumX = xs.reduce((a, b) => a + b, 0);
	const sumY = ys.reduce((a, b) => a + b, 0);
	const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
	const sumX2 = xs.reduce((sum, x) => sum + x * x, 0);
	const sumY2 = ys.reduce((sum, y) => sum + y * y, 0);

	const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
	const intercept = (sumY - slope * sumX) / n;

	// R-squared
	const yMean = sumY / n;
	const ssRes = ys.reduce((sum, y, i) => sum + (y - (slope * xs[i] + intercept)) ** 2, 0);
	const ssTot = ys.reduce((sum, y) => sum + (y - yMean) ** 2, 0);
	const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;

	return { slope, intercept, rSquared: Math.max(0, Math.min(1, rSquared)) };
}

// ============================================
// Growth Prediction
// ============================================

function computeGrowthPrediction(
	messages: TelegramMessage[]
): Pick<
	PredictiveInsights,
	'historicalCumulative' | 'projectedCumulative' | 'milestones' | 'growthRate' | 'rSquared'
> {
	// 1. Sort messages by date
	const sorted = [...messages]
		.filter((m) => m.type === 'message' && m.date)
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	if (sorted.length < 2) {
		return {
			historicalCumulative: [],
			projectedCumulative: [],
			milestones: [],
			growthRate: 0,
			rSquared: 0,
		};
	}

	// 2. Build daily cumulative series
	const dailyCounts: Record<string, number> = {};
	for (const msg of sorted) {
		const day = msg.date.split('T')[0];
		dailyCounts[day] = (dailyCounts[day] || 0) + 1;
	}

	const sortedDates = Object.keys(dailyCounts).sort();
	const firstDate = new Date(sortedDates[0]);

	let cumulative = 0;
	const cumulativeData: { day: number; date: string; count: number }[] = [];

	for (const dateStr of sortedDates) {
		cumulative += dailyCounts[dateStr];
		const dayNum = Math.floor(
			(new Date(dateStr).getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
		);
		cumulativeData.push({ day: dayNum, date: dateStr, count: cumulative });
	}

	const xs = cumulativeData.map((d) => d.day);
	const ys = cumulativeData.map((d) => d.count);
	const reg = linearRegression(xs, ys);

	// 3. Build historical cumulative series
	const historicalCumulative = cumulativeData.map((d) => ({
		date: d.date,
		count: d.count,
	}));

	// 4. Project forward — 1 year from last data point
	// Anchor projection to the last actual value to avoid a jump/discontinuity
	const lastActual = cumulativeData[cumulativeData.length - 1];
	const lastDay = lastActual.day;
	const lastActualCount = lastActual.count;
	const projectionDays = 365;
	const projectedCumulative: { date: string; count: number }[] = [];

	for (let i = 1; i <= projectionDays; i++) {
		const projectedDay = lastDay + i;
		// Use last actual count + slope * days from last (anchored projection)
		const projectedCount = Math.max(0, Math.round(lastActualCount + reg.slope * i));
		const projectedDate = new Date(firstDate);
		projectedDate.setDate(projectedDate.getDate() + projectedDay);
		projectedCumulative.push({
			date: projectedDate.toISOString().split('T')[0],
			count: projectedCount,
		});
	}

	// 5. Compute milestone predictions (anchored to last actual value)
	const milestoneTargets = generateMilestoneTargets(lastActualCount);
	const milestones: MilestonePrediction[] = milestoneTargets.map((target) => {
		if (reg.slope <= 0) {
			return { milestone: target, predictedDate: null, confidence: 'low' };
		}
		// Days from first date to milestone: lastDay + (target - lastActualCount) / slope
		const daysFromLast = (target - lastActualCount) / reg.slope;
		const totalDays = lastDay + Math.ceil(daysFromLast);
		const targetDate = new Date(firstDate);
		targetDate.setDate(targetDate.getDate() + totalDays);

		const now = new Date();
		const isPast = targetDate <= now;
		const farOut = daysFromLast > 365 * 3;

		let confidence: 'high' | 'medium' | 'low';
		if (reg.rSquared > 0.8 && !farOut && !isPast) confidence = 'high';
		else if (reg.rSquared > 0.5 && !farOut) confidence = 'medium';
		else confidence = 'low';

		return {
			milestone: target,
			predictedDate: isPast ? null : targetDate.toISOString().split('T')[0],
			confidence,
		};
	});

	return {
		historicalCumulative,
		projectedCumulative,
		milestones,
		growthRate: Number(reg.slope.toFixed(2)),
		rSquared: Number(reg.rSquared.toFixed(3)),
	};
}

function generateMilestoneTargets(currentTotal: number): number[] {
	// Generate round number milestones beyond current total
	const targets: number[] = [];
	const magnitudes = [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];

	for (const m of magnitudes) {
		if (m > currentTotal && targets.length < 3) {
			targets.push(m);
		}
	}

	// If current is already > 1M, add next million
	if (targets.length === 0) {
		const nextMillion = Math.ceil(currentTotal / 1000000) * 1000000;
		targets.push(nextMillion);
		if (targets.length < 3) targets.push(nextMillion * 2);
		if (targets.length < 3) targets.push(nextMillion * 5);
	}

	return targets.slice(0, 3);
}

// ============================================
// Monthly Comparisons
// ============================================

function computeMonthlyComparisons(
	messages: TelegramMessage[],
	nicknames: string[]
): MonthlyComparison[] {
	const now = new Date();
	const currentYear = now.getFullYear();
	const currentMonth = now.getMonth(); // 0-based

	// Current month: from 1st of this month to now
	const currentMonthStart = new Date(currentYear, currentMonth, 1);
	// Previous month: from 1st of last month to end of last month
	const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
	const prevMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

	return nicknames.map((nickname) => {
		let currentCount = 0;
		let previousCount = 0;

		for (const msg of messages) {
			if (msg.type !== 'message' || msg.from !== nickname || !msg.date) continue;
			const msgDate = new Date(msg.date);
			if (isNaN(msgDate.getTime())) continue;

			if (msgDate >= currentMonthStart && msgDate <= now) {
				currentCount++;
			} else if (msgDate >= prevMonthStart && msgDate <= prevMonthEnd) {
				previousCount++;
			}
		}

		const changePercent =
			previousCount > 0
				? Math.round(((currentCount - previousCount) / previousCount) * 100)
				: currentCount > 0
					? 100
					: 0;

		return {
			nickname,
			currentMonthCount: currentCount,
			previousMonthCount: previousCount,
			changePercent,
		};
	});
}

// ============================================
// Dead Hours
// ============================================

function computeDeadHours(
	messages: TelegramMessage[]
): Pick<PredictiveInsights, 'deadHours' | 'deadestHour' | 'liveliestHour'> {
	const hourCounts: Record<number, number> = {};
	for (let i = 0; i < 24; i++) hourCounts[i] = 0;

	for (const msg of messages) {
		if (msg.type !== 'message' || !msg.date) continue;
		const hour = new Date(msg.date).getHours();
		if (!isNaN(hour)) {
			hourCounts[hour] = (hourCounts[hour] || 0) + 1;
		}
	}

	const deadHours: DeadHour[] = Object.entries(hourCounts)
		.map(([hourStr, count]) => {
			const hour = Number(hourStr);
			const label =
				hour === 0
					? '12 AM'
					: hour < 12
						? `${hour} AM`
						: hour === 12
							? '12 PM'
							: `${hour - 12} PM`;
			return { hour, count, label };
		})
		.sort((a, b) => a.count - b.count);

	const deadestHour = deadHours[0];
	const liveliestHour = deadHours[deadHours.length - 1];

	return { deadHours, deadestHour, liveliestHour };
}

// ============================================
// Main Entry Point
// ============================================

export function computePredictiveInsights(
	messages: TelegramMessage[],
	nicknames: string[]
): PredictiveInsights {
	const textMessages = messages.filter((m) => m.type === 'message');

	const growth = computeGrowthPrediction(textMessages);
	const monthlyComparisons = computeMonthlyComparisons(textMessages, nicknames);
	const dead = computeDeadHours(textMessages);

	return {
		totalMessages: textMessages.length,
		...growth,
		monthlyComparisons,
		...dead,
	};
}
