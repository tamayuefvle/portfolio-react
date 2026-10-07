import { Suspense } from "react";
import { can } from "@/domain/model";
import { createLocation, deleteLocation, updateLocation } from "@/server/actions";
import { readDb } from "@/server/db";
import { requireUser } from "@/server/session";
import { Notice } from "@/components/notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense>
      <LocationsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LocationsContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const db = readDb();
  const canWrite = can(user.role, "location.write");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium">拠点</h1>
        <p className="text-muted-foreground">資産の現在地になる場所です。</p>
      </div>
      <Notice error={params.error} />
      <div className="grid gap-3">
        {db.locations.map((location) => {
          const holding = db.assets.filter((asset) => asset.locationId === location.id).length;
          return (
            <Card key={location.id}>
              <CardHeader>
                <CardTitle>{location.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  {location.address} / 資産 {holding}件
                </p>
                {canWrite ? (
                  <form action={updateLocation} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                    <input type="hidden" name="id" value={location.id} />
                    <Field>
                      <FieldLabel htmlFor={`name-${location.id}`}>名前</FieldLabel>
                      <Input id={`name-${location.id}`} name="name" defaultValue={location.name} required />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`address-${location.id}`}>住所</FieldLabel>
                      <Input id={`address-${location.id}`} name="address" defaultValue={location.address} required />
                    </Field>
                    <Button type="submit" variant="outline">
                      保存
                    </Button>
                  </form>
                ) : null}
                {canWrite ? (
                  <form action={deleteLocation}>
                    <input type="hidden" name="id" value={location.id} />
                    <Button type="submit" variant="ghost">
                      削除
                    </Button>
                  </form>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>拠点を追加</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createLocation} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <Field>
                <FieldLabel htmlFor="new-location-name">名前</FieldLabel>
                <Input id="new-location-name" name="name" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="new-location-address">住所</FieldLabel>
                <Input id="new-location-address" name="address" required />
              </Field>
              <Button type="submit">追加する</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
