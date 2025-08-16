import PrimaryLoading from "@/components/loading/PrimaryLoading";
import UserDetailsClient from "@/components/UserDetailsClient";
import { Suspense } from "react";

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <Suspense fallback={<PrimaryLoading />}>
      <UserDetailsClient username={username} />
    </Suspense>
  );
}
