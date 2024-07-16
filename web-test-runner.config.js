import { defaultReporter, summaryReporter } from "@web/test-runner";
import { playwrightLauncher } from "@web/test-runner-playwright";

export default {
	files: ["./**/*.test.js"],
	concurrency: 10,
	nodeResolve: true,
	coverage: true,
	testFramework: {
		config: {
			timeout: 1000,
			ui: "tdd",
			reporter: "landing",
		},
	},
	reporters: [summaryReporter({}), defaultReporter()],
	browsers: [
		playwrightLauncher({ product: "firefox" }),
		playwrightLauncher({ product: "chromium" }),
	],
};
