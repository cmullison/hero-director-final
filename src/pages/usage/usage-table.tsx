"use client";

import { useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UsageRecord = {
  id: string;
  date: string;
  model: string;
  project: string;
  requestType: string;
  credits: number;
  status: string;
};

const data: UsageRecord[] = [
  {
    id: "1",
    date: "2023-05-30",
    model: "GPT-4o",
    project: "Customer Support Bot",
    requestType: "Chat",
    credits: 45,
    status: "completed",
  },
  {
    id: "2",
    date: "2023-05-30",
    model: "DALL-E 3",
    project: "Product Catalog Generator",
    requestType: "Image",
    credits: 120,
    status: "completed",
  },
  {
    id: "3",
    date: "2023-05-29",
    model: "Claude 3",
    project: "Research Summarizer",
    requestType: "Chat",
    credits: 35,
    status: "completed",
  },
  {
    id: "4",
    date: "2023-05-29",
    model: "Gemini",
    project: "Code Review Assistant",
    requestType: "Code",
    credits: 28,
    status: "completed",
  },
  {
    id: "5",
    date: "2023-05-28",
    model: "GPT-4o",
    project: "Customer Support Bot",
    requestType: "Chat",
    credits: 42,
    status: "completed",
  },
  {
    id: "6",
    date: "2023-05-28",
    model: "DALL-E 3",
    project: "Marketing Campaign",
    requestType: "Image",
    credits: 110,
    status: "completed",
  },
  {
    id: "7",
    date: "2023-05-27",
    model: "Claude 3",
    project: "Content Writer",
    requestType: "Chat",
    credits: 38,
    status: "completed",
  },
  {
    id: "8",
    date: "2023-05-27",
    model: "Sora",
    project: "Marketing Video Creator",
    requestType: "Video",
    credits: 250,
    status: "completed",
  },
  {
    id: "9",
    date: "2023-05-26",
    model: "GPT-4o",
    project: "Email Assistant",
    requestType: "Chat",
    credits: 30,
    status: "completed",
  },
  {
    id: "10",
    date: "2023-05-26",
    model: "Llama 3",
    project: "Data Analysis",
    requestType: "Chat",
    credits: 25,
    status: "completed",
  },
];

export function UsageTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<UsageRecord>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => <div>{row.getValue("date")}</div>,
    },
    {
      accessorKey: "model",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Model
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("model")}</div>,
    },
    {
      accessorKey: "project",
      header: "Project",
      cell: ({ row }) => <div>{row.getValue("project")}</div>,
    },
    {
      accessorKey: "requestType",
      header: "Type",
      cell: ({ row }) => <div>{row.getValue("requestType")}</div>,
    },
    {
      accessorKey: "credits",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Credits
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("credits")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <div>{row.getValue("status")}</div>,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter projects..."
          value={(table.getColumn("project")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("project")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
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
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} entries
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
