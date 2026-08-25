import { useEffect, useState } from "react";
import DefaultImage from "../components/defaultImage";
import type { GoldBerriesChapter } from "./mapPage";
import LoadingSpinner from "../shared/loadingSpinner";

export default function ChapterImage({
	gbChapter,
}: {
	gbChapter: GoldBerriesChapter | null;
}) {
	const [imgUrl, setImgUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!gbChapter) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		(async () => {
			await (async () => {
				let response = await fetch(
					`https://cors-header-proxy.izumiano.workers.dev/?url=https://goldberries.net/img/map/${gbChapter.id}&scale=3`,
				);

				const isMissingImage =
					response.headers.get("Cors-Proxy-Redirected") === "true";
				if (!response.ok || isMissingImage) {
					if (gbChapter.campaign.gamebananaId == null) {
						return;
					}

					response = await fetch(
						`https://gamebanana.com/mods/embeddables/${gbChapter.campaign.gamebananaId}?type=large`,
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
	}, [gbChapter, gbChapter?.id, setIsLoading]);

	return (
		<div className="relative">
			<DefaultImage
				src={imgUrl}
				alt={gbChapter?.name}
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
