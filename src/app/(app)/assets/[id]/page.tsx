import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  asAssetId,
  can,
  categories,
  labelFor,
  statuses,
} from "@/domain/model";
import {
  deleteAsset,
  loanAsset,
  restoreAsset,
  returnAsset,
  shipAsset,
  stopAsset,
  updateAsset,
} from "@/server/actions";
import { readDb } from "@/server/db";
import { requireUser } from "@/server/session";
import { Notice } from "@/components/notice";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AssetDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense>
      <AssetDetailContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function AssetDetailContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  let assetId: ReturnType<typeof asAssetId>;
  try {
    assetId = asAssetId(id);
  } catch {
    notFound();
  }
  const user = await requireUser();
  const db = readDb();
  const asset = db.assets.find((row) => row.id === assetId);
  if (!asset) notFound();
  const location = db.locations.find((row) => row.id === asset.locationId);
  const loans = db.loans.filter((loan) => loan.assetId === asset.id);
  const canWrite = can(user.role, "asset.write");
  const canStatus = can(user.role, "asset.status");
  const canShip = can(user.role, "shipment.write");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/assets" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          資産一覧へ
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-medium">{asset.name}</h1>
          <StatusBadge status={asset.status} />
        </div>
        <p className="font-mono text-sm text-muted-foreground">{asset.serial}</p>
      </div>
      <Notice error={query.error} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>台帳</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p>カテゴリ {labelFor(categories, asset.category)}</p>
            <p>ステータス {labelFor(statuses, asset.status)}</p>
            <p>拠点 {location?.name ?? asset.locationId}</p>
            <p>貸出先 {asset.borrower ?? "なし"}</p>
            <p>メモ {asset.note || "なし"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>履歴</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {loans.length === 0 ? <p className="text-muted-foreground">貸出履歴はありません。</p> : null}
            {loans.map((loan) => (
              <p key={loan.id}>
                {loan.borrower} {loan.startedAt.slice(0, 10)}
                {loan.returnedAt ? ` から ${loan.returnedAt.slice(0, 10)}` : " から貸出中"}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>台帳を直す</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateAsset} className="flex flex-col gap-4">
              <input type="hidden" name="id" value={asset.id} />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">名前</FieldLabel>
                  <Input id="name" name="name" defaultValue={asset.name} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="serial">シリアル</FieldLabel>
                  <Input id="serial" name="serial" defaultValue={asset.serial} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="category">カテゴリ</FieldLabel>
                  <select
                    id="category"
                    name="category"
                    defaultValue={asset.category}
                    className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="note">メモ</FieldLabel>
                  <Textarea id="note" name="note" defaultValue={asset.note} />
                </Field>
              </FieldGroup>
              <Button type="submit" className="w-fit">
                保存する
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
      <div className="flex flex-col gap-4">
        {canStatus && asset.status === "available" ? (
          <form action={loanAsset} className="flex flex-col gap-3 md:flex-row md:items-end">
            <input type="hidden" name="assetId" value={asset.id} />
            <Field className="md:w-64">
              <FieldLabel htmlFor="borrower">貸出先</FieldLabel>
              <Input id="borrower" name="borrower" required />
            </Field>
            <Button type="submit">貸し出す</Button>
          </form>
        ) : null}
        {canStatus && asset.status === "on_loan" ? (
          <form action={returnAsset}>
            <input type="hidden" name="assetId" value={asset.id} />
            <Button type="submit">返却を記録する</Button>
          </form>
        ) : null}
        {canShip && asset.status === "available" ? (
          <form action={shipAsset} className="flex flex-col gap-3 md:flex-row md:items-end">
            <input type="hidden" name="assetId" value={asset.id} />
            <Field className="md:w-64">
              <FieldLabel htmlFor="toLocationId">宛先</FieldLabel>
              <select
                id="toLocationId"
                name="toLocationId"
                defaultValue={db.locations.find((row) => row.id !== asset.locationId)?.id}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                {db.locations
                  .filter((row) => row.id !== asset.locationId)
                  .map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Button type="submit">発送する</Button>
          </form>
        ) : null}
        {canStatus && (asset.status === "available" || asset.status === "on_loan") ? (
          <form action={stopAsset} className="flex flex-col gap-3 md:flex-row md:items-end">
            <input type="hidden" name="assetId" value={asset.id} />
            <Field className="md:max-w-md">
              <FieldLabel htmlFor="stop-note">停止理由</FieldLabel>
              <Input id="stop-note" name="note" placeholder="点検、故障など" />
            </Field>
            <Button type="submit" variant="destructive">
              利用停止
            </Button>
          </form>
        ) : null}
        {canStatus && asset.status === "unavailable" ? (
          <form action={restoreAsset}>
            <input type="hidden" name="assetId" value={asset.id} />
            <Button type="submit">利用可能に戻す</Button>
          </form>
        ) : null}
        {canWrite && asset.status === "available" ? (
          <form action={deleteAsset}>
            <input type="hidden" name="id" value={asset.id} />
            <Button type="submit" variant="outline">
              台帳から外す
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
