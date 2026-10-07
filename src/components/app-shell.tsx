import Link from "next/link";
import { logout } from "@/server/actions";
import { labelFor, roles, type RoleId } from "@/domain/model";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const links = [
  { href: "/dashboard", label: "ダッシュボード" },
  { href: "/assets", label: "資産" },
  { href: "/shipments", label: "発送" },
  { href: "/locations", label: "拠点" },
  { href: "/users", label: "ユーザー" },
  { href: "/settings", label: "設定" },
];

export function AppShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: RoleId };
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto grid min-h-full max-w-6xl md:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-6 border-b border-border px-4 py-5 md:border-r md:border-b-0">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-xs tracking-[0.22em] text-primary">YARD</p>
            <p className="text-lg font-medium">機材ヤード</p>
          </div>
          <nav className="flex flex-wrap gap-1 md:flex-col">
            {links.map((link) => (
              <Button key={link.href} variant="ghost" className="justify-start" asChild>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <Badge variant="outline">{labelFor(roles, user.role)}</Badge>
            </div>
            <form action={logout}>
              <Button type="submit" variant="outline" className="w-full">
                ログアウト
              </Button>
            </form>
          </div>
        </aside>
        <div className="flex flex-col gap-6 px-4 py-6 md:px-8">{children}</div>
      </div>
    </div>
  );
}
