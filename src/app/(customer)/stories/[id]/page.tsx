import { StoryDetailPageClient } from "@/features/collection/components/story-detail-page";

export default async function StoryDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return <StoryDetailPageClient storyId={Number(id)} />;
}
