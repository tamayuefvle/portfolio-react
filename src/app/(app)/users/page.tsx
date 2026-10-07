import { Suspense } from "react";
import { can, roles } from "@/domain/model";
import { setUserRole } from "@/server/actions";
import { readDb } from "@/server/db";
import { requireUser } from "@/server/session";
import { Notice } from "@/components/notice";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense>
      <UsersContent searchParams={searchParams} />
    </Suspense>
  );
}

async function UsersContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  if (!can(user.role, "user.read")) {
    return (
      <Alert>
        <AlertTitle>ユーザー一覧は開けません</AlertTitle>
        <AlertDescription>Admin と Manager だけがユーザーを参照できます。</AlertDescription>
      </Alert>
    );
  }
  const db = readDb();
  const canWrite = can(user.role, "user.write");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium">ユーザー</h1>
        <p className="text-muted-foreground">ロールは Admin、Manager、Warehouse、Viewer の4つです。</p>
      </div>
      <Notice error={params.error} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名前</TableHead>
            <TableHead>メール</TableHead>
            <TableHead>ロール</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {db.users.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>
                {canWrite ? (
                  <form action={setUserRole} className="flex gap-2">
                    <input type="hidden" name="userId" value={row.id} />
                    <select
                      name="role"
                      defaultValue={row.role}
                      className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" size="sm" variant="outline">
                      変更
                    </Button>
                  </form>
                ) : (
                  row.role
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
