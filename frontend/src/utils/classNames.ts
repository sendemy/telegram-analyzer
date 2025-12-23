type ClassValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| { [key: string]: boolean }
	| ClassValue[];

/**
 * Conditionally join CSS class names together.
 * Simple utility to handle conditional classes without template literals.
 */
export function cn(...inputs: ClassValue[]): string {
	const classes: string[] = [];

	for (const input of inputs) {
		if (!input) continue;

		if (typeof input === 'string') {
			classes.push(input);
		} else if (typeof input === 'number') {
			classes.push(String(input));
		} else if (Array.isArray(input)) {
			classes.push(cn(...input));
		} else if (typeof input === 'object') {
			for (const key in input) {
				if (input[key]) {
					classes.push(key);
				}
			}
		}
	}

	return classes.join(' ');
}

/**
 * Helper for component variants
 */
export function variant<T extends Record<string, string>>(variants: T) {
	return (selectedVariant: keyof T): string => {
		return variants[selectedVariant];
	};
}

/**
 * Helper for boolean variants
 */
export function booleanVariant(
	condition: boolean,
	trueClass: string,
	falseClass: string = ''
): string {
	return condition ? trueClass : falseClass;
}
