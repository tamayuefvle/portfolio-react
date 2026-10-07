import { Suspense } from "react";
import Link from "next/link";
import { statuses } from "@/domain/model";
import { readDb } from "@/server/db";
import { requireUser } from "@/server/session";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const user = await requireUser();
  const db = readDb();
  const openLoans = db.loans.filter((loan) => loan.returnedAt === null);
  const openShipments = db.shipments.filter((shipment) => shipment.status === "open");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{db.settings.orgName}</p>
        <h1 className="text-2xl font-medium">ダッシュボード</h1>
        <p className="text-muted-foreground">{user.name} さん、今日の台帳です。</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statuses.map((status) => {
          const count = db.assets.filter((asset) => asset.status === status.id).length;
          return (
            <Link key={status.id} href={`/assets?status=${status.id}`}>
              <Card className="h-full">
                <CardHeader>
                  <CardDescription>{status.label}</CardDescription>
                  <CardTitle className="text-3xl">{count}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>貸出中</CardTitle>
            <CardDescription>返却前の資産です。</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {openLoans.length === 0 ? <p className="text-sm text-muted-foreground">貸出中の資産はありません。</p> : null}
            {openLoans.map((loan) => {
              const asset = db.assets.find((row) => row.id === loan.assetId);
              return (
                <Link key={loan.id} href={`/assets/${loan.assetId}`} className="flex items-center justify-between gap-3">
                  <span>{asset?.name ?? loan.assetId}</span>
                  <span className="text-sm text-muted-foreground">{loan.borrower}</span>
                </Link>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>発送中</CardTitle>
            <CardDescription>到着前の輸送です。</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {openShipments.length === 0 ? <p className="text-sm text-muted-foreground">発送中の資産はありません。</p> : null}
            {openShipments.map((shipment) => {
              const asset = db.assets.find((row) => row.id === shipment.assetId);
              const destination = db.locations.find((location) => location.id === shipment.toLocationId);
              return (
                <Link key={shipment.id} href="/shipments" className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    {asset?.name ?? shipment.assetId}
                    {asset ? <StatusBadge status={asset.status} /> : null}
                  </span>
                  <span className="text-sm text-muted-foreground">{destination?.name ?? shipment.toLocationId}</span>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
