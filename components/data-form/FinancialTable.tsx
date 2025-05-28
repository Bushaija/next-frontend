"use client"

import React, { useCallback, useEffect, useRef, useMemo, useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useForm, FormProvider } from "react-hook-form"
import { usePathname, useSearchParams } from "next/navigation"
import { toast, Toaster } from "sonner"

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { 
  FinancialRow, 
  generateEmptyFinancialTemplate, 
  calculateHierarchicalTotals,
} from "./schema/financial-report"
import { NumericInputCell } from "./NumericInputCell"
import { useLocalStorage } from "./hooks"
import { FinancialTableProps, FinancialReportData } from "./types"

// Auto-save delay in milliseconds
const AUTOSAVE_DELAY = 30000 // 30 seconds

// Helper function to generate quarter labels based on the fiscal year
const generateQuarterLabels = (baseYear: string) => {
  return [
    `Q1 (Jan-Mar ${baseYear})`,
    `Q2 (Apr-Jun ${baseYear})`,
    `Q3 (Jul-Sep ${baseYear})`,
    `Q4 (Oct-Dec ${baseYear})`,
  ]
}

export function FinancialTable({
  data: initialData,
  fiscalYear = "2023",
  onSave,
  readOnly = false,
  expandedRowIds: initialExpandedRowIds,
  reportMetadata,
  // Selection props
  // healthCenters = [],
  // reportingPeriods = [],
  selectedHealthCenter,
  selectedReportingPeriod,
  isHospitalMode = false,
  // onHealthCenterChange,
  // onReportingPeriodChange,
}: FinancialTableProps) {
  const searchParams = useSearchParams();
  const [showFinancialForm, setShowFinancialForm] = useState<boolean>(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(
    new Set(initialExpandedRowIds || [])
  );
  const [isDirty, setIsDirty] = useState(false);

  // Get metadata from query parameters
  const facilityType = searchParams.get('facilityType') || '';
  const facilityName = searchParams.get('facilityName') || selectedHealthCenter || '';
  const district = searchParams.get('district') || reportMetadata?.district || '';

  // Handle form methods
  const methods = useForm<FinancialReportData>({
    defaultValues: {
      tableData: [],
      metadata: {
        healthCenter: facilityName,
        district: district,
        project: reportMetadata?.project,
        reportingPeriod: selectedReportingPeriod,
        fiscalYear
      }
    }
  });

  // We need to track when parent props change, so we can update our state accordingly
  useEffect(() => {
    // Only update if it's due to external changes, not our internal state changes
    const hasRequiredSelections = readOnly || (
      (isHospitalMode || (selectedHealthCenter && selectedHealthCenter !== "")) && 
      (selectedReportingPeriod && selectedReportingPeriod !== "")
    );
    
    // Only go back to selection form if selections were reset and we're not in readOnly mode
    if (!hasRequiredSelections && showFinancialForm && !readOnly) {
      // Selections were reset, go back to selection form
      setShowFinancialForm(false);
    }
    
    // IMPORTANT: We are NOT auto-advancing to the financial form when selections are complete
    // This is by design - the user must click the continue button in FormSection
    
  }, [selectedHealthCenter, selectedReportingPeriod, isHospitalMode, readOnly, showFinancialForm]);
  
  // Initialize with either the provided data or an empty template
  const defaultData = useMemo(() => {
    return initialData || calculateHierarchicalTotals(generateEmptyFinancialTemplate());
  }, [initialData]);
  
  // Get local storage key for this specific financial table
  const localStorageKey = useMemo(() => {
    return `financial_form_${selectedHealthCenter || 'default'}_${selectedReportingPeriod || 'default'}`;
  }, [selectedHealthCenter, selectedReportingPeriod]);
  
  // Use our custom hook to handle localStorage
  const { 
    value: storedFormData, 
    setValue: setStoredFormData, 
    removeValue: removeDraft
  } = useLocalStorage<{
    formData: FinancialRow[];
    timestamp: number;
  } | null>(localStorageKey, null, {
    expirationHours: 24,
    skipLoading: readOnly,
    onSaveSuccess: () => {
      toast.success("Draft saved", {
        description: "Your changes have been saved as a draft",
        duration: 3000,
      });
    },
    onSaveError: () => {
      toast.error("Failed to save draft", {
        description: "An error occurred while saving",
        duration: 4000,
      });
    },
    onLoadError: () => {
      toast.error("Failed to load draft", {
        description: "An error occurred while loading saved data",
        duration: 4000,
      });
    }
  });
  
  // Extract form data from localStorage or use default data
  const [formData, setFormData] = useState<FinancialRow[]>(() => {
    if (storedFormData?.formData && !readOnly) {
      return storedFormData.formData;
    }
    return defaultData;
  });
  
  // Update localStorage when form data changes
  const saveDraftToLocalStorage = useCallback(() => {
    if (readOnly) return;
    
    setStoredFormData({
      formData,
      timestamp: Date.now()
    });
  }, [formData, setStoredFormData, readOnly]);
  
  // Auto-save timer reference
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Get pathname for navigation checking
  const pathname = usePathname()
  
  // Setup navigation warning for unsaved changes
  useEffect(() => {
    if (!isDirty || readOnly) return;
    
    // Function to handle beforeunload event
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = "You have unsaved changes. Are you sure you want to leave?"
      return e.returnValue
    }
    
    // Add listener for browser navigation
    window.addEventListener("beforeunload", handleBeforeUnload)
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isDirty, readOnly])
  
  // Handle clicks on internal links
  useEffect(() => {
    if (!isDirty || readOnly) return;
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href.includes(window.location.origin) && !link.href.includes(pathname)) {
        if (!window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
          e.preventDefault();
        }
      }
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [isDirty, pathname, readOnly]);
  
  // Setup auto-save functionality
  useEffect(() => {
    if (!isDirty || readOnly) return;
    
    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    
    // Set a new timer for auto-save
    autoSaveTimerRef.current = setTimeout(() => {
      saveDraftToLocalStorage()
      
      // Show autosave toast
      toast("Autosaved", {
        description: "Your changes have been automatically saved as a draft",
        duration: 2000,
      })
    }, AUTOSAVE_DELAY)
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [formData, isDirty, readOnly, saveDraftToLocalStorage])
  
  // Watch for form changes and update the main data
  useEffect(() => {
    if (readOnly) return;

    let timeoutId: NodeJS.Timeout;
    
    // Skip the type definitions to avoid TypeScript errors
    const subscription = methods.watch((value) => {
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Debounce the update to prevent rapid re-renders
      timeoutId = setTimeout(() => {
        // Use a more specific type instead of 'any'
        const formValues = value as { rows?: Record<string, { 
          q1?: string;
          q2?: string;
          q3?: string;
          q4?: string;
          comments?: string;
        } | undefined> };
        
        if (!formValues?.rows) return;
        
        // Apply form values back to the main data model
        const updateRowsWithFormValues = (rows: FinancialRow[]): FinancialRow[] => {
          return rows.map(row => {
            const rowId = row.id as string;
            if (formValues.rows && rowId in formValues.rows) {
              const rowFormValues = formValues.rows[rowId];
              if (!rowFormValues) return row;
              
              const updatedRow = { ...row };
              let hasChanges = false;
              
              // Only update fields that exist and can be converted to numbers
              if (rowFormValues.q1 !== undefined) {
                const numValue = rowFormValues.q1 === '' ? undefined : parseFloat(rowFormValues.q1);
                if (numValue !== row.q1) {
                  updatedRow.q1 = numValue;
                  hasChanges = true;
                }
              }
              if (rowFormValues.q2 !== undefined) {
                const numValue = rowFormValues.q2 === '' ? undefined : parseFloat(rowFormValues.q2);
                if (numValue !== row.q2) {
                  updatedRow.q2 = numValue;
                  hasChanges = true;
                }
              }
              if (rowFormValues.q3 !== undefined) {
                const numValue = rowFormValues.q3 === '' ? undefined : parseFloat(rowFormValues.q3);
                if (numValue !== row.q3) {
                  updatedRow.q3 = numValue;
                  hasChanges = true;
                }
              }
              if (rowFormValues.q4 !== undefined) {
                const numValue = rowFormValues.q4 === '' ? undefined : parseFloat(rowFormValues.q4);
                if (numValue !== row.q4) {
                  updatedRow.q4 = numValue;
                  hasChanges = true;
                }
              }
              if (rowFormValues.comments !== row.comments) {
                updatedRow.comments = rowFormValues.comments;
                hasChanges = true;
              }
              
              if (row.children) {
                const updatedChildren = updateRowsWithFormValues(row.children);
                if (updatedChildren !== row.children) {
                  updatedRow.children = updatedChildren;
                  hasChanges = true;
                }
              }
              
              return hasChanges ? updatedRow : row;
            }
            
            if (row.children) {
              const updatedChildren = updateRowsWithFormValues(row.children);
              return updatedChildren !== row.children ? { ...row, children: updatedChildren } : row;
            }
            
            return row;
          });
        };
        
        const updatedData = updateRowsWithFormValues(formData);
        const hasChanges = JSON.stringify(updatedData) !== JSON.stringify(formData);
        
        if (hasChanges) {
          const calculatedData = calculateHierarchicalTotals(updatedData);
          setFormData(calculatedData);
          setIsDirty(true);
        }
      }, 300); // 300ms debounce
    });
    
    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [formData, methods, readOnly]);
  
  // Flatten the hierarchical data for display in the table
  const flattenedRows = useMemo(() => {
    const flattened: Array<FinancialRow & { depth: number }> = []
    
    const flatten = (rows: FinancialRow[], depth = 0) => {
      for (const row of rows) {
        // Add the current row with its depth
        flattened.push({ ...row, depth })
        
        // If this row has children and is expanded, add those too
        if (row.children && expandedRows.has(row.id)) {
          flatten(row.children, depth + 1)
        }
      }
    }
    
    flatten(formData)
    return flattened
  }, [formData, expandedRows])
  
  // Handle toggling row expansion
  const handleToggleExpand = useCallback((rowId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(rowId)) {
        newSet.delete(rowId)
      } else {
        newSet.add(rowId)
      }
      return newSet
    })
  }, [])
  
  // Handle updating a comment
  const handleCommentChange = useCallback((rowId: string, comment: string) => {
    if (readOnly) return;
    
    // Find the index of the row in the flattened data
    const rowIndex = flattenedRows.findIndex(row => row.id === rowId);
    if (rowIndex === -1) return;
    
    methods.setValue(`tableData.${rowIndex}.comments`, comment, {
      shouldDirty: true
    });
  }, [methods, readOnly, flattenedRows]);
  
  // Generate column definitions for our financial table
  const columns = useMemo<ColumnDef<FinancialRow & { depth: number }>[]>(() => {
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
                  {expandedRows.has(row.original.id) ? (
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
            <div className="text-center">
              {(isCategory || !isEditable || readOnly) ? (
                <span className={cn(isCategory && "font-bold")}>
                  {formattedValue}
                </span>
              ) : (
                <div className="flex items-center justify-center">
                  <NumericInputCell 
                    rowId={row.original.id}
                    field="q1"
                    value={value}
                    readOnly={readOnly}
                    label={`${row.original.title} ${quarterLabels[0]}`}
                  />
                </div>
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
            <div className="text-center">
              {(isCategory || !isEditable || readOnly) ? (
                <span className={cn(isCategory && "font-bold")}>
                  {formattedValue}
                </span>
              ) : (
                <div className="flex items-center justify-center">
                  <NumericInputCell 
                    rowId={row.original.id}
                    field="q2"
                    value={value}
                    readOnly={readOnly}
                    label={`${row.original.title} ${quarterLabels[1]}`}
                />
                </div>
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
            <div className="text-center">
              {(isCategory || !isEditable || readOnly) ? (
                <span className={cn(isCategory && "font-bold")}>
                  {formattedValue}
                </span>
              ) : (
                <div className="flex items-center justify-center">
                  <NumericInputCell 
                    rowId={row.original.id}
                    field="q3"
                    value={value}
                    readOnly={readOnly}
                    label={`${row.original.title} ${quarterLabels[2]}`}
                />
                </div>
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
            <div className="text-center">
              {(isCategory || !isEditable || readOnly) ? (
                <span className={cn(isCategory && "font-bold")}>
                  {formattedValue}
                </span>
              ) : (
                <div className="flex items-center justify-center">
                  <NumericInputCell 
                    rowId={row.original.id}
                    field="q4"
                    value={value}
                    readOnly={readOnly}
                    label={`${row.original.title} ${quarterLabels[3]}`}
                />
                </div>
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
            <div className={cn("text-center", isCategory && "font-bold")}>
              {formattedValue}
            </div>
          )
        },
      },
      // Comments Column
      {
        accessorKey: "comments",
        header: "Comment",
        cell: ({ row }) => {
          const comment = row.original.comments || ""
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
                      <p className="max-w-xs text-center">{comment}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : !readOnly && isEditable ? (
                <Input
                  value={comment}
                  onChange={(e) => handleCommentChange(row.original.id, e.target.value)}
                  className="h-8 w-52"
                  placeholder="Add comment..."
                  aria-label={`Comment for ${row.original.title}`}
                />
              ) : null}
            </div>
          )
        },
      },
    ]
  }, [expandedRows, handleToggleExpand, handleCommentChange, fiscalYear, readOnly])
  
  // Memoize the table instance to prevent unnecessary re-renders
  const tableConfig = useMemo(() => ({
    data: flattenedRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Disable pagination to prevent state updates
    enablePagination: false,
  }), [flattenedRows, columns]);

  const table = useReactTable(tableConfig);
  
  // Memoize the save handler to prevent unnecessary re-renders
  const memoizedHandleSave = useCallback(() => {
    if (onSave) {
      try {
        // Create a structured data object with both table data and metadata
        const reportData: FinancialReportData = {
          tableData: formData,
          metadata: {
            healthCenter: facilityName,
            district: district,
            project: reportMetadata?.project,
            reportingPeriod: selectedReportingPeriod,
            fiscalYear
          }
        }
        
        onSave(reportData)
        setIsDirty(false)
        
        // Clear the draft from local storage when explicitly saved
        removeDraft()
        
        // Show success toast
        toast.success("Saved successfully", {
          description: "Your financial report has been saved",
          duration: 3000,
        })
      } catch (error) {
        console.error("Error saving data:", error)
        
        // Show error toast
        toast.error("Save failed", {
          description: "Could not save your financial report",
          duration: 4000,
        })
      }
    }
  }, [formData, onSave, facilityName, district, reportMetadata, selectedReportingPeriod, fiscalYear, removeDraft]);
  
  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        {/* Add Toaster component for toast notifications */}
        <Toaster richColors closeButton position="bottom-right" />
        
          {/* Status bar with auto-save notification */}
          {isDirty && !readOnly && (
            <div className="flex items-center justify-between bg-amber-50 p-2 rounded-md mb-4">
              <span className="text-amber-600 text-sm">
                You have unsaved changes
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={saveDraftToLocalStorage}
                  className="text-xs text-amber-700 hover:text-amber-900 underline"
                >
                  Save Draft
                </button>
            </div>
          </div>
        )}
      
        {/* Report Title and Metadata */}
        <div className="bg-white p-4 rounded-lg mb-4 bg-zinc-50">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl capitalize font-semibold">
              {facilityName} {facilityType ? `${facilityType}` : ''}
            </h2>
            {!readOnly && (
              <Button
                onClick={memoizedHandleSave}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={!isDirty}
              >
                Save Report
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-2 text-base text-gray-600">
            <div>
              <span className="font-medium">District:</span> {district}
            </div>
            <div>
              <span className="font-medium">Fiscal Year:</span> {fiscalYear}
            </div>
            {reportMetadata?.project && (
              <div>
                <span className="font-medium">Project:</span> {reportMetadata.project}
              </div>
            )}
          </div>
        </div>
        
        {/* Financial Data Table */}
          <div className="rounded-md border overflow-auto max-h-[calc(100vh-16rem)]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background border-b">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead 
                        key={header.id} 
                        className={cn(
                          header.id.includes('balance') || header.id.includes('q') ? "text-right" : "",
                          "whitespace-nowrap",
                          header.id === "title" && "sticky left-0 z-20 bg-background shadow-[1px_0_0_0_#e5e7eb]"
                        )}
                      >
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
                        <TableCell 
                          key={cell.id}
                          className={cn(
                            cell.column.id === "title" && "sticky left-0 bg-background shadow-[1px_0_0_0_#e5e7eb]",
                            row.original.isCategory && cell.column.id === "title" && "bg-muted/50"
                          )}
                        >
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
      </div>
    </FormProvider>
  );
} 