import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { z } from "zod";

// Zod schema for validation
export const SeparatorRowSchema = z.object({
  colSpan: z.number().optional(),
  className: z.string().optional(),
});

// Type derived from Zod schema
export type SeparatorRowProps = z.infer<typeof SeparatorRowSchema>;

export function SeparatorRow({ colSpan = 4, className }: SeparatorRowProps) {
  return (
    <TableRow className={cn("h-4", className)}>
      <TableCell className="p-0" colSpan={colSpan} />
    </TableRow>
  );
} 