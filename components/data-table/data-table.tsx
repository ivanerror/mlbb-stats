"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  onRowSelect?: (row: TData | undefined) => void;
  selectedRowId?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage = "No data available.",
  onRowSelect,
  selectedRowId,
}: DataTableProps<TData, TValue>) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  const firstColumnId = React.useMemo(() => {
    const first = (columns?.[0] ?? {}) as any;
    return (first as any)?.accessorKey ?? (first as any)?.id ?? "";
  }, [columns]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      const q = String(filterValue).toLowerCase();
      try {
        // Read only the first column value (intended "Hero" column)
        let value: unknown;
        if (firstColumnId) {
          // @ts-ignore tanstack accepts string id
          value = row.getValue(firstColumnId as string);
        } else {
          const firstCell = row.getVisibleCells()?.[0];
          value = firstCell ? firstCell.getValue() : undefined;
        }

        // Normalize to text
        let text = "";
        if (typeof value === "string" || typeof value === "number") {
          text = String(value);
        } else if (value && typeof value === "object") {
          const v = value as any;
          // Try common shapes: { data: { name } } or { name }
          text = v?.data?.name ?? v?.name ?? "";
        }

        // Fallbacks based on known hero data shape
        if (!text) {
          const orig: any = row.original as any;
          text =
            orig?.main_hero?.data?.name ??
            orig?.main_hero?.name ??
            (typeof orig?.main_heroid !== "undefined"
              ? String(orig.main_heroid)
              : "");
        }

        return text.toLowerCase().includes(q);
      } catch {
        return false;
      }
    },
  });

  if (!mounted) {
    return (
      <div className="h-64 w-full rounded-3xl border border-border/80 bg-muted/20" />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 shadow-[0_25px_80px_rgba(2,6,23,0.55)] backdrop-blur-xl transition-shadow hover:shadow-[0_30px_90px_rgba(2,6,23,0.65)]">
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search..."
            className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white shadow-inner shadow-black/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/60 placeholder:text-white/50"
          />
          {globalFilter ? (
            <button
              type="button"
              onClick={() => setGlobalFilter("")}
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white/80 hover:text-white shadow-inner shadow-black/30"
            >
              Clear
            </button>
          ) : null}
        </div>
        <div className="max-h-[65vh] overflow-y-auto">
          <Table className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`bg-transparent ${
                        header.column.getCanSort()
                          ? "cursor-pointer select-none duration-150 hover:text-foreground"
                          : ""
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === "asc" && (
                          <ChevronUp className="h-4 w-4" />
                        )}
                        {header.column.getIsSorted() === "desc" && (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => onRowSelect?.(row.original as TData)}
                    className={`transition-colors duration-200 ${
                      selectedRowId === (row.original as any)?.main_heroid
                        ? "bg-white/10 shadow-lg"
                        : "hover:bg-white/5"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center text-sm"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
