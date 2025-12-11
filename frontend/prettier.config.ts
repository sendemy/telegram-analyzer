import { type Config } from 'prettier';

const config: Config = {
	useTabs: true,
	tabWidth: 4,
	bracketSpacing: true,
	trailingComma: 'es5',
	arrowParens: 'always',
	singleQuote: true,
	semi: true,
	printWidth: 100,
	ignorePath: '.prettierignore',
};

export default config;
