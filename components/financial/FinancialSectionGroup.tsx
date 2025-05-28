import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { z } from "zod";

// Zod schema for validation
export const FinancialSectionGroupSchema = z.object({
  title: z.string(),
  children: z.any(),
  className: z.string().optional(),
  colSpan: z.number().optional(),
});

// Type derived from Zod schema
export type FinancialSectionGroupProps = {
  title: string;
  children: ReactNode;
  className?: string;
  colSpan?: number;
};

export function FinancialSectionGroup({ title, children, className, colSpan = 4 }: FinancialSectionGroupProps) {
  // Using React.Fragment instead of TableBody to avoid nesting tbody elements
  return (
    <>
      <tr className="border-t border-b">
        <td 
          colSpan={colSpan} 
          className="p-4 font-bold"
        >
          {title}
        </td>
      </tr>
      {children}
    </>
  );
} 