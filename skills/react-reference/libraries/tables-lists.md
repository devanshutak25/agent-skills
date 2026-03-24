# Tables, Lists & Virtualization

## Decision Matrix

| Library | Type | Bundle | Best For |
|---------|------|--------|----------|
| **TanStack Table** | Headless table logic | ~15 kB | Custom table UI, full control |
| **AG Grid** | Full-featured grid | ~200+ kB | Enterprise grids, 100K+ rows |
| **TanStack Virtual** | Virtualization | ~10 kB | Long lists, custom layouts |
| **react-virtuoso** | Virtualized list | ~15 kB | Drop-in virtual scrolling |

---

## TanStack Table v8

```bash
npm install @tanstack/react-table
```

### Basic Table
```tsx
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';

type User = { id: string; name: string; email: string; role: string };

const columnHelper = createColumnHelper<User>();

const columns = [
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('email', { header: 'Email' }),
  columnHelper.accessor('role', {
    header: 'Role',
    cell: (info) => <Badge>{info.getValue()}</Badge>,
  }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => <ActionMenu user={row.original} />,
  }),
];

function UsersTable({ data }: { data: User[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map(hg => (
          <tr key={hg.id}>
            {hg.headers.map(h => (
              <th key={h.id}>
                {flexRender(h.column.columnDef.header, h.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### With Sorting, Filtering, Pagination
```tsx
import {
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';

function DataTable({ data }: { data: User[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Sorting: click header
  // table.getColumn('name')?.toggleSorting()

  // Filtering:
  // table.getColumn('email')?.setFilterValue('search term')

  // Pagination:
  // table.nextPage(), table.previousPage()
  // table.getState().pagination.pageIndex
}
```

---

## TanStack Virtual

```bash
npm install @tanstack/react-virtual
```

### Virtualized List
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((vItem) => (
          <div
            key={vItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${vItem.size}px`,
              transform: `translateY(${vItem.start}px)`,
            }}
          >
            <ListItem item={items[vItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Dynamic Row Heights
```tsx
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100, // estimate — actual measured dynamically
  measureElement: (el) => el.getBoundingClientRect().height,
});
```

### TanStack Table + Virtual (Large Data)
```tsx
const rowVirtualizer = useVirtualizer({
  count: table.getRowModel().rows.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 48,
  overscan: 10,
});

// Render only visible rows
{rowVirtualizer.getVirtualItems().map((virtualRow) => {
  const row = table.getRowModel().rows[virtualRow.index];
  return (
    <tr key={row.id} style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}>
      {row.getVisibleCells().map(cell => (
        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
      ))}
    </tr>
  );
})}
```

---

## AG Grid

```bash
npm install ag-grid-react ag-grid-community
```

```tsx
import { AgGridReact } from 'ag-grid-react';

function DataGrid({ data }: { data: User[] }) {
  const colDefs = [
    { field: 'name', sortable: true, filter: true },
    { field: 'email', sortable: true, filter: true },
    { field: 'role', editable: true },
  ];

  return (
    <div style={{ height: 500 }}>
      <AgGridReact
        rowData={data}
        columnDefs={colDefs}
        pagination
        paginationPageSize={20}
        rowSelection="multiple"
      />
    </div>
  );
}
```

**Pick AG Grid when:** Enterprise grids with built-in sorting, filtering, grouping, pivoting, Excel export. 100K+ rows. Free community edition covers basics; enterprise features require license.

---

## react-virtuoso

```bash
npm install react-virtuoso
```

```tsx
import { Virtuoso } from 'react-virtuoso';

function SimpleVirtualList({ items }: { items: Item[] }) {
  return (
    <Virtuoso
      style={{ height: '500px' }}
      totalCount={items.length}
      itemContent={(index) => <ListItem item={items[index]} />}
    />
  );
}

// With grouping
import { GroupedVirtuoso } from 'react-virtuoso';

<GroupedVirtuoso
  groupCounts={[10, 20, 30]}
  groupContent={(index) => <GroupHeader>{groups[index].name}</GroupHeader>}
  itemContent={(index) => <Item data={items[index]} />}
/>
```

**Pick react-virtuoso when:** Drop-in replacement, less configuration than TanStack Virtual, supports grouped lists and tables out of the box.

---

## When to Virtualize

| Rows | Action |
|------|--------|
| < 100 | No virtualization needed |
| 100 - 1,000 | Consider if rendering is slow |
| 1,000 - 10,000 | Virtualize with TanStack Virtual |
| 10,000+ | Virtualize + server-side pagination |
| 100,000+ | AG Grid with server-side row model |
