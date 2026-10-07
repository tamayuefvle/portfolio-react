import { Suspense } from "react";
import { AssetBrowser } from "@/components/asset-browser";
import { Skeleton } from "@/components/ui/skeleton";
import { parseAssetQuery } from "@/domain/schemas";
import { queryAssets } from "@/domain/model";
import { readDb } from "@/server/db";
import { requireUser } from "@/server/session";

export default function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<Skeleton className="h-48 w-full" />}>
      <AssetsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AssetsContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const initialQuery = parseAssetQuery({
    search: first(params.search),
    category: first(params.category),
    status: first(params.status),
    sort: first(params.sort),
    dir: first(params.dir),
    page: first(params.page),
  });
  const db = readDb();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium">資産</h1>
        <p className="text-muted-foreground">名前、カテゴリ、ステータスで台帳を絞ります。</p>
      </div>
      <AssetBrowser
        role={user.role}
        locations={db.locations}
        initialQuery={initialQuery}
        initialResult={queryAssets(db.assets, initialQuery)}
      />
    </div>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
