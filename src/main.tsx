import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

if (import.meta.env.DEV) {
	const matches = window.location.href.match(
		/\?console(?:=(?<config>show|hide))?/,
	);
	if (matches) {
		import("eruda").then((_eruda) => {
			const eruda = _eruda.default;
			eruda.init();

			if (matches.groups?.config === "show") {
				eruda.show();
			}
		});
	}
}

// biome-ignore lint/style/noNonNullAssertion: <root will always exist>
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
