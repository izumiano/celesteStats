import { useCelesteStats } from "../shared/celesteStatsContext";
import { useCallback, useEffect, useState } from "react";
import type { NodeStats } from "../statsPage/nodeTypes";
import FullMapStats from "./fullMapStats";
import ChapterImage from "./chapterImage";

import "./mapPage.css";

export interface GoldBerriesChapter {
	id: number;
	name: string;
	campaign: { id: number; name: string; url: string };
}

export default function MapPage() {
	const { saveData } = useCelesteStats();
	const [node, setNodeState] = useState<NodeStats | null>(null);
	const [gbChapter, setGbChapter] = useState<GoldBerriesChapter | null>(null);

	const setNode = useCallback((node: NodeStats | null) => {
		setNodeState(node);
		document.title = node?.title ?? "Unknown Map";
	}, []);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const path = urlParams.get("path")?.split("/");

		if (!path || !saveData.levelSetStats) {
			window.location.href = "../";
			return;
		}

		let node = saveData.levelSetStats;
		for (const pathSegment of path) {
			const newNode = node.children.find((node) => node.title === pathSegment);
			if (!newNode) {
				break;
			}

			node = newNode;
		}

		const sid = node.sid;

		if (!sid) {
			window.location.href = "../";
			return;
		}

		setNode(node);

		(async () => {
			const response = (await (
				await fetch(
					`https://cors-header-proxy.izumiano.workers.dev/?url=https://goldberries.net/api/map/find-by-bin-path?bin=${encodeURIComponent(sid)}.bin`,
				)
			).json()) as GoldBerriesChapter[];

			if (response.length === 0) {
				return;
			}

			setGbChapter(response[0]);
		})();
	}, [saveData.levelSetStats, setNode]);

	return (
		<>
			{node && (
				<div className="flex column map-page">
					<main>
						<ChapterImage gbChapter={gbChapter} />
						<div className="flex image-overlay">
							<div className="flex title">
								<div className="flex">
									<h2>{node.title}</h2>
									{gbChapter && (
										<div className="mapLinks">
											<a
												href={`https://goldberries.net/map/${gbChapter.id}`}
												target="_blank"
												rel="noopener noreferrer"
												className="flex mapLink"
											>
												<img
													src="https://goldberries.net/favicon-32x32.png"
													alt="goldberries link"
													width={25}
													height={25}
												/>
											</a>
											<a
												href={gbChapter.campaign.url}
												target="_blank"
												rel="noopener noreferrer"
												className="padLeft padRight flex mapLink"
											>
												<img
													src="https://images.gamebanana.com/static/img/favicon/favicon.ico"
													alt="gamebanana link"
													width={25}
													height={25}
												/>
											</a>
										</div>
									)}
								</div>
							</div>
						</div>
						<FullMapStats node={node} />
					</main>
				</div>
			)}
		</>
	);
}
