import { Suspense } from "react";
import Link from "next/link";
import { can } from "@/domain/model";
import { receiveShipment } from "@/server/actions";
import { readDb } from "@/server/db";
import { requireUser } from "@/server/session";
import { Notice } from "@/components/notice";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const shipmentLabel = { open: "輸送中", delivered: "到着" } as const;

export default function ShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; error?: string }>;
}) {
  return (
    <Suspense>
      <ShipmentsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ShipmentsContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const db = readDb();
  const needle = (params.q ?? "").trim().toLowerCase();
  const rows = db.shipments
    .filter((shipment) => {
      const asset = db.assets.find((row) => row.id === shipment.assetId);
      const haystack = `${asset?.name ?? ""} ${asset?.serial ?? ""}`.toLowerCase();
      return needle.length === 0 || haystack.includes(needle);
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium">発送</h1>
        <p className="text-muted-foreground">拠点間の輸送と到着を記録します。</p>
      </div>
      <Notice error={params.error} />
      <form action="/shipments" className="flex gap-2">
        <Input name="q" defaultValue={params.q ?? ""} placeholder="資産名またはシリアル" className="max-w-sm" />
        <Button type="submit" variant="outline">
          検索
        </Button>
      </form>
      {rows.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>該当する発送がありません</EmptyTitle>
            <EmptyDescription>検索語を消すと、記録済みの発送が表示されます。</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>資産</TableHead>
              <TableHead>出発</TableHead>
              <TableHead>宛先</TableHead>
              <TableHead>状態</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((shipment) => {
              const asset = db.assets.find((row) => row.id === shipment.assetId);
              const from = db.locations.find((row) => row.id === shipment.fromLocationId);
              const to = db.locations.find((row) => row.id === shipment.toLocationId);
              return (
                <TableRow key={shipment.id}>
                  <TableCell>
                    <Link href={`/assets/${shipment.assetId}`} className="underline-offset-4 hover:underline">
                      {asset?.name ?? shipment.assetId}
                    </Link>
                  </TableCell>
                  <TableCell>{from?.name ?? shipment.fromLocationId}</TableCell>
                  <TableCell>{to?.name ?? shipment.toLocationId}</TableCell>
                  <TableCell>{shipmentLabel[shipment.status]}</TableCell>
                  <TableCell>
                    {shipment.status === "open" && can(user.role, "shipment.write") ? (
                      <form action={receiveShipment}>
                        <input type="hidden" name="shipmentId" value={shipment.id} />
                        <Button type="submit" size="sm">
                          到着を記録
                        </Button>
                      </form>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
