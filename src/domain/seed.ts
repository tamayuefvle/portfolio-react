import {
  asAssetId,
  asLoanId,
  asLocationId,
  asShipmentId,
  asUserId,
  type Database,
} from "@/domain/model";

export const demoAccounts = [
  { email: "admin@yard.example", password: "yard-admin", role: "Admin" },
  { email: "manager@yard.example", password: "yard-manager", role: "Manager" },
  { email: "warehouse@yard.example", password: "yard-warehouse", role: "Warehouse" },
  { email: "viewer@yard.example", password: "yard-viewer", role: "Viewer" },
] as const;

export function seedDatabase(): Database {
  return {
    settings: {
      orgName: "北浜機材",
      yardNote: "現場へ出す計測器は、発送前にシリアルを照合する。",
    },
    users: [
      {
        id: asUserId("usr_admin"),
        name: "青木 蓮",
        email: "admin@yard.example",
        password: "yard-admin",
        role: "admin",
      },
      {
        id: asUserId("usr_manager"),
        name: "黒田 岬",
        email: "manager@yard.example",
        password: "yard-manager",
        role: "manager",
      },
      {
        id: asUserId("usr_warehouse"),
        name: "西村 隼",
        email: "warehouse@yard.example",
        password: "yard-warehouse",
        role: "warehouse",
      },
      {
        id: asUserId("usr_viewer"),
        name: "森 小春",
        email: "viewer@yard.example",
        password: "yard-viewer",
        role: "viewer",
      },
    ],
    locations: [
      { id: asLocationId("loc_hq"), name: "本社", address: "東京都港区北浜 1-1" },
      { id: asLocationId("loc_osaka"), name: "大阪倉庫", address: "大阪市此花区島屋 2-4" },
      { id: asLocationId("loc_sendai"), name: "仙台拠点", address: "仙台市青葉区一番町 3-8" },
      { id: asLocationId("loc_yard"), name: "整備ヤード", address: "川崎市川崎区東扇島 5" },
    ],
    assets: [
      asset("ast_01", "ThinkPad X1", "laptop", "available", "loc_hq", "TP-1001", null, ""),
      asset("ast_02", "MacBook Pro 14", "laptop", "on_loan", "loc_hq", "MB-2204", "佐藤", ""),
      asset("ast_03", "騒音計 NL-42", "meter", "in_shipment", "loc_osaka", "NL-42-19", null, ""),
      asset("ast_04", "トルクレンチ", "tool", "available", "loc_yard", "TQ-88", null, ""),
      asset("ast_05", "27インチモニタ", "peripheral", "unavailable", "loc_hq", "MN-270", null, "パネル輝度が落ちている"),
      asset("ast_06", "ドッキングステーション", "peripheral", "available", "loc_sendai", "DK-14", null, ""),
      asset("ast_07", "絶縁抵抗計", "meter", "available", "loc_osaka", "IR-4055", null, ""),
      asset("ast_08", "電動ドライバ", "tool", "on_loan", "loc_yard", "ED-310", "鈴木", ""),
      asset("ast_09", "予備バッテリ", "other", "available", "loc_hq", "BT-09", null, ""),
      asset("ast_10", "Surface Laptop", "laptop", "available", "loc_sendai", "SF-778", null, ""),
      asset("ast_11", "オシロスコープ", "meter", "available", "loc_osaka", "OS-200", null, ""),
      asset("ast_12", "日本語キーボード", "peripheral", "available", "loc_hq", "KB-011", null, ""),
    ],
    shipments: [
      {
        id: asShipmentId("shp_01"),
        assetId: asAssetId("ast_03"),
        fromLocationId: asLocationId("loc_osaka"),
        toLocationId: asLocationId("loc_sendai"),
        status: "open",
        createdAt: "2026-10-06T01:00:00.000Z",
      },
      {
        id: asShipmentId("shp_02"),
        assetId: asAssetId("ast_06"),
        fromLocationId: asLocationId("loc_hq"),
        toLocationId: asLocationId("loc_sendai"),
        status: "delivered",
        createdAt: "2026-09-28T01:00:00.000Z",
      },
    ],
    loans: [
      {
        id: asLoanId("lon_01"),
        assetId: asAssetId("ast_02"),
        borrower: "佐藤",
        startedAt: "2026-10-02T01:00:00.000Z",
        returnedAt: null,
      },
      {
        id: asLoanId("lon_02"),
        assetId: asAssetId("ast_08"),
        borrower: "鈴木",
        startedAt: "2026-10-04T01:00:00.000Z",
        returnedAt: null,
      },
      {
        id: asLoanId("lon_03"),
        assetId: asAssetId("ast_01"),
        borrower: "高橋",
        startedAt: "2026-09-12T01:00:00.000Z",
        returnedAt: "2026-09-20T01:00:00.000Z",
      },
    ],
  };
}

function asset(
  id: string,
  name: string,
  category: Database["assets"][number]["category"],
  status: Database["assets"][number]["status"],
  locationId: string,
  serial: string,
  borrower: string | null,
  note: string,
): Database["assets"][number] {
  return {
    id: asAssetId(id),
    name,
    category,
    status,
    locationId: asLocationId(locationId),
    serial,
    borrower,
    note,
  };
}
