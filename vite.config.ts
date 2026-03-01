import path, { resolve } from "node:path";
import logPlugin from "@izumiano/vite-plugin-logger";
import { biomePlugin } from "@pbr1111/vite-plugin-biome";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const { VITE_TRACE, VITE_DO_SERVER_LOG, VITE_LOG_URL } = loadEnv(
		mode,
		path.resolve(__dirname),
	);

	const isVitest = !!process.env.VITEST;

	return {
		plugins: [
			!isVitest ? biomePlugin() : undefined,
			!isVitest
				? logPlugin({
						mode,
						traceEnabled: VITE_TRACE === "true",
						doServerLog: VITE_DO_SERVER_LOG === "true",
						logUrl: VITE_LOG_URL,
					})
				: undefined,
		],
		base: "/celesteStats/",
		build: {
			rollupOptions: {
				input: {
					main: resolve(__dirname, "index.html"),
					resetStats: resolve(__dirname, "resetStats/index.html"),
				},
				output: {
					// ==For GitHub Pages==
					entryFileNames: `[name].js`,
					chunkFileNames: `[name]-[hash].js`,
					assetFileNames: `[name]-[hash][extname]`,
					// ====================
				},
			},
		},
	};
});
