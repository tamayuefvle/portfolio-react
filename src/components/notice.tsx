import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function Notice({ error }: { error?: string }) {
  if (!error) return null;
  const message =
    error === "credentials"
      ? "メールアドレスまたはパスワードが違います"
      : error === "role"
        ? "ロールを選び直してください"
        : error;
  return (
    <Alert variant="destructive">
      <AlertTitle>操作できませんでした</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
