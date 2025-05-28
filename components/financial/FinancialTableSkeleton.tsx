import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface FinancialTableSkeletonProps {
  rowCount?: number;
  columnCount?: number;
  headerLabels?: string[];
  className?: string;
}

export function FinancialTableSkeleton({
  rowCount = 10,
  columnCount = 4,
  headerLabels = ["Description", "Note", "FY 2024/2025", "FY 2023/2024"],
  className,
}: FinancialTableSkeletonProps) {
  return (
    <div className={cn("w-full overflow-auto animate-pulse", className)}>
      <Table className="border-collapse">
        <TableHeader className="bg-muted/50">
          <TableRow>
            {headerLabels.map((label, index) => (
              <TableCell key={index} className="font-semibold">
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Section title */}
          <TableRow className="border-t border-b">
            <TableCell colSpan={columnCount} className="py-3">
              <div className="h-4 bg-muted rounded w-1/4" />
            </TableCell>
          </TableRow>
          
          {/* Regular rows */}
          {Array.from({ length: rowCount }).map((_, index) => (
            <TableRow key={index} className="odd:bg-muted/10">
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <TableCell key={colIndex} className="py-2">
                  <div 
                    className={cn(
                      "h-4 bg-muted rounded",
                      colIndex === 0 ? "w-3/4" : "w-1/2"
                    )} 
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
          
          {/* Summary row */}
          <TableRow className="border-t border-b bg-muted/30">
            {Array.from({ length: columnCount }).map((_, colIndex) => (
              <TableCell key={colIndex} className="py-3">
                <div 
                  className={cn(
                    "h-4 bg-muted rounded",
                    colIndex === 0 ? "w-3/4" : "w-1/2"
                  )} 
                />
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
} 