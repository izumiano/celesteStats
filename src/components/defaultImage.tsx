import missingImage from "@assets/missingImage.webp";

export default function DefaultImage({
	src,
	alt,
	className,
	width,
	height,
}: {
	src: string | null | undefined;
	alt: string | undefined;
	className?: string;
	width?: number;
	height?: number;
}) {
	if (src === "") {
		src = null;
	}

	return (
		<img
			src={src ?? missingImage}
			alt={alt}
			className={className}
			width={width}
			height={height}
			style={{
				backgroundImage: `url('${missingImage}')`,
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
			onError={(event) => {
				event.currentTarget.src = missingImage;
				event.currentTarget.onerror = null;
			}}
		></img>
	);
}
