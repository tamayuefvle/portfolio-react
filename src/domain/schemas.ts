import { z } from "zod";
import {
  asAssetId,
  asLocationId,
  asLoanId,
  asShipmentId,
  asUserId,
  categories,
  roles,
  statuses,
  type AssetQuery,
  type CategoryId,
  type Database,
  type RoleId,
  type StatusId,
} from "@/domain/model";

const categorySchema = z.enum(
  categories.map((row) => row.id) as [CategoryId, ...CategoryId[]],
);
const statusSchema = z.enum(statuses.map((row) => row.id) as [StatusId, ...StatusId[]]);
const roleSchema = z.enum(roles.map((row) => row.id) as [RoleId, ...RoleId[]]);

const assetIdSchema = z.string().regex(/^ast_[a-z0-9]+$/).transform(asAssetId);
const locationIdSchema = z.string().regex(/^loc_[a-z0-9]+$/).transform(asLocationId);
const userIdSchema = z.string().regex(/^usr_[a-z0-9]+$/).transform(asUserId);
const shipmentIdSchema = z.string().regex(/^shp_[a-z0-9]+$/).transform(asShipmentId);
const loanIdSchema = z.string().regex(/^lon_[a-z0-9]+$/).transform(asLoanId);

export const databaseSchema: z.ZodType<Database> = z.object({
  users: z.array(
    z.object({
      id: userIdSchema,
      name: z.string(),
      email: z.string(),
      password: z.string(),
      role: roleSchema,
    }),
  ),
  locations: z.array(
    z.object({
      id: locationIdSchema,
      name: z.string(),
      address: z.string(),
    }),
  ),
  assets: z.array(
    z.object({
      id: assetIdSchema,
      name: z.string(),
      category: categorySchema,
      status: statusSchema,
      locationId: locationIdSchema,
      serial: z.string(),
      borrower: z.string().nullable(),
      note: z.string(),
    }),
  ),
  shipments: z.array(
    z.object({
      id: shipmentIdSchema,
      assetId: assetIdSchema,
      fromLocationId: locationIdSchema,
      toLocationId: locationIdSchema,
      status: z.enum(["open", "delivered"]),
      createdAt: z.string(),
    }),
  ),
  loans: z.array(
    z.object({
      id: loanIdSchema,
      assetId: assetIdSchema,
      borrower: z.string(),
      startedAt: z.string(),
      returnedAt: z.string().nullable(),
    }),
  ),
  settings: z.object({
    orgName: z.string(),
    yardNote: z.string(),
  }),
});

export const assetFieldsSchema = z.object({
  name: z.string().trim().min(1, "名前を入力してください").max(80),
  category: categorySchema,
  serial: z.string().trim().min(1, "シリアルを入力してください").max(40),
  note: z.string().trim().max(200),
});

export const createAssetSchema = assetFieldsSchema.extend({
  locationId: locationIdSchema,
});

export const loginSchema = z.object({
  email: z.email("メールアドレスの形式で入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

function field(input: unknown, key: string): unknown {
  if (typeof input !== "object" || input === null || !(key in input)) return undefined;
  return (input as Record<string, unknown>)[key];
}

function isCategory(value: unknown): value is CategoryId {
  return categories.some((row) => row.id === value);
}

function isStatus(value: unknown): value is StatusId {
  return statuses.some((row) => row.id === value);
}

function positiveInt(value: unknown, fallback: number): number {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

export function parseAssetQuery(input: unknown): AssetQuery {
  const search = field(input, "search");
  const sort = field(input, "sort");
  const dir = field(input, "dir");
  const category = field(input, "category");
  const status = field(input, "status");
  return {
    search: typeof search === "string" ? search : "",
    category: isCategory(category) ? category : "all",
    status: isStatus(status) ? status : "all",
    sort: sort === "serial" || sort === "status" || sort === "name" ? sort : "name",
    dir: dir === "desc" ? "desc" : "asc",
    page: positiveInt(field(input, "page"), 1),
    pageSize: 5,
  };
}
