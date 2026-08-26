import { useCelesteStats } from "../shared/celesteStatsContext";
import { Fragment, useCallback, useEffect, useId, useState } from "react";
import type { ModeSpecificStats, NodeStats } from "../statsPage/nodeTypes";
import FullMapStats from "./fullMapStats";
import ChapterImage from "./chapterImage";

import "./mapPage.css";
import { toast } from "react-toastify";
import { trace } from "@izumiano/vite-logger";

export interface GoldBerriesChapter {
	id: number;
	name: string;
	date_added: string;
	author_gb_name: string;
	campaign: { id: number; name: string; url: string; gamebananaId?: number };
}

export interface GamebananaCampaign {
	id?: number;
	url?: string;
}

export default function MapPage() {
	const id = useId();

	const { saveData } = useCelesteStats();
	const [node, setNodeState] = useState<NodeStats | null>(null);
	const [goldberriesChapters, setGoldberriesChapters] = useState<
		GoldBerriesChapter[] | "pending" | null
	>("pending");
	const [gamebananaCampaign, setGamebananaCampaign] = useState<
		GamebananaCampaign | "pending" | null
	>("pending");

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
			setGoldberriesChapters("pending");
			const response = await fetch(
				`https://cors-header-proxy.izumiano.workers.dev/?url=https://goldberries.net/api/map/find-by-bin-path?bin=${encodeURIComponent(sid)}.bin`,
			);
			if (!response.ok) {
				setGoldberriesChapters(null);
				return;
			}

			const chapters = (await response.json()) as GoldBerriesChapter[];

			if (chapters.length === 0) {
				setGoldberriesChapters(null);
				return;
			}

			for (const chapter of chapters) {
				const gamebananaMatch = chapter.campaign.url.match(
					/gamebanana\.com\/mods\/(\d+)/,
				);
				if (gamebananaMatch?.[1]) {
					const gamebananaId = parseInt(gamebananaMatch[1]);
					chapter.campaign.gamebananaId = Number.isNaN(gamebananaId)
						? undefined
						: gamebananaId;
				}
			}
			setGoldberriesChapters(chapters);
		})();

		(async () => {
			setGamebananaCampaign("pending");
			const response = await fetch(
				`https://cors-header-proxy.izumiano.workers.dev/?url=https://maddie480.ovh/celeste/gb?id=${encodeURIComponent(sid.split("/", 1)[0])}`,
			);

			if (!response.ok) {
				setGamebananaCampaign(null);
				return;
			}

			const html = await response.text();
			const urlMatch = html.match(
				/<meta property="og:url" content="https:\/\/gamebanana\.com\/mods\/(\d+)/,
			);
			if (!urlMatch?.[1]) {
				toast.error("Failed getting og:url from gamebanana");
				setGamebananaCampaign(null);
				return;
			}

			let gamebananaId: number | undefined = parseInt(urlMatch[1]);
			gamebananaId = Number.isNaN(gamebananaId) ? undefined : gamebananaId;
			setGamebananaCampaign({
				id: gamebananaId,
				url:
					gamebananaId != null
						? `https://gamebanana.com/mods/${gamebananaId}`
						: undefined,
			});
		})();
	}, [saveData.levelSetStats, setNode]);

	const goldberriesChapter =
		goldberriesChapters &&
		node &&
		goldberriesChapters !== "pending" &&
		gamebananaCampaign !== "pending"
			? selectChapter(goldberriesChapters, gamebananaCampaign?.id, node.title)
			: null;

	console.log(goldberriesChapter);

	return (
		<>
			{node && (
				<div className="flex column map-page">
					<main>
						<ChapterImage
							goldberriesChapter={
								goldberriesChapters === "pending"
									? "pending"
									: goldberriesChapter
							}
							gamebananaCampaign={gamebananaCampaign}
						/>
						<div className="flex image-overlay">
							<div className="flex title">
								<div className="flex">
									<h2>{node.title}</h2>
									{goldberriesChapters !== "pending" &&
										gamebananaCampaign !== "pending" &&
										(goldberriesChapter || gamebananaCampaign?.id != null) && (
											<div className="mapLinks">
												{goldberriesChapter && (
													<a
														href={`https://goldberries.net/map/${goldberriesChapter.id}`}
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
												)}
												<a
													href={
														goldberriesChapter?.campaign.url ??
														gamebananaCampaign?.url
													}
													target="_blank"
													rel="noopener noreferrer"
													className="pad-left pad-right flex mapLink"
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
						{node.children.length <= 1 ? (
							<FullMapStats node={node} showTitle={false} />
						) : (
							[...node.children]
								.sort((nodeA, nodeB) => {
									return (
										(nodeA as ModeSpecificStats).mode -
										(nodeB as ModeSpecificStats).mode
									);
								})
								.map((child, index) => (
									<Fragment key={`${id} ${index}`}>
										<FullMapStats node={child}></FullMapStats>
										{index < node.children.length - 1 && (
											<hr className="hor-divide t" />
										)}
									</Fragment>
								))
						)}
					</main>
				</div>
			)}
		</>
	);
}

function selectChapter(
	chapters: GoldBerriesChapter[],
	gamebananaId: number | undefined,
	mapName: string,
) {
	if (gamebananaId != null) {
		trace("Attempting to match gamebanana id");
		const gamebananaMatches = chapters.filter(
			(chapter) => chapter.campaign.gamebananaId === gamebananaId,
		);
		if (gamebananaMatches.length > 0) {
			chapters = gamebananaMatches;
		} else {
			toast.warn(
				`Goldberries did not respond with any chapter matching gamebanana id '${gamebananaId}'`,
			);
		}
	}
	if (chapters.length === 1) {
		trace("Only 1 response or matched gamebanana id");
		return chapters[0];
	}

	const nameMatches = chapters.filter((chapter) => chapter.name === mapName);
	if (nameMatches.length > 0) {
		chapters = nameMatches;
	}
	if (chapters.length === 1) {
		trace("Matched name");
		return chapters[0];
	}

	const withAuthor = chapters.filter((chapter) => chapter.author_gb_name);
	if (withAuthor.length > 0) {
		chapters = withAuthor;
	}
	if (chapters.length === 1) {
		trace("Matched having an author");
		return chapters[0];
	}

	chapters.sort((chapterA, chapterB) => {
		return (
			new Date(chapterA.date_added).getTime() -
			new Date(chapterB.date_added).getTime()
		);
	});

	trace("First by date");
	return chapters[0];
}
