import { redirect } from "next/navigation";
import { Suspense } from "react";
import { UserDirectoryPanel } from "@/components/organisms/UserDirectoryPanel";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { getUsersAction } from "@/lib/domain/actions/users.actions";

async function UsersContent({ errorParam }: { errorParam?: string }) {
  const res = await getUsersAction();
  if (!res.ok) {
    redirect(`/login?callbackURL=%2Fusers&error=${encodeURIComponent(res.error)}`);
  }

  return <UserDirectoryPanel users={res.data} errorMessage={errorParam} />;
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <DashboardTemplate>
      <Suspense fallback={<div className="py-12 text-center text-sm text-gray-500">Loading users...</div>}>
        <UsersContent errorParam={params.error} />
      </Suspense>
    </DashboardTemplate>
  );
}
