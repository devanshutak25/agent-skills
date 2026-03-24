# shadcn/ui Data Table Patterns

## Setup
```bash
npx shadcn@latest add table
npm install @tanstack/react-table
```

## Column Definitions
```tsx
import { ColumnDef } from "@tanstack/react-table"

type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

export const columns: ColumnDef<Payment>[] = [
  // Simple accessor
  {
    accessorKey: "email",
    header: "Email",
  },
  // Formatted cell
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  // Badge cell
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("status") === "success" ? "default" : "secondary"}>
        {row.getValue("status")}
      </Badge>
    ),
  },
]
```

## DataTable Component
```tsx
"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
```

## Sorting
```tsx
import { getSortedRowModel, SortingState } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

// State
const [sorting, setSorting] = useState<SortingState>([])

// Table config
const table = useReactTable({
  // ...
  onSortingChange: setSorting,
  getSortedRowModel: getSortedRowModel(),
  state: { sorting },
})

// Sortable header
{
  accessorKey: "email",
  header: ({ column }) => (
    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
      Email
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
}
```

## Filtering
```tsx
import { getFilteredRowModel, ColumnFiltersState } from "@tanstack/react-table"

const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

const table = useReactTable({
  // ...
  onColumnFiltersChange: setColumnFilters,
  getFilteredRowModel: getFilteredRowModel(),
  state: { columnFilters },
})

// Filter input
<Input
  placeholder="Filter emails..."
  value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
  onChange={(e) => table.getColumn("email")?.setFilterValue(e.target.value)}
  className="max-w-sm"
/>
```

## Pagination
```tsx
import { getPaginationRowModel } from "@tanstack/react-table"

const table = useReactTable({
  // ...
  getPaginationRowModel: getPaginationRowModel(),
})

// Controls
<div className="flex items-center justify-end space-x-2 py-4">
  <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
    Previous
  </Button>
  <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
    Next
  </Button>
</div>
```

## Row Selection
```tsx
import { Checkbox } from "@/components/ui/checkbox"

// Selection column
{
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
  ),
  enableSorting: false,
  enableHiding: false,
}

// State
const [rowSelection, setRowSelection] = useState({})

const table = useReactTable({
  // ...
  onRowSelectionChange: setRowSelection,
  state: { rowSelection },
})

// Selected count
<div className="text-sm text-muted-foreground">
  {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
</div>
```

## Column Visibility
```tsx
import { VisibilityState } from "@tanstack/react-table"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

const table = useReactTable({
  // ...
  onColumnVisibilityChange: setColumnVisibility,
  state: { columnVisibility },
})

// Toggle
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" className="ml-auto">Columns</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    {table.getAllColumns().filter((col) => col.getCanHide()).map((col) => (
      <DropdownMenuCheckboxItem key={col.id} checked={col.getIsVisible()} onCheckedChange={(value) => col.toggleVisibility(!!value)}>
        {col.id}
      </DropdownMenuCheckboxItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

## Row Actions
```tsx
import { MoreHorizontal } from "lucide-react"

{
  id: "actions",
  cell: ({ row }) => {
    const payment = row.original
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>
            Copy payment ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuItem>View payment details</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
}
```
