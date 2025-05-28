import { Table, TableBody } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Children, ReactNode, isValidElement } from "react";
import { z } from "zod";

// Zod schema for validation
export const FinancialTableSchema = z.object({
  children: z.any(),
  className: z.string().optional(),
  caption: z.string().optional(),
  ariaLabel: z.string().optional(),
});

// Type derived from Zod schema
export type FinancialTableProps = {
  children: ReactNode;
  className?: string;
  caption?: string;
  ariaLabel?: string;
};

export function FinancialTable({ 
  children, 
  className,
  caption,
  ariaLabel = "Financial statement table" 
}: FinancialTableProps) {
  // Extract header and body content
  const childrenArray = Children.toArray(children);
  
  // Find the header component - checking for columns prop which is unique to FinancialTableHeader
  const headerComponent = childrenArray.find(child => 
    isValidElement(child) && 
    child.props !== null &&
    typeof child.props === 'object' &&
    'columns' in child.props
  );
  
  // Get all non-header components for body
  const bodyContent = childrenArray.filter(child => 
    !(isValidElement(child) && 
      child.props !== null &&
      typeof child.props === 'object' &&
      'columns' in child.props)
  );
  
  return (
    <div className="w-full overflow-auto" role="region" aria-label={ariaLabel}>
      <Table 
        className={cn("border-collapse", className)} 
        aria-labelledby="financial-table-heading"
      >
        {caption && (
          <caption className="sr-only">
            {caption}
          </caption>
        )}
        {/* Place header outside the tbody */}
        {headerComponent}
        <TableBody>
          {bodyContent}
        </TableBody>
      </Table>
    </div>
  );
} 