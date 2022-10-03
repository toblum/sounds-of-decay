import packageJson from "./package.json" assert { type: 'json' };
import { replaceCodePlugin } from "vite-plugin-replace";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		replaceCodePlugin({
			replacements: [{
				from: "__CLI_NAME__",
				to: packageJson.name,
			},
			{
				from: /__CLI_VERSION__/g,
				to: packageJson.version,
			},
			{
				from: /__CLI_TS__/g,
				to: (new Date()).toLocaleString(),
			}]
		})
	]
});