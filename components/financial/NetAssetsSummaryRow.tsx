import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import { z } from "zod";

// Zod schema for validation
export const NetAssetsSummaryRowSchema = z.object({
  label: z.string(),
  surplus: z.number().or(z.string()).nullish(),
  adjustments: z.number().or(z.string()).nullish(),
  total: z.number().or(z.string()).nullish(),
  formulaHint: z.string().optional(),
  className: z.string().optional(),
  isHighlighted: z.boolean().optional(),
  isFinal: z.boolean().optional(),
});

// Type derived from Zod schema
export type NetAssetsSummaryRowProps = z.infer<typeof NetAssetsSummaryRowSchema>;

// Function to calculate total from surplus and adjustments
const calculateTotal = (surplus: number | string | undefined | null, adjustments: number | string | undefined | null) => {
  const s = typeof surplus === 'number' ? surplus : parseFloat(surplus || '0') || 0;
  const a = typeof adjustments === 'number' ? adjustments : parseFloat(adjustments || '0') || 0;
  return s + a;
};

export function NetAssetsSummaryRow({ 
  label, 
  surplus, 
  adjustments,
  total,
  formulaHint,
  className,
  isHighlighted = false,
  isFinal = false
}: NetAssetsSummaryRowProps) {
  // Calculate the total if not provided
  const calculatedTotal = total ?? calculateTotal(surplus, adjustments);
  
  // Format number values as currency
  const formattedSurplus = typeof surplus === 'number' 
    ? formatCurrency(surplus) 
    : surplus || '';
    
  const formattedAdjustments = typeof adjustments === 'number' 
    ? formatCurrency(adjustments) 
    : adjustments || '';
    
  const formattedTotal = typeof calculatedTotal === 'number' 
    ? formatCurrency(calculatedTotal) 
    : calculatedTotal || '';

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
      <TableCell className={cn("p-3 text-right", (isHighlighted || isFinal) && "text-primary-500 print:text-black")}>
        {formattedSurplus}
      </TableCell>
      <TableCell className={cn("p-3 text-right", (isHighlighted || isFinal) && "text-primary-500 print:text-black")}>
        {formattedAdjustments}
      </TableCell>
      <TableCell className={cn("p-3 text-right", (isHighlighted || isFinal) && "text-primary-500 print:text-black")}>
        {formattedTotal}
      </TableCell>
    </TableRow>
  );
} 