import { _capitalize } from 'chart.js/helpers';

export function capitalize(str: string): string {
	return _capitalize(str);
}

export function isNumeric(str: string) {
	return !isNaN(parseInt(str)) && !isNaN(parseFloat(str));
}
