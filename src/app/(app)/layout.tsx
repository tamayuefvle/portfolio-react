export const instant = false;

import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { Providers } from "@/components/providers";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/server/session";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-40 w-full" />}>
      <AuthedShell>{children}</AuthedShell>
    </Suspense>
  );
}

async function AuthedShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <Providers>
      <AppShell user={{ name: user.name, email: user.email, role: user.role }}>{children}</AppShell>
    </Providers>
  );
}
