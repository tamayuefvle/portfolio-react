export const instant = false;

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@/server/session";

export default function Home() {
  return (
    <Suspense>
      <HomeRedirect />
    </Suspense>
  );
}

async function HomeRedirect() {
  const user = await currentUser();
  redirect(user ? "/dashboard" : "/login");
  return null;
}
