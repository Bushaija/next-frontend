"use client"

import { useCallback, useMemo, useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, ChevronRight, Save } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { 
  FinancialRow, 
  generateEmptyFinancialTemplate, 
  calculateHierarchicalTotals 
} from "@/features/executing/schema/financial-report"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FinancialTableProps {
  data?: FinancialRow[]
  fiscalYear?: string
  onSave?: (data: FinancialRow[]) => void
  readOnly?: boolean
  expandedRowIds?: string[]
}

export function FinancialTable({
  data: initialData,
  fiscalYear = "2023",
  onSave,
  readOnly = false,
  expandedRowIds: initialExpandedRowIds,
}: FinancialTableProps) {
  // Initialize with either the provided data or an empty template
  const [formData, setFormData] = useState<FinancialRow[]>(() => {
    const startingData = initialData || calculateHierarchicalTotals(generateEmptyFinancialTemplate())
    return startingData
  })
  
  // Track which rows are expanded
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>(() => {
    const expanded: Record<string, boolean> = {}
    
    // If specific expanded row IDs are provided, use those
    if (initialExpandedRowIds) {
      initialExpandedRowIds.forEach(id => {
        expanded[id] = true
      })
      return expanded
    }
    
    // Otherwise, expand all categories by default
    const expandCategories = (rows: FinancialRow[]) => {
      for (const row of rows) {
        if (row.isCategory) {
          expanded[row.id] = true
        }
        if (row.children) {
          expandCategories(row.children)
        }
      }
    }
    
    expandCategories(formData)
    return expanded
  })
  
  // Track if form is dirty (has unsaved changes)
  const [isDirty, setIsDirty] = useState(false)
  
  // Flatten the hierarchical data for display in the table
  const flattenedRows = useMemo(() => {
    const flattened: Array<FinancialRow & { depth: number }> = []
    
    const flatten = (rows: FinancialRow[], depth = 0) => {
      for (const row of rows) {
        // Add the current row with its depth
        flattened.push({ ...row, depth })
        
        // If this row has children and is expanded, add those too
        if (row.children && expandedRows[row.id]) {
          flatten(row.children, depth + 1)
        }
      }
    }
    
    flatten(formData)
    return flattened
  }, [formData, expandedRows])
  
  // Handle toggling row expansion
  const handleToggleExpand = useCallback((rowId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }))
  }, [])
  
  // Handle changing a value in a cell
  const handleValueChange = useCallback((rowId: string, field: string, value: string) => {
    if (readOnly) return

    // Convert to number or undefined
    const numericValue = value === "" ? undefined : parseFloat(value)
    
    // A deep clone function to safely update nested state
    const deepClone = (items: FinancialRow[]): FinancialRow[] => {
      return items.map(item => ({
        ...item,
        children: item.children ? deepClone(item.children) : undefined
      }))
    }
    
    // Update the value in our data structure
    const updateRowValue = (rows: FinancialRow[]): FinancialRow[] => {
      return rows.map(row => {
        if (row.id === rowId) {
          return { ...row, [field]: numericValue }
        }
        
        if (row.children) {
          return { ...row, children: updateRowValue(row.children) }
        }
        
        return row
      })
    }
    
    // Create a new version of the data with the updated value
    const updatedData = updateRowValue(deepClone(formData))
    
    // Apply calculations to update totals
    const calculatedData = calculateHierarchicalTotals(updatedData)
    
    // Update state
    setFormData(calculatedData)
    setIsDirty(true)
  }, [formData, readOnly])
  
  // Handle updating a comment
  const handleCommentChange = useCallback((rowId: string, comment: string) => {
    if (readOnly) return

    // A deep clone function to safely update nested state
    const deepClone = (items: FinancialRow[]): FinancialRow[] => {
      return items.map(item => ({
        ...item,
        children: item.children ? deepClone(item.children) : undefined
      }))
    }
    
    // Update the comment in our data structure
    const updateRowComment = (rows: FinancialRow[]): FinancialRow[] => {
      return rows.map(row => {
        if (row.id === rowId) {
          return { ...row, comment: comment || undefined }
        }
        
        if (row.children) {
          return { ...row, children: updateRowComment(row.children) }
        }
        
        return row
      })
    }
    
    // Create a new version of the data with the updated comment
    const updatedData = updateRowComment(deepClone(formData))
    
    // Update state
    setFormData(updatedData)
    setIsDirty(true)
  }, [formData, readOnly])
  
  // Save the current form data
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(formData)
      setIsDirty(false)
    }
  }, [formData, onSave])
  
  // Generate column definitions for our financial table
  const columns = useMemo<ColumnDef<FinancialRow & { depth: number }>[]>(() => {
    const generateQuarterLabels = (baseYear: string) => {
      const year = parseInt(baseYear, 10)
      return [
        `Q1 (Jan-Mar ${baseYear})`,
        `Q2 (Apr-Jun ${baseYear})`,
        `Q3 (Jul-Sep ${baseYear})`,
        `Q4 (Oct-Dec ${baseYear})`,
      ]
    }
    
    const quarterLabels = generateQuarterLabels(fiscalYear)
    
    return [
      {
        accessorKey: "title",
        header: "Activity/Line Item",
        cell: ({ row }) => {
          const { depth, title, isCategory, children } = row.original
          const hasChildren = children && children.length > 0
          
          return (
            <div 
              className={cn(
                "flex items-center",
                isCategory && "font-bold",
                !isCategory && "text-sm"
              )}
              style={{ paddingLeft: `${depth * 1.5}rem` }}
            >
              {hasChildren && (
                <button
                  onClick={() => handleToggleExpand(row.original.id)}
                  className="mr-1 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  {expandedRows[row.original.id] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
              {!hasChildren && <div className="w-4 mr-1" />}
              {title}
            </div>
          )
        },
      },
      // Q1 Column
      {
        accessorKey: "q1",
        header: quarterLabels[0],
        cell: ({ row }) => {
          const isCategory = row.original.isCategory
          const isEditable = row.original.isEditable !== false
          const value = row.original.q1
          const formattedValue = value !== undefined ? value.toLocaleString() : ""
          
          return (
            <div className="text-right">
              {(isCategory || !isEditable || readOnly) ? (
                <span className={cn(isCategory && "font-bold")}>
                  {formattedValue}
                </span>
              ) : (
                <Input
                  type="number"
                  value={value === undefined ? "" : value}
                  onChange={(e) => handleValueChange(row.original.id, "q1", e.target.value)}
                  className="h-8 w-24 text-right"
                  aria-label={`${row.original.title} ${quarterLabels[0]}`}
                />
              )}
            </div>
          )
        },
      },
      // Q2 Column
      {
        accessorKey: "q2",
        header: quarterLabels[1],
        cell: ({ row }) => {
          const isCategory = row.original.isCategory
          const isEditable = row.original.isEditable !== false
          const value = row.original.q2
          const formattedValue = value !== undefined ? value.toLocaleString() : ""
          
          return (
            <div className="text-right">
              {(isCategory || !isEditable || readOnly) ? (
                <span className={cn(isCategory && "font-bold")}>
                  {formattedValue}
                </span>
              ) : (
                <Input
                  type="number"
                  value={value === undefined ? "" : value}
                  onChange={(e) => handleValueChange(row.original.id, "q2", e.target.value)}
                  className="h-8 w-24 text-right"
                  aria-label={`${row.original.title} ${quarterLabels[1]}`}
                />
              )}
            </div>
          )
        },
      },
      // Q3 Column
      {
        accessorKey: "q3",
        header: quarterLabels[2],
        cell: ({ row }) => {
          const isCategory = row.original.isCategory
          const isEditable = row.original.isEditable !== false
          const value = row.original.q3
          const formattedValue = value !== undefined ? value.toLocaleString() : ""
          
          return (
            <div className="text-right">
              {(isCategory || !isEditable || readOnly) ? (
                <span className={cn(isCategory && "font-bold")}>
                  {formattedValue}
                </span>
              ) : (
                <Input
                  type="number"
                  value={value === undefined ? "" : value}
                  onChange={(e) => handleValueChange(row.original.id, "q3", e.target.value)}
                  className="h-8 w-24 text-right"
                  aria-label={`${row.original.title} ${quarterLabels[2]}`}
                />
              )}
            </div>
          )
        },
      },
      // Q4 Column
      {
        accessorKey: "q4",
        header: quarterLabels[3],
        cell: ({ row }) => {
          const isCategory = row.original.isCategory
          const isEditable = row.original.isEditable !== false
          const value = row.original.q4
          const formattedValue = value !== undefined ? value.toLocaleString() : ""
          
          return (
            <div className="text-right">
              {(isCategory || !isEditable || readOnly) ? (
                <span className={cn(isCategory && "font-bold")}>
                  {formattedValue}
                </span>
              ) : (
                <Input
                  type="number"
                  value={value === undefined ? "" : value}
                  onChange={(e) => handleValueChange(row.original.id, "q4", e.target.value)}
                  className="h-8 w-24 text-right"
                  aria-label={`${row.original.title} ${quarterLabels[3]}`}
                />
              )}
            </div>
          )
        },
      },
      // Cumulative Balance Column
      {
        accessorKey: "cumulativeBalance",
        header: "Cumulative Balance",
        cell: ({ row }) => {
          const value = row.original.cumulativeBalance
          const isCategory = row.original.isCategory
          const formattedValue = value !== undefined ? value.toLocaleString() : ""
          
          return (
            <div className={cn("text-right", isCategory && "font-bold")}>
              {formattedValue}
            </div>
          )
        },
      },
      // Comments Column
      {
        accessorKey: "comment",
        header: "Comment",
        cell: ({ row }) => {
          const comment = row.original.comment || ""
          const isEditable = row.original.isEditable !== false
          
          // Don't show comments for categories
          if (row.original.isCategory) {
            return null
          }
          
          return (
            <div>
              {comment && !isEditable || readOnly ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm text-blue-600 cursor-help underline underline-offset-4">
                        View comment
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{comment}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : !readOnly && isEditable ? (
                <Input
                  value={comment}
                  onChange={(e) => handleCommentChange(row.original.id, e.target.value)}
                  className="h-8 w-32"
                  placeholder="Add comment..."
                  aria-label={`Comment for ${row.original.title}`}
                />
              ) : null}
            </div>
          )
        },
      },
    ]
  }, [expandedRows, handleToggleExpand, handleValueChange, handleCommentChange, fiscalYear, readOnly])
  
  const table = useReactTable({
    data: flattenedRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={header.id.includes('balance') || header.id.includes('q') ? "text-right" : ""}>
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    row.original.isCategory && "bg-muted/50"
                  )}
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
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {!readOnly && onSave && (
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={!isDirty}
            className={cn(!isDirty && "opacity-50")}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  )
}

// Helper function to expand all nodes
export function expandAllNodes(data: FinancialRow[]): Set<string> {
  const result = new Set<string>()
  
  // Recursively collect all node IDs
  const collectIds = (rows: FinancialRow[]) => {
    for (const row of rows) {
      if (row.children && row.children.length > 0) {
        result.add(row.id)
        collectIds(row.children)
      }
    }
  }
  
  collectIds(data)
  return result
}

// Generate table with expanded sample data for preview/report
export function FinancialReportTable({ 
  data,
  fiscalYear = "2023" 
}: Omit<FinancialTableProps, 'onSave' | 'readOnly'>) {
  // Generate initial data if not provided
  const initialData = useMemo(() => {
    if (data) return data
    return calculateHierarchicalTotals(generateEmptyFinancialTemplate())
  }, [data])
  
  // Pre-expand all nodes for the report view
  const allExpandedRows = useMemo(() => expandAllNodes(initialData), [initialData])
  
  return (
    <FinancialTable 
      data={initialData} 
      fiscalYear={fiscalYear} 
      readOnly={true} 
      expandedRows={allExpandedRows} 
    />
  )
} 