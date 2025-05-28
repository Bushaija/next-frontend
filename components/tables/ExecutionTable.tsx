'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Edit, Eye, MoreHorizontal, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';

// Interface for financial row data
export interface FinancialRow {
  id: string;
  title: string;
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
  cumulativeBalance?: number;
  comments?: string;
  isCategory?: boolean;
  children?: FinancialRow[];
  isEditable?: boolean;
}

// Interface for our executing data
export interface ExecutionRecord {
  id: string;
  facilityName: string;
  facilityType: string;
  facilityDistrict: string;
  province: string;
  program: string;
  fiscalYear: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  reportingPeriod: string;
  projectName: string;
  submittedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  financialData: {
    tableData: FinancialRow[];
    metadata: {
      healthCenter: string;
      district: string;
      project: string;
      reportingPeriod: string;
      fiscalYear: string;
    }
  }
}

interface ExecutionTableProps {
  data: ExecutionRecord[];
  onDelete?: (id: string) => void;
}

export default function ExecutionTable({ data, onDelete }: ExecutionTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  
  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate total budget for a report
  const calculateTotalBudget = (financialData: FinancialRow[]) => {
    // Find the "Receipts" row with ID 'a' to get the total receipts
    const receiptsRow = financialData.find(row => row.id === 'a');
    return receiptsRow?.cumulativeBalance || 0;
  };

  // Calculate total expenditure for a report
  const calculateTotalExpenditure = (financialData: FinancialRow[]) => {
    // Find the "Expenditures" row with ID 'b' to get the total expenditures
    const expendituresRow = financialData.find(row => row.id === 'b');
    return expendituresRow?.cumulativeBalance || 0;
  };

  // Helper function for status badge styling
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get reporting period quarter
  const getQuarterFromPeriod = (period: string) => {
    if (period.includes("JULY - SEPTEMBER")) return "Q1";
    if (period.includes("OCTOBER - DECEMBER")) return "Q2";
    if (period.includes("JANUARY - MARCH")) return "Q3";
    if (period.includes("APRIL - JUNE")) return "Q4";
    return "Unknown";
  };

  // Handle delete action
  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    } else {
      // Default behavior if no onDelete provided
      alert(`Delete execution report with ID: ${id}`);
    }
  };

  // Define the columns for the table
  const columns: ColumnDef<ExecutionRecord>[] = [
    {
      accessorKey: 'facilityName',
      header: 'Facility',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.facilityName}</div>
          <div className="text-sm text-muted-foreground">{row.original.facilityType}</div>
        </div>
      ),
    },
    {
      accessorKey: 'facilityDistrict',
      header: 'Location',
      cell: ({ row }) => (
        <div>
          <div>{row.original.facilityDistrict}</div>
          <div className="text-sm text-muted-foreground">{row.original.province}</div>
        </div>
      ),
    },
    {
      accessorKey: 'program',
      header: 'Program',
    },
    {
      accessorKey: 'reportingPeriod',
      header: 'Reporting Period',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{getQuarterFromPeriod(row.original.reportingPeriod)}</div>
          <div className="text-sm text-muted-foreground">{row.original.reportingPeriod}</div>
        </div>
      ),
    },
    {
      accessorKey: 'fiscalYear',
      header: 'Fiscal Year',
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ row }) => formatDate(row.original.updatedAt),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(row.original.status)}`}>
          {row.original.status.replace('_', ' ')}
        </div>
      ),
    },
    {
      accessorKey: 'budget',
      header: 'Budget Summary',
      cell: ({ row }) => {
        const totalReceipts = calculateTotalBudget(row.original.financialData.tableData);
        const totalExpenditures = calculateTotalExpenditure(row.original.financialData.tableData);
        const surplus = totalReceipts - totalExpenditures;
        
        return (
          <div>
            <div className="font-medium">
              {new Intl.NumberFormat('en-RW', {
                style: 'currency',
                currency: 'RWF',
                maximumFractionDigits: 0,
              }).format(totalReceipts)}
            </div>
            <div className="text-sm text-muted-foreground">
              Spent: {new Intl.NumberFormat('en-RW', {
                style: 'currency',
                currency: 'RWF',
                maximumFractionDigits: 0,
              }).format(totalExpenditures)}
            </div>
            <div className={`text-xs ${surplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Balance: {new Intl.NumberFormat('en-RW', {
                style: 'currency',
                currency: 'RWF',
                maximumFractionDigits: 0,
              }).format(surplus)}
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const report = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/execution/details/${report.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/execution/edit/${report.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(report.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
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
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Input
          placeholder="Filter facilities..."
          value={(table.getColumn('facilityName')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('facilityName')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder="Filter by program..."
          value={(table.getColumn('program')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('program')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No execution reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} of {data.length} reports
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