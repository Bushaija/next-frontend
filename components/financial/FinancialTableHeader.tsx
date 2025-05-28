import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { z } from "zod";

// Zod schema for validation
export const FinancialTableHeaderSchema = z.object({
  columns: z.array(z.object({
    key: z.string(),
    label: z.string(),
    className: z.string().optional(),
    scope: z.enum(["col", "row"]).optional(),
  })),
  className: z.string().optional(),
  id: z.string().optional(),
});

// Type derived from Zod schema
export type FinancialTableHeaderProps = z.infer<typeof FinancialTableHeaderSchema>;

export function FinancialTableHeader({ 
  columns, 
  className,
  id = "financial-table-heading"
}: FinancialTableHeaderProps) {
  return (
    <TableHeader className={cn("bg-muted/50", className)} id={id}>
      <TableRow>
        {columns.map((column) => (
          <TableHead 
            key={column.key} 
            className={cn(
              "font-semibold text-foreground whitespace-nowrap",
              { "text-right": column.key !== "description" && column.key !== "note" },
              column.className
            )}
            scope={column.scope || "col"}
            aria-label={column.label}
          >
            {column.label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
} 