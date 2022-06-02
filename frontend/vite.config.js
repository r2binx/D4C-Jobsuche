import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import Pages from "vite-plugin-pages";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import Inspect from "vite-plugin-inspect";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue({ reactivityTransform: true }),
		Inspect(),
		AutoImport({
			imports: ["vue", "vue-router", "vue/macros", "@vueuse/core"],
			dirs: ["src/composables"],
			dts: true,
			resolvers: [NaiveUiResolver()],
			vueTemplate: true,
			eslintrc: {
				enabled: true,
			},
		}),
		Components({
			dts: true,
			resolvers: [NaiveUiResolver()],
		}),
		Pages({
			dirs: "src/views",
		}),
	],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
});
