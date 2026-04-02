import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import importX from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import { fixupConfigRules } from "@eslint/compat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
	resolvePluginsRelativeTo: __dirname,
});

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
	{
		ignores: [".next/**", "dist/**", "node_modules/**", "debug-eslint*.js"],
	},
	js.configs.recommended,
	// Next.js standard rules (fixed up for Flat Config compatibility)
	...fixupConfigRules(compat.extends("next/core-web-vitals", "next/typescript")),
	
	// Accessibility Rules (Automated via recommended flat config)
	{
		plugins: {
			"jsx-a11y": jsxA11y,
		},
		rules: {
			...jsxA11y.configs.recommended.rules,
		},
	},

	// Advanced Import Sorting & Management
	{
		plugins: {
			"import-x": importX,
		},
		rules: {
			"import-x/order": [
				"error",
				{
					groups: [
						"builtin",     // Node.js (fs, path, etc.)
						"external",    // Packages (react, next, etc.)
						"internal",    // Aliases (@/**)
						["parent", "sibling", "index"], // Relative paths
					],
					pathGroups: [
						{
							pattern: "@/**",
							group: "internal",
							position: "before",
						},
					],
					pathGroupsExcludedImportTypes: ["builtin"],
					"newlines-between": "always",
					alphabetize: {
						order: "asc",
						caseInsensitive: true,
					},
				},
			],
			"import-x/no-duplicates": "error",
			"import-x/no-mutable-exports": "error",
		},
	},

	// Custom Overrides & Modern Standard
	{
		rules: {
			"@typescript-eslint/no-unused-vars": "warn",
			"@typescript-eslint/no-explicit-any": "off",
			"react/react-in-jsx-scope": "off",
			"react/prop-types": "off",
		},
	},

	// Biome Conflict Resolution (must be last)
	prettier,
];

export default eslintConfig;
