import { useEffect, useState } from "react";
import DefaultImage from "../components/defaultImage";
import type { GamebananaCampaign, GoldBerriesChapter } from "./mapPage";
import LoadingSpinner from "../shared/loadingSpinner";

export default function ChapterImage({
	goldberriesChapter,
	gamebananaCampaign,
}: {
	goldberriesChapter: GoldBerriesChapter | "pending" | null;
	gamebananaCampaign: GamebananaCampaign | "pending" | null;
}) {
	const [imgUrl, setImgUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (goldberriesChapter === "pending" || gamebananaCampaign === "pending") {
			return;
		}

		if (!goldberriesChapter && !gamebananaCampaign) {
			setIsLoading(false);
			return;
		}

		const gamebananaId =
			goldberriesChapter?.campaign.gamebananaId ?? gamebananaCampaign?.id;

		setIsLoading(true);
		(async () => {
			await (async () => {
				let response: Response | null = null;
				let isMissingImage = true;

				if (goldberriesChapter) {
					response = await fetch(
						`https://cors-header-proxy.izumiano.workers.dev/?url=https://goldberries.net/img/map/${goldberriesChapter.id}&scale=3`,
					);

					isMissingImage =
						response.headers.get("Cors-Proxy-Redirected") === "true";
				}
				if (!response || !response.ok || isMissingImage) {
					if (gamebananaId == null) {
						return;
					}

					response = await fetch(
						`https://gamebanana.com/mods/embeddables/${gamebananaId}?type=large`,
					);
					if (!response.ok) {
						return;
					}
				}

				const blob = await response.blob();
				const blobUrl = URL.createObjectURL(blob);

				setImgUrl(blobUrl);
			})();

			setIsLoading(false);
		})();
	}, [goldberriesChapter, setIsLoading, gamebananaCampaign]);

	return (
		<div className="relative">
			<DefaultImage
				src={imgUrl}
				alt={
					goldberriesChapter === "pending"
						? undefined
						: goldberriesChapter?.name
				}
				width={640}
				height={360}
				className="chapter-image"
			/>
			{isLoading && (
				<LoadingSpinner props={{ absolutePos: true, centered: true }} />
			)}
		</div>
	);
}
