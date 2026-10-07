import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AssetNotFound() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-medium">資産が見つかりません</h1>
      <Button asChild className="w-fit">
        <Link href="/assets">一覧へ戻る</Link>
      </Button>
    </div>
  );
}
