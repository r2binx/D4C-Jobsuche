module.exports = {
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	env: {
		browser: true,
		node: true,
		"vue/setup-compiler-macros": true,
	},
	extends: [
		"eslint:recommended",
		"plugin:vue/base",
		"plugin:vue/vue3-recommended",
		"./.eslintrc-auto-import.json",
		"prettier",
	],
	rules: {
		"vue/script-setup-uses-vars": "error",
	},
};
