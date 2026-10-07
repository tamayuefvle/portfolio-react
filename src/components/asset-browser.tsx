"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { createAsset, searchAssets } from "@/server/actions";
import { createAssetSchema } from "@/domain/schemas";
import {
  can,
  categories,
  labelFor,
  statuses,
  type Asset,
  type AssetQuery,
  type Location,
  type RoleId,
} from "@/domain/model";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

type Result = { rows: Asset[]; total: number; page: number; pageCount: number };

export function AssetBrowser({
  role,
  locations,
  initialQuery,
  initialResult,
}: {
  role: RoleId;
  locations: Location[];
  initialQuery: AssetQuery;
  initialResult: Result;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const result = useQuery({
    queryKey: ["assets", query],
    queryFn: () => searchAssets(query),
    initialData: JSON.stringify(query) === JSON.stringify(initialQuery) ? initialResult : undefined,
  });
  const page = result.data ?? initialResult;

  function push(next: AssetQuery) {
    const clamped = { ...next, page: next.page };
    setQuery(clamped);
    const params = new URLSearchParams();
    if (clamped.search) params.set("search", clamped.search);
    if (clamped.category !== "all") params.set("category", clamped.category);
    if (clamped.status !== "all") params.set("status", clamped.status);
    if (clamped.sort !== "name") params.set("sort", clamped.sort);
    if (clamped.dir !== "asc") params.set("dir", clamped.dir);
    if (clamped.page > 1) params.set("page", String(clamped.page));
    const suffix = params.size > 0 ? `?${params.toString()}` : "";
    router.replace(`/assets${suffix}`);
  }

  function sortBy(sort: AssetQuery["sort"]) {
    push({
      ...query,
      sort,
      dir: query.sort === sort && query.dir === "asc" ? "desc" : "asc",
      page: 1,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <Field className="md:max-w-xs">
          <FieldLabel htmlFor="asset-search">検索</FieldLabel>
          <Input
            id="asset-search"
            value={query.search}
            placeholder="名前またはシリアル"
            onChange={(event) => push({ ...query, search: event.target.value, page: 1 })}
          />
        </Field>
        <FilterSelect
          label="カテゴリ"
          value={query.category}
          options={[{ id: "all", label: "すべて" }, ...categories]}
          onChange={(category) => push({ ...query, category: category as AssetQuery["category"], page: 1 })}
        />
        <FilterSelect
          label="ステータス"
          value={query.status}
          options={[{ id: "all", label: "すべて" }, ...statuses]}
          onChange={(status) => push({ ...query, status: status as AssetQuery["status"], page: 1 })}
        />
        {can(role, "asset.write") ? <CreateAssetDialog locations={locations} /> : null}
      </div>
      {page.total === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>該当する資産がありません</EmptyTitle>
            <EmptyDescription>条件を変えると、登録済みの資産が再び表示されます。</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => sortBy("name")}>
                  名前
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => sortBy("serial")}>
                  シリアル
                </Button>
              </TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => sortBy("status")}>
                  ステータス
                </Button>
              </TableHead>
              <TableHead>拠点</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {page.rows.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>
                  <Link className="underline-offset-4 hover:underline" href={`/assets/${asset.id}`}>
                    {asset.name}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs">{asset.serial}</TableCell>
                <TableCell>{labelFor(categories, asset.category)}</TableCell>
                <TableCell>
                  <StatusBadge status={asset.status} />
                </TableCell>
                <TableCell>{locations.find((location) => location.id === asset.locationId)?.name ?? asset.locationId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {page.total}件中 {page.page}/{page.pageCount}ページ
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page.page <= 1}
            onClick={() => push({ ...query, page: page.page - 1 })}
          >
            前へ
          </Button>
          <Button
            variant="outline"
            disabled={page.page >= page.pageCount}
            onClick={() => push({ ...query, page: page.page + 1 })}
          >
            次へ
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { id: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <Field className="md:w-44">
      <FieldLabel>{label}</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}

function CreateAssetDialog({ locations }: { locations: Location[] }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      name: "",
      category: "laptop" as const,
      locationId: locations[0]?.id ?? "",
      serial: "",
      note: "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="md:ml-auto">
          <PlusIcon data-icon="inline-start" />
          資産を登録
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>資産を登録</DialogTitle>
          <DialogDescription>登録した資産は「利用可能」から始まります。</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(async (values) => {
            setFormError(null);
            const result = await createAsset(values);
            if (!result.ok) {
              setFormError(result.error);
              return;
            }
            form.reset();
            setOpen(false);
            await queryClient.invalidateQueries({ queryKey: ["assets"] });
          })}
        >
          <FieldGroup>
            <Field data-invalid={form.formState.errors.name ? true : undefined}>
              <FieldLabel htmlFor="asset-name">名前</FieldLabel>
              <Input id="asset-name" aria-invalid={!!form.formState.errors.name} {...form.register("name")} />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>
            <Field data-invalid={form.formState.errors.serial ? true : undefined}>
              <FieldLabel htmlFor="asset-serial">シリアル</FieldLabel>
              <Input id="asset-serial" aria-invalid={!!form.formState.errors.serial} {...form.register("serial")} />
              <FieldError errors={[form.formState.errors.serial]} />
            </Field>
            <Field>
              <FieldLabel>カテゴリ</FieldLabel>
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field>
              <FieldLabel>拠点</FieldLabel>
              <Controller
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="asset-note">メモ</FieldLabel>
              <Textarea id="asset-note" {...form.register("note")} />
            </Field>
          </FieldGroup>
          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              登録する
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
