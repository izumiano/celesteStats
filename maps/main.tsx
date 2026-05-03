import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../src/index.css";
import MapsPage from "../src/mapsPage";
import { addEruda } from "../src/utils";

addEruda();

// biome-ignore lint/style/noNonNullAssertion: <root will always exist>
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<MapsPage />
	</StrictMode>,
);
