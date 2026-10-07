"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Alert variant="destructive">
        <AlertTitle>表示できませんでした</AlertTitle>
        <AlertDescription>画面を読み直すと、もう一度開けます。</AlertDescription>
      </Alert>
      <Button onClick={reset} className="w-fit">
        再読み込み
      </Button>
    </div>
  );
}
