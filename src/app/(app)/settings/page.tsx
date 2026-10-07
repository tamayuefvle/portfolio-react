import { Suspense } from "react";
import { can } from "@/domain/model";
import { resetDemo, updateSettings } from "@/server/actions";
import { readDb } from "@/server/db";
import { requireUser } from "@/server/session";
import { Notice } from "@/components/notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense>
      <SettingsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SettingsContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const db = readDb();
  const canWrite = can(user.role, "settings.write");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium">設定</h1>
        <p className="text-muted-foreground">組織名と、ヤードでの運用メモです。</p>
      </div>
      <Notice error={params.error} />
      <Card>
        <CardHeader>
          <CardTitle>{db.settings.orgName}</CardTitle>
          <CardDescription>{db.settings.yardNote}</CardDescription>
        </CardHeader>
        {canWrite ? (
          <CardContent>
            <form action={updateSettings} className="flex flex-col gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="orgName">組織名</FieldLabel>
                  <Input id="orgName" name="orgName" defaultValue={db.settings.orgName} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="yardNote">運用メモ</FieldLabel>
                  <Textarea id="yardNote" name="yardNote" defaultValue={db.settings.yardNote} />
                </Field>
              </FieldGroup>
              <Button type="submit" className="w-fit">
                保存する
              </Button>
            </form>
          </CardContent>
        ) : null}
      </Card>
      {canWrite ? (
        <form action={resetDemo}>
          <Button type="submit" variant="outline">
            デモデータに戻す
          </Button>
        </form>
      ) : null}
    </div>
  );
}
