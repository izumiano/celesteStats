import { useCelesteStats } from "../shared/celesteStatsContext";
import { useEffect, useState } from "react";
import type { NodeStats } from "../statsPage/nodeTypes";
import SingleNode from "./singleNode";

export interface GoldBerriesChapter {
	id: number;
	name: string;
	campaign: { id: number; name: string; url: string };
}

export default function MapPage() {
	const { saveData } = useCelesteStats();
	const [node, setNode] = useState<NodeStats | null>(null);
	const [gbChapter, setGbChapter] = useState<GoldBerriesChapter | null>(null);

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
	}, [saveData.levelSetStats]);

	return (
		<>
			{node && (
				<SingleNode
					node={node}
					id={""}
					statType={"current"}
					searchQuery={""}
					goldBerriesChapter={gbChapter}
				/>
			)}
		</>
	);
}
