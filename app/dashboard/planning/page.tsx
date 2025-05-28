'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnDef,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { Edit, Eye, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
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
import {
  // Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import planningData from '@/constants/planning-data.json';

// Interface for activity data
interface Activity {
  id: string;
  activityCategory: string;
  typeOfActivity: string;
  activity: string;
  frequency: number;
  unitCost: number;
  countQ1: number;
  countQ2: number;
  countQ3: number;
  countQ4: number;
  amountQ1: number;
  amountQ2: number;
  amountQ3: number;
  amountQ4: number;
  totalBudget: number;
  comment: string;
}

// Interface for our planning data
interface PlanningRecord {
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
  activities: Activity[];
}

export default function PlanningPage() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate total budget for a plan
  const calculateTotalBudget = (activities: Activity[]) => {
    return activities.reduce((sum, activity) => sum + (activity.totalBudget || 0), 0);
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

  // Handle delete action
  const handleDelete = (id: string) => {
    // In a real app, you would call an API to delete the record
    alert(`Delete plan with ID: ${id}`);
  };

  // Define the columns for the table
  const columns: ColumnDef<PlanningRecord>[] = [
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
      header: 'Total Budget',
      cell: ({ row }) => (
        <div className="font-medium">
          {new Intl.NumberFormat('en-RF', {
            style: 'currency',
            currency: 'RWF',
            maximumFractionDigits: 0,
          }).format(calculateTotalBudget(row.original.activities))}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const plan = row.original;
        
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
              <DropdownMenuItem onClick={() => router.push(`/dashboard/planning/view/${plan.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/planning/edit/${plan.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(plan.id)}>
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
    data: planningData as PlanningRecord[],
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
    <div className="p-8">
    <div>
        <div className="flex justify-between items-center">
          <CardHeader>
            <CardTitle>Plans</CardTitle>
            <CardDescription>
              View and manage your facility planning records
            </CardDescription>
          </CardHeader>
          <Button onClick={() => router.push('/dashboard/planning/new')} className="mr-[26px]">
            <Plus className="mr-2 h-4 w-4" /> Create New Plan
          </Button>
        </div>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Input
              placeholder="Filter facilities..."
              value={(table.getColumn('facilityName')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('facilityName')?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
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
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )} of {table.getFilteredRowModel().rows.length} plans
          </div>
          <div className="flex items-center space-x-2">
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
        </CardFooter>
      </div>
    </div>
  );
}