import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { z } from "zod";

// Zod schema for validation
export const FinancialSubsectionGroupSchema = z.object({
  title: z.string(),
  children: z.any(),
  className: z.string().optional(),
  colSpan: z.number().optional(),
});

// Type derived from Zod schema
export type FinancialSubsectionGroupProps = {
  title: string;
  children: ReactNode;
  className?: string;
  colSpan?: number;
};

export function FinancialSubsectionGroup({ 
  title, 
  children, 
  className, 
  colSpan = 4 
}: FinancialSubsectionGroupProps) {
  // Using React.Fragment instead of TableBody to avoid nesting tbody elements
  return (
    <>
      <tr className="border-b">
        <td 
          colSpan={colSpan} 
          className={cn("p-3 font-medium text-muted-foreground", className)}
        >
          {title}
        </td>
      </tr>
      {children}
    </>
  );
} 