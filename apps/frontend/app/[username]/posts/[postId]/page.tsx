import NotFound from "@/app/auth/not-found/page";
import LoadingComponent from "@/components/loading/LoadingComponent";
import PostPageDetails from "@/components/PostPage";
import { isValidUUID } from "@/utils";

export default async function PostPage({
  params,
}: {
  params: Promise<{ username: string; postId: string }>;
}) {
  const resolvedParams = await params;

  const { username, postId } = resolvedParams;

  if (!username || !postId) return <LoadingComponent />;

  if (!isValidUUID(postId)) return <NotFound />;

  return <PostPageDetails username={username} postId={postId} />;
}
