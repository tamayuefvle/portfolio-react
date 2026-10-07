export const instant = false;

import { Suspense } from "react";
import { login } from "@/server/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { demoAccounts } from "@/domain/seed";
import { Notice } from "@/components/notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-40 w-full" />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="mx-auto flex min-h-full w-full max-w-5xl flex-col justify-center gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs tracking-[0.22em] text-primary">YARD</p>
        <h1 className="text-3xl font-medium tracking-tight">機材ヤード</h1>
        <p className="max-w-xl text-muted-foreground">
          ノートPC、計測器、工具の所在と、貸出、発送を一つの台帳で追います。
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>デモのロールで入る</CardTitle>
            <CardDescription>権限の違いを、同じ台帳で見比べられます。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {demoAccounts.map((account) => (
              <form key={account.email} action={login} className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-[1fr_auto] md:items-center">
                <input type="hidden" name="email" value={account.email} />
                <input type="hidden" name="password" value={account.password} />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{account.role}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {account.email} / {account.password}
                  </p>
                </div>
                <Button type="submit">このロールで入る</Button>
              </form>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>メールで入る</CardTitle>
            <CardDescription>上のデモアカウントをそのまま使えます。</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={login} className="flex flex-col gap-4">
              <Notice error={params.error} />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">メールアドレス</FieldLabel>
                  <Input id="email" name="email" type="email" autoComplete="username" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">パスワード</FieldLabel>
                  <Input id="password" name="password" type="password" autoComplete="current-password" required />
                </Field>
              </FieldGroup>
              <Button type="submit">ログイン</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
