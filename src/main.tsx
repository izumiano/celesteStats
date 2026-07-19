import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { addEruda } from "./utils.tsx";
import StatsPage from "./statsPage/index.tsx";

addEruda();

// biome-ignore lint/style/noNonNullAssertion: <root will always exist>
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App>
			<StatsPage />
		</App>
	</StrictMode>,
);
