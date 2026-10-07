import { describe, expect, it } from "vitest";
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
} from "@/domain/model";
import { seedDatabase } from "@/domain/seed";

const at = "2026-10-07T00:00:00.000Z";

describe("permissions", () => {
  it("keeps warehouse on status updates and blocks asset identity edits", () => {
    expect(can("warehouse", "asset.status")).toBe(true);
    expect(can("warehouse", "shipment.write")).toBe(true);
    expect(can("warehouse", "asset.write")).toBe(false);
    expect(can("warehouse", "user.read")).toBe(false);
  });

  it("lets a manager edit assets and read users, and keeps settings with admin", () => {
    expect(can("manager", "asset.write")).toBe(true);
    expect(can("manager", "user.read")).toBe(true);
    expect(can("manager", "user.write")).toBe(false);
    expect(can("manager", "location.write")).toBe(false);
    expect(can("manager", "settings.write")).toBe(false);
    expect(can("admin", "settings.write")).toBe(true);
    expect(can("viewer", "asset.write")).toBe(false);
  });
});

describe("asset commands", () => {
  it("loans an available asset and records the borrower", () => {
    const result = applyCommand(seedDatabase(), {
      type: "loan",
      assetId: asAssetId("ast_01"),
      loanId: asLoanId("lon_09"),
      borrower: "田中",
      at,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.db.assets.find((asset) => asset.id === asAssetId("ast_01"))).toMatchObject({
      status: "on_loan",
      borrower: "田中",
    });
    expect(result.db.loans.find((loan) => loan.id === asLoanId("lon_09"))).toMatchObject({
      borrower: "田中",
      returnedAt: null,
    });
  });

  it("refuses to loan an asset that is already out", () => {
    const result = applyCommand(seedDatabase(), {
      type: "loan",
      assetId: asAssetId("ast_02"),
      loanId: asLoanId("lon_09"),
      borrower: "田中",
      at,
    });
    expect(result).toEqual({ ok: false, error: "利用可能な資産だけ貸し出せます" });
  });

  it("moves a received shipment onto the destination location", () => {
    const result = applyCommand(seedDatabase(), {
      type: "receive",
      shipmentId: asShipmentId("shp_01"),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.db.assets.find((asset) => asset.id === asAssetId("ast_03"))).toMatchObject({
      status: "available",
      locationId: asLocationId("loc_sendai"),
    });
    expect(result.db.shipments.find((shipment) => shipment.id === asShipmentId("shp_01"))?.status).toBe(
      "delivered",
    );
  });

  it("refuses a shipment to the same location", () => {
    const result = applyCommand(seedDatabase(), {
      type: "ship",
      assetId: asAssetId("ast_01"),
      shipmentId: asShipmentId("shp_09"),
      toLocationId: asLocationId("loc_hq"),
      at,
    });
    expect(result).toEqual({ ok: false, error: "同じ拠点へは発送できません" });
  });

  it("refuses to delete an asset that is on loan", () => {
    const result = applyCommand(seedDatabase(), { type: "delete-asset", id: asAssetId("ast_02") });
    expect(result).toEqual({ ok: false, error: "利用可能な資産だけ削除できます" });
  });

  it("refuses to remove the last admin", () => {
    const result = applyCommand(seedDatabase(), {
      type: "set-role",
      userId: asUserId("usr_admin"),
      role: "viewer",
    });
    expect(result).toEqual({ ok: false, error: "最後の Admin は外せません" });
  });

  it("maps each command to one capability", () => {
    expect(capabilityFor({ type: "delete-asset", id: asAssetId("ast_01") })).toBe("asset.write");
    expect(
      capabilityFor({
        type: "ship",
        assetId: asAssetId("ast_01"),
        shipmentId: asShipmentId("shp_09"),
        toLocationId: asLocationId("loc_osaka"),
        at,
      }),
    ).toBe("shipment.write");
  });
});

describe("asset query", () => {
  it("filters by status and pages the remainder", () => {
    const page = queryAssets(seedDatabase().assets, {
      search: "",
      category: "all",
      status: "available",
      sort: "name",
      dir: "asc",
      page: 1,
      pageSize: 5,
    });
    expect(page.total).toBe(8);
    expect(page.pageCount).toBe(2);
    expect(page.rows).toHaveLength(5);
    expect(page.rows.every((asset) => asset.status === "available")).toBe(true);
  });

  it("returns no rows when the serial search misses", () => {
    const page = queryAssets(seedDatabase().assets, {
      search: "does-not-exist",
      category: "all",
      status: "all",
      sort: "serial",
      dir: "asc",
      page: 1,
      pageSize: 5,
    });
    expect(page.total).toBe(0);
    expect(page.rows).toEqual([]);
  });
});
