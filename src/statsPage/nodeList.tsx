import "./nodeList.css";

import type { NodeStats } from "./useCelesteStats";
import Node from "./node";

export default function NodeList({
	parentId,
	stats,
}: {
	parentId: string;
	stats: NodeStats[] | undefined;
}) {
	return (
		<>
			{stats?.map((node, index) => {
				const id = `${parentId}/${node.title}`;

				return (
					<div key={id}>
						<Node node={node} id={id} index={index} />
					</div>
				);
			})}
		</>
	);
}
