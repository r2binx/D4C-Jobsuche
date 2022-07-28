module.exports = {
	parser: "vue-eslint-parser",
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	env: {
		browser: true,
		node: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:vue/vue3-recommended",
		"./.eslintrc-auto-import.json",
		"prettier",
	],
	ignorePatterns: ["**/*.ts"],
};
