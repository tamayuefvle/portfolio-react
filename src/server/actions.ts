"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  applyCommand,
  asAssetId,
  asLoanId,
  asLocationId,
  asShipmentId,
  asUserId,
  can,
  capabilityFor,
  queryAssets,
  type AssetQuery,
  type Command,
  type RoleId,
} from "@/domain/model";
import { assetFieldsSchema, createAssetSchema, loginSchema, parseAssetQuery } from "@/domain/schemas";
import { seedDatabase } from "@/domain/seed";
import { mintId, readDb, writeDb } from "@/server/db";
import { requireUser, sessionCookie } from "@/server/session";

function refresh() {
  revalidatePath("/", "layout");
}

async function commit(command: Command): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  if (!can(user.role, capabilityFor(command))) {
    return { ok: false, error: "この操作は今のロールではできません" };
  }
  const result = applyCommand(readDb(), command);
  if (!result.ok) return result;
  writeDb(result.db);
  refresh();
  return { ok: true };
}

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/login?error=credentials");
  const user = readDb().users.find(
    (row) => row.email === parsed.data.email && row.password === parsed.data.password,
  );
  if (!user) redirect("/login?error=credentials");
  const jar = await cookies();
  jar.set(sessionCookie, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/dashboard");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(sessionCookie);
  redirect("/login");
}

export async function searchAssets(input: unknown) {
  const user = await requireUser();
  if (!can(user.role, "asset.read")) {
    return { rows: [], total: 0, page: 1, pageCount: 1 };
  }
  return queryAssets(readDb().assets, parseAssetQuery(input));
}

export async function createAsset(input: unknown) {
  const parsed = createAssetSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "入力を確認してください" };
  const db = readDb();
  return commit({
    type: "create-asset",
    id: asAssetId(mintId("ast", db.assets.map((asset) => asset.id))),
    name: parsed.data.name,
    category: parsed.data.category,
    locationId: parsed.data.locationId,
    serial: parsed.data.serial,
    note: parsed.data.note,
  });
}

export async function updateAsset(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const parsed = assetFieldsSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    serial: formData.get("serial"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    redirect(`/assets/${id}?error=${encodeURIComponent("入力を確認してください")}`);
  }
  const result = await commit({
    type: "update-asset",
    id: asAssetId(id),
    name: parsed.data.name,
    category: parsed.data.category,
    serial: parsed.data.serial,
    note: parsed.data.note,
  });
  redirect(result.ok ? `/assets/${id}` : `/assets/${id}?error=${encodeURIComponent(result.error)}`);
}

export async function deleteAsset(formData: FormData) {
  const id = asAssetId(String(formData.get("id") ?? ""));
  const result = await commit({ type: "delete-asset", id });
  if (!result.ok) redirect(`/assets/${id}?error=${encodeURIComponent(result.error)}`);
  redirect("/assets");
}

export async function loanAsset(formData: FormData) {
  const assetId = String(formData.get("assetId") ?? "");
  const db = readDb();
  const result = await commit({
    type: "loan",
    assetId: asAssetId(assetId),
    loanId: asLoanId(mintId("lon", db.loans.map((loan) => loan.id))),
    borrower: String(formData.get("borrower") ?? "").trim(),
    at: new Date().toISOString(),
  });
  redirect(assetPath(assetId, result));
}

export async function returnAsset(formData: FormData) {
  const assetId = String(formData.get("assetId") ?? "");
  const result = await commit({
    type: "return-asset",
    assetId: asAssetId(assetId),
    at: new Date().toISOString(),
  });
  redirect(assetPath(assetId, result));
}

export async function shipAsset(formData: FormData) {
  const assetId = String(formData.get("assetId") ?? "");
  const db = readDb();
  const result = await commit({
    type: "ship",
    assetId: asAssetId(assetId),
    shipmentId: asShipmentId(mintId("shp", db.shipments.map((shipment) => shipment.id))),
    toLocationId: asLocationId(String(formData.get("toLocationId") ?? "")),
    at: new Date().toISOString(),
  });
  redirect(assetPath(assetId, result));
}

export async function receiveShipment(formData: FormData) {
  const shipmentId = String(formData.get("shipmentId") ?? "");
  const result = await commit({ type: "receive", shipmentId: asShipmentId(shipmentId) });
  if (!result.ok) redirect(`/shipments?error=${encodeURIComponent(result.error)}`);
  redirect("/shipments");
}

export async function stopAsset(formData: FormData) {
  const assetId = String(formData.get("assetId") ?? "");
  const result = await commit({
    type: "stop",
    assetId: asAssetId(assetId),
    note: String(formData.get("note") ?? "").trim(),
    at: new Date().toISOString(),
  });
  redirect(assetPath(assetId, result));
}

export async function restoreAsset(formData: FormData) {
  const assetId = String(formData.get("assetId") ?? "");
  const result = await commit({ type: "restore", assetId: asAssetId(assetId) });
  redirect(assetPath(assetId, result));
}

export async function createLocation(formData: FormData) {
  const db = readDb();
  const result = await commit({
    type: "create-location",
    id: asLocationId(mintId("loc", db.locations.map((location) => location.id))),
    name: String(formData.get("name") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
  });
  redirect(result.ok ? "/locations" : `/locations?error=${encodeURIComponent(result.error)}`);
}

export async function updateLocation(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await commit({
    type: "update-location",
    id: asLocationId(id),
    name: String(formData.get("name") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
  });
  redirect(result.ok ? "/locations" : `/locations?error=${encodeURIComponent(result.error)}`);
}

export async function deleteLocation(formData: FormData) {
  const result = await commit({
    type: "delete-location",
    id: asLocationId(String(formData.get("id") ?? "")),
  });
  redirect(result.ok ? "/locations" : `/locations?error=${encodeURIComponent(result.error)}`);
}

export async function setUserRole(formData: FormData) {
  const role = String(formData.get("role") ?? "");
  if (!isRole(role)) redirect("/users?error=role");
  const result = await commit({
    type: "set-role",
    userId: asUserId(String(formData.get("userId") ?? "")),
    role,
  });
  redirect(result.ok ? "/users" : `/users?error=${encodeURIComponent(result.error)}`);
}

export async function updateSettings(formData: FormData) {
  const orgName = String(formData.get("orgName") ?? "").trim();
  const yardNote = String(formData.get("yardNote") ?? "").trim();
  if (!orgName) redirect("/settings?error=組織名を入力してください");
  const result = await commit({ type: "update-settings", orgName, yardNote });
  redirect(result.ok ? "/settings" : `/settings?error=${encodeURIComponent(result.error)}`);
}

export async function resetDemo() {
  const user = await requireUser();
  if (!can(user.role, "settings.write")) redirect("/settings?error=この操作は今のロールではできません");
  writeDb(seedDatabase());
  refresh();
  redirect("/settings");
}

function assetPath(assetId: string, result: { ok: true } | { ok: false; error: string }) {
  return result.ok ? `/assets/${assetId}` : `/assets/${assetId}?error=${encodeURIComponent(result.error)}`;
}

function isRole(value: string): value is RoleId {
  return value === "admin" || value === "manager" || value === "warehouse" || value === "viewer";
}

export type { AssetQuery };
