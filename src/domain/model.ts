const brand: unique symbol = Symbol("brand");

type Brand<T, B extends string> = T & { readonly [brand]: B };

export type AssetId = Brand<string, "asset">;
export type LocationId = Brand<string, "location">;
export type UserId = Brand<string, "user">;
export type ShipmentId = Brand<string, "shipment">;
export type LoanId = Brand<string, "loan">;

export const categories = [
  { id: "laptop", label: "ノートPC" },
  { id: "meter", label: "計測器" },
  { id: "tool", label: "工具" },
  { id: "peripheral", label: "周辺機器" },
  { id: "other", label: "その他" },
] as const;

export const statuses = [
  { id: "available", label: "利用可能" },
  { id: "on_loan", label: "貸出中" },
  { id: "in_shipment", label: "発送中" },
  { id: "unavailable", label: "利用停止" },
] as const;

export const roles = [
  { id: "admin", label: "Admin" },
  { id: "manager", label: "Manager" },
  { id: "warehouse", label: "Warehouse" },
  { id: "viewer", label: "Viewer" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];
export type StatusId = (typeof statuses)[number]["id"];
export type RoleId = (typeof roles)[number]["id"];

function asId<B extends string>(pattern: RegExp, value: string): Brand<string, B> {
  if (!pattern.test(value)) {
    throw new Error(`invalid id: ${value}`);
  }
  return value as Brand<string, B>;
}

export const asAssetId = (value: string) => asId<"asset">(/^ast_[a-z0-9]+$/, value);
export const asLocationId = (value: string) => asId<"location">(/^loc_[a-z0-9]+$/, value);
export const asUserId = (value: string) => asId<"user">(/^usr_[a-z0-9]+$/, value);
export const asShipmentId = (value: string) => asId<"shipment">(/^shp_[a-z0-9]+$/, value);
export const asLoanId = (value: string) => asId<"loan">(/^lon_[a-z0-9]+$/, value);

export type Capability =
  | "asset.read"
  | "asset.write"
  | "asset.status"
  | "shipment.read"
  | "shipment.write"
  | "location.read"
  | "location.write"
  | "user.read"
  | "user.write"
  | "settings.read"
  | "settings.write";

const roleCapabilities: Record<RoleId, readonly Capability[]> = {
  admin: [
    "asset.read",
    "asset.write",
    "asset.status",
    "shipment.read",
    "shipment.write",
    "location.read",
    "location.write",
    "user.read",
    "user.write",
    "settings.read",
    "settings.write",
  ],
  manager: [
    "asset.read",
    "asset.write",
    "asset.status",
    "shipment.read",
    "shipment.write",
    "location.read",
    "user.read",
    "settings.read",
  ],
  warehouse: [
    "asset.read",
    "asset.status",
    "shipment.read",
    "shipment.write",
    "location.read",
    "settings.read",
  ],
  viewer: ["asset.read", "shipment.read", "location.read", "settings.read"],
};

export function can(role: RoleId, capability: Capability): boolean {
  return roleCapabilities[role].includes(capability);
}

export type User = {
  id: UserId;
  name: string;
  email: string;
  password: string;
  role: RoleId;
};

export type Location = {
  id: LocationId;
  name: string;
  address: string;
};

export type Asset = {
  id: AssetId;
  name: string;
  category: CategoryId;
  status: StatusId;
  locationId: LocationId;
  serial: string;
  borrower: string | null;
  note: string;
};

export type ShipmentStatus = "open" | "delivered";

export type Shipment = {
  id: ShipmentId;
  assetId: AssetId;
  fromLocationId: LocationId;
  toLocationId: LocationId;
  status: ShipmentStatus;
  createdAt: string;
};

export type Loan = {
  id: LoanId;
  assetId: AssetId;
  borrower: string;
  startedAt: string;
  returnedAt: string | null;
};

export type Settings = {
  orgName: string;
  yardNote: string;
};

export type Database = {
  users: User[];
  locations: Location[];
  assets: Asset[];
  shipments: Shipment[];
  loans: Loan[];
  settings: Settings;
};

export type Command =
  | {
      type: "create-asset";
      id: AssetId;
      name: string;
      category: CategoryId;
      locationId: LocationId;
      serial: string;
      note: string;
    }
  | {
      type: "update-asset";
      id: AssetId;
      name: string;
      category: CategoryId;
      serial: string;
      note: string;
    }
  | { type: "delete-asset"; id: AssetId }
  | { type: "loan"; assetId: AssetId; loanId: LoanId; borrower: string; at: string }
  | { type: "return-asset"; assetId: AssetId; at: string }
  | {
      type: "ship";
      assetId: AssetId;
      shipmentId: ShipmentId;
      toLocationId: LocationId;
      at: string;
    }
  | { type: "receive"; shipmentId: ShipmentId }
  | { type: "stop"; assetId: AssetId; note: string; at: string }
  | { type: "restore"; assetId: AssetId }
  | { type: "create-location"; id: LocationId; name: string; address: string }
  | { type: "update-location"; id: LocationId; name: string; address: string }
  | { type: "delete-location"; id: LocationId }
  | { type: "set-role"; userId: UserId; role: RoleId }
  | { type: "update-settings"; orgName: string; yardNote: string };

const commandCapability = {
  "create-asset": "asset.write",
  "update-asset": "asset.write",
  "delete-asset": "asset.write",
  loan: "asset.status",
  "return-asset": "asset.status",
  ship: "shipment.write",
  receive: "shipment.write",
  stop: "asset.status",
  restore: "asset.status",
  "create-location": "location.write",
  "update-location": "location.write",
  "delete-location": "location.write",
  "set-role": "user.write",
  "update-settings": "settings.write",
} as const satisfies Record<Command["type"], Capability>;

export function capabilityFor(command: Command): Capability {
  return commandCapability[command.type];
}

export type Failure = { ok: false; error: string };
export type Success = { ok: true; db: Database };
export type Result = Success | Failure;

function fail(error: string): Failure {
  return { ok: false, error };
}

function ok(db: Database): Success {
  return { ok: true, db };
}

function replace<T extends { id: string }>(rows: T[], id: string, next: T): T[] {
  return rows.map((row) => (row.id === id ? next : row));
}

export function applyCommand(db: Database, command: Command): Result {
  switch (command.type) {
    case "create-asset": {
      if (!command.name || !command.serial) return fail("名前とシリアルを入力してください");
      if (db.assets.some((asset) => asset.id === command.id || asset.serial === command.serial)) {
        return fail("同じ管理番号またはシリアルの資産が既にあります");
      }
      if (!db.locations.some((location) => location.id === command.locationId)) {
        return fail("拠点が見つかりません");
      }
      return ok({
        ...db,
        assets: [
          ...db.assets,
          {
            id: command.id,
            name: command.name,
            category: command.category,
            status: "available",
            locationId: command.locationId,
            serial: command.serial,
            borrower: null,
            note: command.note,
          },
        ],
      });
    }
    case "update-asset": {
      const asset = db.assets.find((row) => row.id === command.id);
      if (!asset) return fail("資産が見つかりません");
      if (!command.name || !command.serial) return fail("名前とシリアルを入力してください");
      if (db.assets.some((row) => row.serial === command.serial && row.id !== command.id)) {
        return fail("同じシリアルの資産が既にあります");
      }
      return ok({
        ...db,
        assets: replace(db.assets, asset.id, {
          ...asset,
          name: command.name,
          category: command.category,
          serial: command.serial,
          note: command.note,
        }),
      });
    }
    case "delete-asset": {
      const asset = db.assets.find((row) => row.id === command.id);
      if (!asset) return fail("資産が見つかりません");
      if (asset.status !== "available") return fail("利用可能な資産だけ削除できます");
      return ok({ ...db, assets: db.assets.filter((row) => row.id !== command.id) });
    }
    case "loan": {
      const asset = db.assets.find((row) => row.id === command.assetId);
      if (!asset) return fail("資産が見つかりません");
      if (!command.borrower) return fail("貸出先を入力してください");
      if (asset.status !== "available") return fail("利用可能な資産だけ貸し出せます");
      return ok({
        ...db,
        assets: replace(db.assets, asset.id, {
          ...asset,
          status: "on_loan",
          borrower: command.borrower,
        }),
        loans: [
          ...db.loans,
          {
            id: command.loanId,
            assetId: asset.id,
            borrower: command.borrower,
            startedAt: command.at,
            returnedAt: null,
          },
        ],
      });
    }
    case "return-asset": {
      const asset = db.assets.find((row) => row.id === command.assetId);
      if (!asset) return fail("資産が見つかりません");
      if (asset.status !== "on_loan") return fail("貸出中の資産だけ返却できます");
      return ok({
        ...db,
        assets: replace(db.assets, asset.id, { ...asset, status: "available", borrower: null }),
        loans: db.loans.map((loan) =>
          loan.assetId === asset.id && loan.returnedAt === null
            ? { ...loan, returnedAt: command.at }
            : loan,
        ),
      });
    }
    case "ship": {
      const asset = db.assets.find((row) => row.id === command.assetId);
      if (!asset) return fail("資産が見つかりません");
      if (asset.status !== "available") return fail("利用可能な資産だけ発送できます");
      if (!db.locations.some((location) => location.id === command.toLocationId)) {
        return fail("宛先の拠点が見つかりません");
      }
      if (asset.locationId === command.toLocationId) return fail("同じ拠点へは発送できません");
      return ok({
        ...db,
        assets: replace(db.assets, asset.id, { ...asset, status: "in_shipment" }),
        shipments: [
          ...db.shipments,
          {
            id: command.shipmentId,
            assetId: asset.id,
            fromLocationId: asset.locationId,
            toLocationId: command.toLocationId,
            status: "open",
            createdAt: command.at,
          },
        ],
      });
    }
    case "receive": {
      const shipment = db.shipments.find((row) => row.id === command.shipmentId);
      if (!shipment) return fail("発送が見つかりません");
      if (shipment.status !== "open") return fail("輸送中の発送だけ受け取れます");
      const asset = db.assets.find((row) => row.id === shipment.assetId);
      if (!asset || asset.status !== "in_shipment") return fail("発送中の資産が見つかりません");
      return ok({
        ...db,
        assets: replace(db.assets, asset.id, {
          ...asset,
          status: "available",
          locationId: shipment.toLocationId,
        }),
        shipments: replace(db.shipments, shipment.id, { ...shipment, status: "delivered" }),
      });
    }
    case "stop": {
      const asset = db.assets.find((row) => row.id === command.assetId);
      if (!asset) return fail("資産が見つかりません");
      if (asset.status !== "available" && asset.status !== "on_loan") {
        return fail("利用可能または貸出中の資産だけ利用停止できます");
      }
      return ok({
        ...db,
        assets: replace(db.assets, asset.id, {
          ...asset,
          status: "unavailable",
          borrower: null,
          note: command.note || asset.note,
        }),
        loans: db.loans.map((loan) =>
          loan.assetId === asset.id && loan.returnedAt === null
            ? { ...loan, returnedAt: command.at }
            : loan,
        ),
      });
    }
    case "restore": {
      const asset = db.assets.find((row) => row.id === command.assetId);
      if (!asset) return fail("資産が見つかりません");
      if (asset.status !== "unavailable") return fail("利用停止中の資産だけ復帰できます");
      return ok({
        ...db,
        assets: replace(db.assets, asset.id, { ...asset, status: "available", borrower: null }),
      });
    }
    case "create-location": {
      if (!command.name) return fail("拠点名を入力してください");
      if (db.locations.some((location) => location.id === command.id)) {
        return fail("同じ拠点が既にあります");
      }
      return ok({
        ...db,
        locations: [...db.locations, { id: command.id, name: command.name, address: command.address }],
      });
    }
    case "update-location": {
      const location = db.locations.find((row) => row.id === command.id);
      if (!location) return fail("拠点が見つかりません");
      if (!command.name) return fail("拠点名を入力してください");
      return ok({
        ...db,
        locations: replace(db.locations, location.id, {
          ...location,
          name: command.name,
          address: command.address,
        }),
      });
    }
    case "delete-location": {
      if (!db.locations.some((location) => location.id === command.id)) {
        return fail("拠点が見つかりません");
      }
      if (db.assets.some((asset) => asset.locationId === command.id)) {
        return fail("資産が残っている拠点は削除できません");
      }
      return ok({ ...db, locations: db.locations.filter((location) => location.id !== command.id) });
    }
    case "set-role": {
      const user = db.users.find((row) => row.id === command.userId);
      if (!user) return fail("ユーザーが見つかりません");
      const admins = db.users.filter((row) => row.role === "admin");
      if (user.role === "admin" && command.role !== "admin" && admins.length === 1) {
        return fail("最後の Admin は外せません");
      }
      return ok({
        ...db,
        users: replace(db.users, user.id, { ...user, role: command.role }),
      });
    }
    case "update-settings": {
      return ok({
        ...db,
        settings: { orgName: command.orgName, yardNote: command.yardNote },
      });
    }
    default: {
      const unreachable: never = command;
      return unreachable;
    }
  }
}

export function labelFor(
  rows: readonly { id: string; label: string }[],
  id: string,
): string {
  return rows.find((row) => row.id === id)?.label ?? id;
}

export type AssetQuery = {
  search: string;
  category: CategoryId | "all";
  status: StatusId | "all";
  sort: "name" | "serial" | "status";
  dir: "asc" | "desc";
  page: number;
  pageSize: number;
};

export function queryAssets(assets: readonly Asset[], query: AssetQuery) {
  const needle = query.search.trim().toLowerCase();
  const filtered = assets.filter((asset) => {
    const matchesSearch =
      needle.length === 0 ||
      asset.name.toLowerCase().includes(needle) ||
      asset.serial.toLowerCase().includes(needle);
    const matchesCategory = query.category === "all" || asset.category === query.category;
    const matchesStatus = query.status === "all" || asset.status === query.status;
    return matchesSearch && matchesCategory && matchesStatus;
  });
  const sorted = [...filtered].sort((left, right) => {
    const leftKey = query.sort === "status" ? labelFor(statuses, left.status) : left[query.sort];
    const rightKey = query.sort === "status" ? labelFor(statuses, right.status) : right[query.sort];
    const diff = leftKey.localeCompare(rightKey, "ja");
    return query.dir === "asc" ? diff : -diff;
  });
  const pageCount = Math.max(1, Math.ceil(sorted.length / query.pageSize));
  const page = Math.min(Math.max(query.page, 1), pageCount);
  const start = (page - 1) * query.pageSize;
  return {
    rows: sorted.slice(start, start + query.pageSize),
    total: sorted.length,
    page,
    pageCount,
  };
}
