import DefaultImage from "../components/defaultImage";
import type { GoldBerriesChapter } from "./mapPage";

export default function ChapterImage({
	gbChapter,
}: {
	gbChapter: GoldBerriesChapter | null;
}) {
	return (
		<DefaultImage
			src={
				gbChapter && `https://goldberries.net/img/map/${gbChapter.id}&scale=3`
			}
			alt={gbChapter?.name}
			width={640}
			height={360}
			className="chapter-image"
		/>
	);
}
