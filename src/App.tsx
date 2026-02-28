import StatsPage from "./statsPage";
import { ToastContainer } from "react-toastify";

import "./App.css";

export default function App() {
	return (
		<div>
			<StatsPage />
			<ToastContainer position="bottom-left" />
		</div>
	);
}
