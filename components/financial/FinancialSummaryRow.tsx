import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import { z } from "zod";

// Zod schema for validation
export const FinancialSummaryRowSchema = z.object({
  label: z.string(),
  note: z.string().optional(),
  fy2024Value: z.number().or(z.string()).nullish(),
  fy2023Value: z.number().or(z.string()).nullish(),
  formulaHint: z.string().optional(),
  className: z.string().optional(),
  isHighlighted: z.boolean().optional(),
  isFinal: z.boolean().optional(),
});

// Type derived from Zod schema
export type FinancialSummaryRowProps = z.infer<typeof FinancialSummaryRowSchema>;

export function FinancialSummaryRow({ 
  label, 
  note, 
  fy2024Value, 
  fy2023Value,
  formulaHint,
  className,
  isHighlighted = false,
  isFinal = false
}: FinancialSummaryRowProps) {
  // Format number values as currency
  const formattedFy2024 = typeof fy2024Value === 'number' 
    ? formatCurrency(fy2024Value) 
    : fy2024Value || '';
    
  const formattedFy2023 = typeof fy2023Value === 'number' 
    ? formatCurrency(fy2023Value) 
    : fy2023Value || '';

  return (
    <TableRow 
      className={cn(
        "font-bold border-t border-b",
        isHighlighted && "bg-primary/5", 
        isFinal && "bg-primary/15 border-t-2 border-primary/30",
        !isHighlighted && !isFinal && "bg-muted/30",
        "print:border-gray-300",
        isHighlighted && "print:bg-gray-100",
        isFinal && "print:bg-gray-200 print:border-t-2 print:border-gray-400",
        className
      )}
    >
      <TableCell className="p-3">
        {label} {formulaHint && <span className="text-muted-foreground font-normal ml-2 text-sm print:text-gray-600">{formulaHint}</span>}
      </TableCell>
      <TableCell className="p-3 text-center">
        {note}
      </TableCell>
      <TableCell className={cn("p-3 text-right", (isHighlighted || isFinal) && "text-primary-500 print:text-black")}>
        {formattedFy2024}
      </TableCell>
      <TableCell className={cn("p-3 text-right", (isHighlighted || isFinal) && "text-primary-500 print:text-black")}>
        {formattedFy2023}
      </TableCell>
    </TableRow>
  );
} 